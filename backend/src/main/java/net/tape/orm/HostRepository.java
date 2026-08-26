package net.tape.orm;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HostRepository extends JpaRepository<HostEntity, Long> {
    List<HostEntity> findByShowIdOrderBySortAsc(Long showId);
}
