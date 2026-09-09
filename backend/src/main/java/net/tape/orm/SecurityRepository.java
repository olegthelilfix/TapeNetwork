package net.tape.orm;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SecurityRepository extends JpaRepository<SecurityEntity, Long> {
    Optional<SecurityEntity> findBySymbolIgnoreCase(String symbol);
}
