package net.tape.application;

import com.github.benmanes.caffeine.cache.Caffeine;
import net.tape.service.PublicCaches;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

/**
 * Enables annotation-driven caching for public read endpoints.
 *
 * <p>Caches populate lazily on first access ({@code @Cacheable}) and are dropped on any
 * admin write ({@code @EvictsPublicContent}). The Caffeine backend adds a configurable
 * TTL safety net via {@code tape.cache.public-ttl-seconds}; set it to 0 to disable
 * time-based expiry and rely solely on write-invalidation.
 */
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager(@Value("${tape.cache.public-ttl-seconds:600}") long ttlSeconds) {
        Caffeine<Object, Object> caffeine = Caffeine.newBuilder();
        if (ttlSeconds > 0) {
            caffeine.expireAfterWrite(Duration.ofSeconds(ttlSeconds));
        }
        CaffeineCacheManager manager = new CaffeineCacheManager(PublicCaches.NAMES);
        manager.setCaffeine(caffeine);
        return manager;
    }
}
