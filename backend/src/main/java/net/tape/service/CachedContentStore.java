package net.tape.service;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;

/** In-memory cache decorator: preload once, read locally, delegate every write to the DB store. */
public class CachedContentStore<M> implements ContentStore<M> {

    private final ContentStore<M> database;
    private final Function<M, Long> idOf;
    private final Map<Long, M> cache = new ConcurrentHashMap<>();

    public CachedContentStore(ContentStore<M> database, Function<M, Long> idOf) {
        this.database = database;
        this.idOf = idOf;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional(readOnly = true)
    public void preload() {
        cache.clear();
        database.findAll().forEach(model -> cache.put(idOf.apply(model), model));
    }

    @Override
    public List<M> findAll() {
        return List.copyOf(cache.values());
    }

    @Override
    public Optional<M> findById(Long id) {
        return Optional.ofNullable(cache.get(id));
    }

    @Override
    @Transactional
    public M create(M model) {
        M saved = database.create(model);
        cache.put(idOf.apply(saved), saved);
        return saved;
    }

    @Override
    @Transactional
    public M update(Long id, M patch) {
        M saved = database.update(id, patch);
        cache.put(idOf.apply(saved), saved);
        return saved;
    }

    @Override
    @Transactional
    public M delete(Long id) {
        M deleted = database.delete(id);
        cache.remove(idOf.apply(deleted));
        return deleted;
    }
}
