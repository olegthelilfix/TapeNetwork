package net.tape.orm;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ShowRepository extends JpaRepository<ShowEntity, Long> {
    Optional<ShowEntity> findBySlug(String slug);
    List<ShowEntity> findByPublishedTrueOrderBySortAsc();
}
