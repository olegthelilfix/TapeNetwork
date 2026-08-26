package net.tape.orm;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VideoRepository extends JpaRepository<VideoEntity, Long> {
    Optional<VideoEntity> findBySlug(String slug);
    List<VideoEntity> findBySubcategoryIdAndPublishedTrueOrderByPublishedAtDesc(Long subcategoryId);
}
