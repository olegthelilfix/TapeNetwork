package net.tape.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import net.tape.service.ContentStore;
import net.tape.service.EvictsPublicContent;
import net.tape.service.NotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.function.BiConsumer;
import java.util.function.Function;
import java.util.function.Supplier;

/** Generic admin CRUD for repository-backed and write-through cached resources. */
public abstract class AbstractCrudController<E, M> {

    protected final JpaRepository<E, Long> repo;
    protected final ContentStore<M> store;
    protected final ObjectMapper json;
    protected final Class<M> modelType;
    protected final Function<E, M> toModel;
    protected final Supplier<E> newEntity;
    protected final BiConsumer<M, E> applyToEntity;

    protected AbstractCrudController(JpaRepository<E, Long> repo, ObjectMapper json, Class<M> modelType,
                                    Function<E, M> toModel, Supplier<E> newEntity, BiConsumer<M, E> applyToEntity) {
        this.repo = repo; this.store = null; this.json = json; this.modelType = modelType;
        this.toModel = toModel; this.newEntity = newEntity; this.applyToEntity = applyToEntity;
    }

    protected AbstractCrudController(ContentStore<M> store, ObjectMapper json, Class<M> modelType) {
        this.repo = null; this.store = store; this.json = json; this.modelType = modelType;
        this.toModel = null; this.newEntity = null; this.applyToEntity = null;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<M>> list(
        @RequestParam(name = "_start", required = false) Integer start,
        @RequestParam(name = "_end", required = false) Integer end,
        @RequestParam(name = "_sort", required = false) String sort,
        @RequestParam(name = "_order", required = false) String order) {

        if (store != null) return listCached(start, end, sort, order);
        Sort sortSpec = Sort.by("id").ascending();
        if (sort != null && !sort.isBlank()) {
            String field = sort.split(",")[0].trim();
            boolean desc = order != null && order.split(",")[0].trim().equalsIgnoreCase("DESC");
            sortSpec = Sort.by(desc ? Sort.Direction.DESC : Sort.Direction.ASC, field);
        }
        int s = start != null ? Math.max(0, start) : 0;
        int e = end != null ? Math.max(s + 1, end) : s + 25;
        int size = e - s;
        Pageable pageable = PageRequest.of(s / size, size, sortSpec);

        Page<E> page = repo.findAll(pageable);
        return ResponseEntity.ok()
            .header("X-Total-Count", String.valueOf(page.getTotalElements()))
            .body(page.getContent().stream().map(toModel).toList());
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public M getOne(@PathVariable Long id) {
        if (store != null) return store.findById(id).orElseThrow(() -> notFound(id));
        return toModel.apply(repo.findById(id).orElseThrow(() -> notFound(id)));
    }

    @PostMapping
    @Transactional
    @EvictsPublicContent
    public M create(@RequestBody JsonNode body) throws Exception {
        M model = json.treeToValue(body, modelType);
        if (store != null) return store.create(model);
        E entity = newEntity.get();
        applyToEntity.accept(model, entity);
        return toModel.apply(repo.save(entity));
    }

    @PutMapping("/{id}")
    @Transactional
    @EvictsPublicContent
    public M put(@PathVariable Long id, @RequestBody JsonNode body) throws Exception {
        return update(id, body);
    }

    @PatchMapping("/{id}")
    @Transactional
    @EvictsPublicContent
    public M update(@PathVariable Long id, @RequestBody JsonNode body) throws Exception {
        M model = json.treeToValue(body, modelType);
        if (store != null) return store.update(id, model);
        E entity = repo.findById(id).orElseThrow(() -> notFound(id));
        applyToEntity.accept(model, entity);
        return toModel.apply(repo.save(entity));
    }

    @DeleteMapping("/{id}")
    @Transactional
    @EvictsPublicContent
    public M delete(@PathVariable Long id) {
        if (store != null) return store.delete(id);
        E entity = repo.findById(id).orElseThrow(() -> notFound(id));
        M model = toModel.apply(entity);
        repo.delete(entity);
        return model;
    }

    private ResponseEntity<List<M>> listCached(Integer start, Integer end, String sort, String order) {
        List<M> all = new ArrayList<>(store.findAll());
        if (sort != null && !sort.isBlank()) {
            String field = sort.split(",")[0].trim();
            Comparator<M> comparator = Comparator.comparing(
                model -> jsonValue(model, field), Comparator.nullsFirst(String::compareTo));
            if (order != null && order.split(",")[0].trim().equalsIgnoreCase("DESC")) {
                comparator = comparator.reversed();
            }
            all.sort(comparator);
        }
        int s = start != null ? Math.max(0, start) : 0;
        int e = end != null ? Math.max(s + 1, end) : s + 25;
        int from = Math.min(s, all.size());
        int to = Math.min(e, all.size());
        return ResponseEntity.ok()
            .header("X-Total-Count", String.valueOf(all.size()))
            .body(all.subList(from, to));
    }

    private String jsonValue(M model, String field) {
        JsonNode value = json.valueToTree(model).get(field);
        return value == null || value.isNull() ? null : value.asText();
    }

    private NotFoundException notFound(Long id) {
        return new NotFoundException(modelType.getSimpleName(), String.valueOf(id));
    }
}
