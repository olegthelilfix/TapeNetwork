package net.tape.application;

import com.hazelcast.config.Config;
import com.hazelcast.config.JoinConfig;
import com.hazelcast.config.MapConfig;
import net.tape.service.PublicCaches;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.List;

/**
 * Enables annotation-driven caching for public read endpoints, backed by an <b>embedded
 * Hazelcast</b> member running inside the backend process.
 *
 * <p>Caches populate lazily on first access ({@code @Cacheable}) and are dropped on any
 * admin write ({@code @EvictsPublicContent}, which is {@code @CacheEvict(allEntries=true)}).
 * Because the backing {@code IMap}s live in Hazelcast, both the cached entries and the
 * write-triggered {@code clear()} eviction are <b>cluster-wide</b>: with several backend
 * instances joined into one Hazelcast cluster, an admin write on any instance invalidates
 * the entry seen by every other instance, removing the per-JVM staleness Caffeine had.
 *
 * <p>Only the {@link Config} bean is declared here. Spring Boot's Hazelcast auto-configuration
 * detects it and builds the single embedded {@code HazelcastInstance} from it, then wires a
 * {@code HazelcastCacheManager} onto that instance automatically — so declaring the instance or
 * cache manager here would create a redundant second member.
 *
 * <p>By default this runs as a single member with no extra infrastructure (multicast is
 * always disabled). To form a cluster, set {@code tape.cache.hazelcast.members} (env
 * {@code HAZELCAST_MEMBERS}) to a comma-separated list of peer host[:port] entries; the
 * TCP/IP join is enabled only when that list is non-empty.
 *
 * <p>{@code tape.cache.public-ttl-seconds} maps to each cache map's {@code time-to-live}:
 * {@code > 0} expires entries that long after write; {@code 0} disables time-based expiry
 * and relies solely on write-invalidation.
 */
@Configuration
@EnableCaching
public class CacheConfig {

    /**
     * Programmatic Hazelcast configuration for the embedded cache member. Spring Boot's
     * auto-configuration consumes this bean to create the sole {@code HazelcastInstance}.
     *
     * @param ttlSeconds  per-map time-to-live for public caches (0 = never expire by time)
     * @param clusterName Hazelcast cluster name — members only join peers sharing this name
     * @param port        base member port (Hazelcast auto-increments if taken)
     * @param members     comma-separated peer list; empty = single-member (no clustering)
     */
    @Bean
    public Config hazelcastConfig(
            @Value("${tape.cache.public-ttl-seconds:600}") int ttlSeconds,
            @Value("${tape.cache.hazelcast.cluster-name:tape-public-cache}") String clusterName,
            @Value("${tape.cache.hazelcast.port:5701}") int port,
            @Value("${tape.cache.hazelcast.members:}") String members) {

        Config config = new Config();
        config.setClusterName(clusterName);
        config.setInstanceName("tape-cache-" + clusterName);

        // Network / discovery: multicast off; TCP/IP join only when explicit peers are given.
        config.getNetworkConfig().setPort(port).setPortAutoIncrement(true);
        JoinConfig join = config.getNetworkConfig().getJoin();
        join.getAutoDetectionConfig().setEnabled(false);
        join.getMulticastConfig().setEnabled(false);
        List<String> memberList = parseMembers(members);
        join.getTcpIpConfig().setEnabled(!memberList.isEmpty());
        memberList.forEach(join.getTcpIpConfig()::addMember);

        // One map per public cache name, each carrying the configurable TTL.
        int ttl = Math.max(0, ttlSeconds);
        for (String cacheName : PublicCaches.NAMES) {
            config.addMapConfig(new MapConfig(cacheName).setTimeToLiveSeconds(ttl));
        }
        return config;
    }

    private static List<String> parseMembers(String members) {
        if (members == null || members.isBlank()) {
            return List.of();
        }
        return Arrays.stream(members.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }
}
