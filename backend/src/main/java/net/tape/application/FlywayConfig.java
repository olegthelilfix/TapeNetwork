package net.tape.application;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Opt-in Flyway resilience for development databases.
 *
 * <p>Local Postgres volumes outlive branch switches, so a migration whose checksum
 * changed (an unreleased migration edited in place, or two branches with a different
 * {@code V<n>}) makes Flyway's validate step abort startup. When
 * {@code tape.flyway.repair-on-migrate=true} this registers a migration strategy that
 * runs {@link org.flywaydb.core.Flyway#repair() repair} (realign checksums, drop failed
 * entries) before {@link org.flywaydb.core.Flyway#migrate() migrate}, so a dev backend
 * self-heals instead of refusing to boot.
 *
 * <p><strong>Default is off</strong> — production keeps Flyway's strict validate-then-migrate
 * behaviour, where a checksum mismatch is a real signal that an applied migration was
 * altered. Only the docker-compose dev stack turns it on (via {@code FLYWAY_REPAIR_ON_MIGRATE}).
 * The rollback case (a migration applied in the DB but absent locally) is handled separately
 * by {@code spring.flyway.ignore-migration-patterns} (e.g. {@code *:missing}).
 */
@Configuration
@ConditionalOnProperty(prefix = "tape.flyway", name = "repair-on-migrate", havingValue = "true")
public class FlywayConfig {

    @Bean
    public FlywayMigrationStrategy repairThenMigrate() {
        return flyway -> {
            flyway.repair();
            flyway.migrate();
        };
    }
}
