package net.tape.orm;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HomeBlockRepository extends JpaRepository<HomeBlockEntity, Long> {
    List<HomeBlockEntity> findByTypeOrderBySortAsc(String type);
}
