package net.tape.application;

import com.zaxxer.hikari.HikariConfig;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.boot.context.properties.bind.Bindable;
import org.springframework.boot.context.properties.bind.Binder;
import org.springframework.boot.env.YamlPropertySourceLoader;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.env.PropertySource;
import org.springframework.core.env.StandardEnvironment;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;

import java.io.IOException;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Binds application.yml's {@code spring.datasource.hikari} block onto a plain
 * {@link HikariConfig}, never a {@code HikariDataSource}, so no pool starts and
 * no database connection is attempted.
 *
 * <p>Checks four things: the six configured pool defaults; the exact set of
 * six key names, not just a count; that each key's own env var resolves an
 * override, not just {@code maximum-pool-size}'s; and that
 * {@code application.yml}, {@code .env.example}, and
 * {@code docker-compose.yml} agree on the same six values, so the three
 * files can't quietly drift apart.
 */
class HikariPoolPropertiesTest {

    private static final String POOL_NAME = "TapeHikariPool";
    private static final int MAXIMUM_POOL_SIZE = 20;
    private static final int MINIMUM_IDLE = 10;
    private static final long CONNECTION_TIMEOUT = 30_000L;
    private static final long IDLE_TIMEOUT = 600_000L;
    private static final long MAX_LIFETIME = 1_800_000L;

    // Order matches the required .env.example layout: immediately after
    // SPRING_DATASOURCE_PASSWORD, in this exact order.
    private static final List<Map.Entry<String, String>> HIKARI_ENV_VARS = List.of(
            Map.entry("SPRING_DATASOURCE_HIKARI_POOL_NAME", POOL_NAME),
            Map.entry("SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE", String.valueOf(MAXIMUM_POOL_SIZE)),
            Map.entry("SPRING_DATASOURCE_HIKARI_MINIMUM_IDLE", String.valueOf(MINIMUM_IDLE)),
            Map.entry("SPRING_DATASOURCE_HIKARI_CONNECTION_TIMEOUT", String.valueOf(CONNECTION_TIMEOUT)),
            Map.entry("SPRING_DATASOURCE_HIKARI_IDLE_TIMEOUT", String.valueOf(IDLE_TIMEOUT)),
            Map.entry("SPRING_DATASOURCE_HIKARI_MAX_LIFETIME", String.valueOf(MAX_LIFETIME)));

    @Test
    void bindsConfiguredPoolDefaults() {
        ConfigurableEnvironment env = loadApplicationYamlEnvironment();
        HikariConfig bound = bindHikariConfig(env);

        assertEquals(POOL_NAME, bound.getPoolName());
        assertEquals(MAXIMUM_POOL_SIZE, bound.getMaximumPoolSize());
        assertEquals(MINIMUM_IDLE, bound.getMinimumIdle());
        assertEquals(CONNECTION_TIMEOUT, bound.getConnectionTimeout());
        assertEquals(IDLE_TIMEOUT, bound.getIdleTimeout());
        assertEquals(MAX_LIFETIME, bound.getMaxLifetime());

        // Checks that all 6 setting names are spelled exactly right, not
        // just that there are 6 settings. A typo in one name would break
        // that setting silently: Spring would ignore the misspelled entry,
        // and HikariCP would quietly fall back to its own default value
        // instead. For idle-timeout, connection-timeout, and max-lifetime,
        // that default happens to match our own configured value, so the
        // checks above alone would not catch the typo.
        Map<String, Object> rawKeys = Binder.get(env)
                .bind("spring.datasource.hikari", Bindable.mapOf(String.class, Object.class))
                .orElseGet(Map::of);
        assertEquals(
                Set.of("pool-name", "maximum-pool-size", "minimum-idle",
                        "connection-timeout", "idle-timeout", "max-lifetime"),
                rawKeys.keySet());
    }

    // One case per pool setting: proves each setting's own env var, not
    // just maximum-pool-size's, actually resolves an override. A typo in
    // any one setting's env-var name would leave that setting stuck on its
    // YAML default, impossible to override, and nothing else in this class
    // would catch it.
    @ParameterizedTest(name = "{0} overrides its HikariConfig getter")
    @MethodSource("envVarOverrideCases")
    void envVarOverridesConfiguredDefault(String envVarName, String overrideValue, Object expected,
            Function<HikariConfig, Object> getter) {
        ConfigurableEnvironment env = loadApplicationYamlEnvironment();
        env.getPropertySources().addFirst(new MapPropertySource("override",
                Map.of(envVarName, overrideValue)));

        HikariConfig overridden = bindHikariConfig(env);

        assertEquals(expected, getter.apply(overridden));
    }

    private static Stream<Arguments> envVarOverrideCases() {
        return Stream.of(
                Arguments.of("SPRING_DATASOURCE_HIKARI_POOL_NAME", "OverriddenPool", "OverriddenPool",
                        (Function<HikariConfig, Object>) HikariConfig::getPoolName),
                Arguments.of("SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE", "42", 42,
                        (Function<HikariConfig, Object>) HikariConfig::getMaximumPoolSize),
                Arguments.of("SPRING_DATASOURCE_HIKARI_MINIMUM_IDLE", "7", 7,
                        (Function<HikariConfig, Object>) HikariConfig::getMinimumIdle),
                Arguments.of("SPRING_DATASOURCE_HIKARI_CONNECTION_TIMEOUT", "12345", 12345L,
                        (Function<HikariConfig, Object>) HikariConfig::getConnectionTimeout),
                Arguments.of("SPRING_DATASOURCE_HIKARI_IDLE_TIMEOUT", "54321", 54321L,
                        (Function<HikariConfig, Object>) HikariConfig::getIdleTimeout),
                Arguments.of("SPRING_DATASOURCE_HIKARI_MAX_LIFETIME", "999999", 999999L,
                        (Function<HikariConfig, Object>) HikariConfig::getMaxLifetime));
    }

    @Test
    void envExampleMatchesApplicationYamlDefaults() throws IOException, URISyntaxException {
        List<String> lines = Files.readAllLines(repoRootFromThisClass().resolve(".env.example"));

        int passwordLine = lines.indexOf("SPRING_DATASOURCE_PASSWORD=tape");
        assertTrue(passwordLine >= 0,
                () -> "expected to find SPRING_DATASOURCE_PASSWORD=tape in .env.example");

        // Position, order, and value in one check: the 6 lines must sit
        // immediately after SPRING_DATASOURCE_PASSWORD, in this exact order.
        List<String> expectedLines = HIKARI_ENV_VARS.stream()
                .map(var -> var.getKey() + "=" + var.getValue())
                .collect(Collectors.toList());
        List<String> actualLines = lines.subList(passwordLine + 1,
                Math.min(passwordLine + 1 + expectedLines.size(), lines.size()));
        assertEquals(expectedLines, actualLines,
                () -> ".env.example must declare the 6 SPRING_DATASOURCE_HIKARI_* lines, in this "
                        + "order, immediately after SPRING_DATASOURCE_PASSWORD");

        // Exact count, not just presence: a stray duplicate or conflicting
        // line for the same setting elsewhere in the file must not go unnoticed.
        for (Map.Entry<String, String> var : HIKARI_ENV_VARS) {
            long occurrences = lines.stream().filter(line -> line.startsWith(var.getKey() + "=")).count();
            assertEquals(1, occurrences,
                    () -> var.getKey() + " must appear exactly once in .env.example, found " + occurrences);
        }
    }

    // docker-compose.yml declares these same 6 defaults a third time, as
    // backend.environment fallback values, with no env_file: directive. An
    // override placed in .env only reaches the container if it's named here.
    // Reuses the same HIKARI_ENV_VARS constants as the .env.example check
    // above, so all three files stay pinned to one set of expected values.
    @Test
    void dockerComposeMatchesApplicationYamlDefaults() throws IOException, URISyntaxException {
        List<String> lines = Files.readAllLines(repoRootFromThisClass().resolve("docker-compose.yml"));

        for (Map.Entry<String, String> var : HIKARI_ENV_VARS) {
            String expected = var.getKey() + ": ${" + var.getKey() + ":-" + var.getValue() + "}";
            long occurrences = lines.stream().map(String::trim).filter(expected::equals).count();
            assertEquals(1, occurrences,
                    () -> "docker-compose.yml's backend.environment must declare \"" + expected
                            + "\" exactly once, found " + occurrences);
        }
    }

    private static ConfigurableEnvironment loadApplicationYamlEnvironment() {
        Resource yaml = new ClassPathResource("application.yml");
        List<PropertySource<?>> sources;
        try {
            sources = new YamlPropertySourceLoader().load("application", yaml);
        } catch (IOException e) {
            throw new IllegalStateException("could not load application.yml from the test classpath", e);
        }
        // A bare StandardEnvironment ships systemProperties/systemEnvironment
        // sources ahead of anything added below, so an ambient
        // SPRING_DATASOURCE_HIKARI_* env var on the host or CI runner would
        // silently win over application.yml's declared defaults. Strip both
        // before adding the loaded YAML, so this test's result depends only on
        // application.yml, never on the shell that happens to run it.
        ConfigurableEnvironment env = new StandardEnvironment();
        env.getPropertySources().remove(StandardEnvironment.SYSTEM_PROPERTIES_PROPERTY_SOURCE_NAME);
        env.getPropertySources().remove(StandardEnvironment.SYSTEM_ENVIRONMENT_PROPERTY_SOURCE_NAME);
        sources.forEach(env.getPropertySources()::addLast);
        return env;
    }

    private static HikariConfig bindHikariConfig(ConfigurableEnvironment env) {
        // orElseGet, not get(): if the spring.datasource.hikari block ever goes
        // missing or gets renamed in application.yml, Binder.bind() returns an
        // empty result, not a defaulted bean. Falling back to a bare
        // HikariConfig() turns that into a clear defaults mismatch in the
        // assertions above, instead of a raw NoSuchElementException that
        // doesn't say what broke.
        return Binder.get(env)
                .bind("spring.datasource.hikari", Bindable.of(HikariConfig.class))
                .orElseGet(HikariConfig::new);
    }

    // Resolve from where this compiled test class actually lives on disk, not
    // System.getProperty("user.dir"): a different test in this repo already hit
    // this same bug once, where a cwd-relative path only worked if the test
    // runner happened to be launched from a particular module directory.
    private static Path repoRootFromThisClass() throws URISyntaxException {
        Path dir = Path.of(HikariPoolPropertiesTest.class.getProtectionDomain()
                .getCodeSource().getLocation().toURI());
        while (dir != null && !Files.exists(dir.resolve(".env.example"))) {
            dir = dir.getParent();
        }
        if (dir == null) {
            throw new IllegalStateException(
                    "could not locate repo root (.env.example) above " + HikariPoolPropertiesTest.class);
        }
        return dir;
    }
}
