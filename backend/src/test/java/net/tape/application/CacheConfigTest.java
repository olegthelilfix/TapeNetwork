package net.tape.application;

import com.hazelcast.config.Config;
import com.hazelcast.config.MapConfig;
import net.tape.service.PublicCaches;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Verifies the embedded-Hazelcast cache configuration without starting a member:
 * every public cache maps to an IMap carrying the configured TTL, multicast discovery
 * is off, and the explicit TCP/IP member list toggles on only when peers are supplied.
 */
class CacheConfigTest {

    private final CacheConfig cacheConfig = new CacheConfig();

    @Test
    void everyPublicCacheHasAMapWithTheConfiguredTtl() {
        Config config = cacheConfig.hazelcastConfig(600, "tape-public-cache", 5701, "");

        for (String cacheName : PublicCaches.NAMES) {
            MapConfig mapConfig = config.getMapConfig(cacheName);
            assertThat(mapConfig).as("map config for %s", cacheName).isNotNull();
            assertThat(mapConfig.getTimeToLiveSeconds()).isEqualTo(600);
        }
    }

    @Test
    void zeroTtlDisablesTimeBasedExpiry() {
        Config config = cacheConfig.hazelcastConfig(0, "tape-public-cache", 5701, "");

        assertThat(config.getMapConfig(PublicCaches.SHOWS).getTimeToLiveSeconds()).isZero();
    }

    @Test
    void multicastIsAlwaysDisabled() {
        Config config = cacheConfig.hazelcastConfig(600, "tape-public-cache", 5701, "backend-a,backend-b");

        assertThat(config.getNetworkConfig().getJoin().getMulticastConfig().isEnabled()).isFalse();
    }

    @Test
    void singleMemberByDefaultLeavesTcpIpJoinDisabled() {
        Config config = cacheConfig.hazelcastConfig(600, "tape-public-cache", 5701, "");

        assertThat(config.getNetworkConfig().getJoin().getTcpIpConfig().isEnabled()).isFalse();
        assertThat(config.getNetworkConfig().getJoin().getTcpIpConfig().getMembers()).isEmpty();
    }

    @Test
    void memberListEnablesTcpIpJoinWithTrimmedPeers() {
        Config config = cacheConfig.hazelcastConfig(600, "tape-public-cache", 5701, " backend-a , backend-b ");

        assertThat(config.getNetworkConfig().getJoin().getTcpIpConfig().isEnabled()).isTrue();
        assertThat(config.getNetworkConfig().getJoin().getTcpIpConfig().getMembers())
                .containsExactly("backend-a", "backend-b");
    }

    @Test
    void clusterNameAndPortAreApplied() {
        Config config = cacheConfig.hazelcastConfig(600, "my-cluster", 5799, "");

        assertThat(config.getClusterName()).isEqualTo("my-cluster");
        assertThat(config.getNetworkConfig().getPort()).isEqualTo(5799);
    }
}
