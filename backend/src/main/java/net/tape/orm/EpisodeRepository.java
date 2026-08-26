package net.tape.orm;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EpisodeRepository extends JpaRepository<EpisodeEntity, Long> {
    Optional<EpisodeEntity> findBySlug(String slug);
    List<EpisodeEntity> findByShowIdAndPublishedTrueOrderByPublishedAtDesc(Long showId);
    Optional<EpisodeEntity> findFirstByLiveTrueAndPublishedTrueOrderByPublishedAtDesc();
}
