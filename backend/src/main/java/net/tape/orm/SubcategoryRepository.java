package net.tape.orm;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SubcategoryRepository extends JpaRepository<SubcategoryEntity, Long> {
    Optional<SubcategoryEntity> findBySlug(String slug);
    List<SubcategoryEntity> findByCategoryIdOrderBySortAsc(Long categoryId);
}
