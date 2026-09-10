package net.tape.service;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.function.BiConsumer;
import java.util.function.Function;
import java.util.function.Supplier;

/** Small adapter that keeps persistence and mapping behind the ContentStore contract. */
public final class JpaContentStore<E, M> implements ContentStore<M> {

    private final JpaRepository<E, Long> repo;
    private final Function<E, M> toModel;
    private final BiConsumer<M, E> applyToEntity;
    private final Supplier<E> newEntity;
    private final String modelName;

    public JpaContentStore(JpaRepository<E, Long> repo, Function<E, M> toModel,
                           BiConsumer<M, E> applyToEntity, Supplier<E> newEntity,
                           Class<M> modelType) {
        this.repo = repo;
        this.toModel = toModel;
        this.applyToEntity = applyToEntity;
        this.newEntity = newEntity;
        this.modelName = modelType.getSimpleName();
    }

    @Override
    public List<M> findAll() {
        return repo.findAll().stream().map(toModel).toList();
    }

    @Override
    public Optional<M> findById(Long id) {
        return repo.findById(id).map(toModel);
    }

    @Override
    public M create(M model) {
        E entity = newEntity.get();
        applyToEntity.accept(model, entity);
        return toModel.apply(repo.save(entity));
    }

    @Override
    public M update(Long id, M patch) {
        E entity = repo.findById(id)
            .orElseThrow(() -> new NotFoundException(modelName, String.valueOf(id)));
        applyToEntity.accept(patch, entity);
        return toModel.apply(repo.save(entity));
    }

    @Override
    public M delete(Long id) {
        E entity = repo.findById(id)
            .orElseThrow(() -> new NotFoundException(modelName, String.valueOf(id)));
        M model = toModel.apply(entity);
        repo.delete(entity);
        return model;
    }

    @Override
    public void reload(Long id) {
        // The DB store is stateless; reloading the cache is the decorator's job.
    }
}
