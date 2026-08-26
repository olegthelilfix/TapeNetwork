package net.tape.api;

import net.tape.service.ScheduleMapper;
import net.tape.service.ScheduleService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/schedule")
public class ScheduleController {
    private final ScheduleService service;
    private final ScheduleMapper mapper;

    public ScheduleController(ScheduleService service, ScheduleMapper mapper) {
        this.service = service; this.mapper = mapper;
    }

    @GetMapping
    public List<ScheduleItemDtoV1> list() {
        return service.list().stream().map(mapper::toDtoV1).toList();
    }
}
