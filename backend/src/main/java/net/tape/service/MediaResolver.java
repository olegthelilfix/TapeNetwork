package net.tape.service;

import net.tape.orm.MediaAssetEntity;
import net.tape.orm.MediaAssetRepository;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Resolves media id -> public URL. The media table is tiny (cover/thumb assets),
 * so we load it once per instance and refresh lazily; good enough for v1 read traffic.
 */
@Component
public class MediaResolver {

    private final MediaAssetRepository repo;
    private volatile Map<Long, String> cache;

    public MediaResolver(MediaAssetRepository repo) {
        this.repo = repo;
    }

    public String url(Long id) {
        if (id == null) return null;
        Map<Long, String> c = cache;
        if (c == null || !c.containsKey(id)) {
            c = load();
        }
        return c.get(id);
    }

    private synchronized Map<Long, String> load() {
        Map<Long, String> c = repo.findAll().stream()
            .collect(Collectors.toMap(MediaAssetEntity::getId, MediaAssetEntity::getUrl, (a, b) -> a));
        cache = c;
        return c;
    }
}
