package net.tape.orm;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TickerQuoteRepository extends JpaRepository<TickerQuoteEntity, Long> {
    List<TickerQuoteEntity> findAllByOrderBySortAsc();
}
