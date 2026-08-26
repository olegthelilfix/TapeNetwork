package net.tape.service;

import java.util.List;
import java.util.Optional;

/** Shared contract for cached reads and write-through persistence. */
public interface ContentStore<M> {
    List<M> findAll();
    Optional<M> findById(Long id);
    M create(M model);
    M update(Long id, M patch);
    M delete(Long id);
}
