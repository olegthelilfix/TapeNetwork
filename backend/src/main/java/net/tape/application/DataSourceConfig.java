package net.tape.application;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

/**
 * Builds the Hikari pool's config fully, as a plain {@link HikariConfig}, before any
 * {@link HikariDataSource} exists, then constructs the pool from that complete config
 * in one step.
 *
 * <p>Spring Boot's default auto-configuration does the opposite: it constructs a lazy
 * {@code HikariDataSource} first, and binds {@code spring.datasource.hikari.*} onto it
 * afterward. In this app, Flyway's own bean creation reaches that DataSource early
 * enough that the pool opens its first connection (sealing its config) before the
 * second-phase binding finishes, so binding any property beyond the first couple
 * throws "the configuration of the pool is sealed once started." Binding onto a plain
 * config object here, then handing the finished config to HikariDataSource's eager
 * constructor, removes that window: the pool never exists until every property,
 * including the env-var overrides added by this change, is already set.
 *
 * <p><strong>Known test gap:</strong> {@code HikariPoolPropertiesTest} binds
 * {@code spring.datasource.hikari.*} onto its own {@code HikariConfig} directly from
 * {@code application.yml}, independent of this class, so it would not catch a
 * regression of the bug this class fixes (for example, deleting this class, or a
 * future Spring Boot upgrade changing auto-configuration precedence back to the
 * unsafe default). Closing that gap needs a real Spring context boot, which this repo
 * has no infrastructure for today (no {@code @SpringBootTest}, no Testcontainers, and
 * CI's backend job runs with no Postgres service). A {@code @SpringBootTest(webEnvironment
 * = NONE)} smoke test backed by Testcontainers would close it; track that as a
 * follow-up rather than adding that infrastructure here.
 */
@Configuration
public class DataSourceConfig {

    @Bean
    @ConfigurationProperties("spring.datasource.hikari")
    public HikariConfig hikariConfig(DataSourceProperties dataSourceProperties) {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(dataSourceProperties.determineUrl());
        config.setUsername(dataSourceProperties.determineUsername());
        config.setPassword(dataSourceProperties.determinePassword());
        config.setDriverClassName(dataSourceProperties.determineDriverClassName());
        return config;
    }

    @Bean
    public DataSource dataSource(HikariConfig hikariConfig) {
        return new HikariDataSource(hikariConfig);
    }
}
