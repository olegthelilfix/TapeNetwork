package net.tape.orm;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ArticleRepository extends JpaRepository<ArticleEntity, Long> {
    Optional<ArticleEntity> findBySlug(String slug);
    Page<ArticleEntity> findByPublishedTrue(Pageable pageable);
    Page<ArticleEntity> findByPublishedTrueAndCategory_Slug(String categorySlug, Pageable pageable);
    List<ArticleEntity> findByPublishedTrueAndFeaturedTrueOrderByPublishedAtDesc();
    List<ArticleEntity> findTop4ByPublishedTrueOrderByPublishedAtDesc();
    List<ArticleEntity> findByPersonIdAndPublishedTrueOrderByPublishedAtDesc(Long personId);
}
