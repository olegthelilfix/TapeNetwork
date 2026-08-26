package net.tape.service;

import net.tape.model.TickerQuote;
import net.tape.orm.TickerQuoteRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class TickerService {

    private final TickerQuoteRepository repo;
    private final TickerMapper mapper;

    public TickerService(TickerQuoteRepository repo, TickerMapper mapper) {
        this.repo = repo; this.mapper = mapper;
    }

    @Cacheable(PublicCaches.TICKER)
    public List<TickerQuote> list() {
        return repo.findAllByOrderBySortAsc().stream().map(mapper::toModel).toList();
    }
}
