package net.tape.service;

import net.tape.model.ScheduleSlot;
import net.tape.orm.ScheduleSlotRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class ScheduleService {

    private final ScheduleSlotRepository repo;
    private final ScheduleMapper mapper;

    public ScheduleService(ScheduleSlotRepository repo, ScheduleMapper mapper) {
        this.repo = repo; this.mapper = mapper;
    }

    @Cacheable(PublicCaches.SCHEDULE)
    public List<ScheduleSlot> list() {
        return repo.findAllByOrderBySortAsc().stream().map(mapper::toModel).toList();
    }
}
