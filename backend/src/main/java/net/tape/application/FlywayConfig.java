package net.tape.application;

import org.flywaydb.core.Flyway;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Opt-in Flyway startup strategies for non-production databases, selected by
 * {@code tape.flyway.strategy} (env {@code FLYWAY_STRATEGY}). Default {@code none}
 * registers no bean, so production keeps Flyway's strict validate-then-migrate — a
 * checksum mismatch there is a real signal that an applied migration was altered.
 *
 * <p>Local Postgres volumes and long-lived test stacks outlive branch switches, so a
 * migration whose checksum changed (an unreleased migration edited in place, or two
 * branches with a different {@code V<n>}) makes validate abort startup. The strategies:
 *
 * <ul>
 *   <li>{@code repair} — {@link org.flywaydb.core.Flyway#repair() repair} (realign
 *       checksums, drop failed entries) then {@link org.flywaydb.core.Flyway#migrate()
 *       migrate}. Non-destructive: keeps existing data. Good for local dev.</li>
 *   <li>{@code clean} — {@link org.flywaydb.core.Flyway#clean() clean} (drop everything)
 *       then migrate, rebuilding the schema from {@code V1..V<n>} on every boot. For
 *       ephemeral/throwaway test stacks where "deploy anything" must always match the
 *       code. <strong>Destroys all data each start.</strong> Requires
 *       {@code spring.flyway.clean-disabled=false} (set {@code FLYWAY_CLEAN_DISABLED=false}).</li>
 * </ul>
 */
@Configuration
public class FlywayConfig {

    /** Non-destructive self-heal: repair drifted checksums, then migrate. */
    @Bean
    @ConditionalOnProperty(prefix = "tape.flyway", name = "strategy", havingValue = "repair")
    public FlywayMigrationStrategy repairThenMigrate() {
        return flyway -> {
            flyway.repair();
            flyway.migrate();
        };
    }

    /**
     * Ephemeral test stacks: wipe the schema and rebuild it from the migrations.
     * Enabling this strategy is itself the explicit opt-in to a destructive clean, so
     * it runs clean() through a copy of the Flyway config with {@code cleanDisabled=false}
     * — no separate {@code FLYWAY_CLEAN_DISABLED} needed. The app's own Flyway bean keeps
     * clean disabled, so nothing else can wipe the DB.
     */
    @Bean
    @ConditionalOnProperty(prefix = "tape.flyway", name = "strategy", havingValue = "clean")
    public FlywayMigrationStrategy cleanThenMigrate() {
        return flyway -> {
            Flyway.configure()
                .configuration(flyway.getConfiguration())
                .cleanDisabled(false)
                .load()
                .clean();
            flyway.migrate();
        };
    }
}
