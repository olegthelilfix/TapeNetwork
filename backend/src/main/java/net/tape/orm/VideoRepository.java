package net.tape.orm;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface VideoRepository extends JpaRepository<VideoEntity, Long> {
    Optional<VideoEntity> findBySlug(String slug);
    List<VideoEntity> findBySubcategoryIdAndPublishedTrueOrderByPublishedAtDesc(Long subcategoryId);

    /** Top published videos by view_count (persisted value), most popular first. */
    List<VideoEntity> findByPublishedTrueOrderByViewCountDesc(org.springframework.data.domain.Pageable pageable);

    /** Atomically add a batch of buffered views to the persisted counter. */
    @Modifying
    @Query("update VideoEntity v set v.viewCount = v.viewCount + :delta where v.id = :id")
    int addViews(@Param("id") Long id, @Param("delta") long delta);
}
