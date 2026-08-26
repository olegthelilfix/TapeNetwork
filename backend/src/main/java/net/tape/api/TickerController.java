package net.tape.api;

import net.tape.service.TickerMapper;
import net.tape.service.TickerService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ticker")
public class TickerController {
    private final TickerService service;
    private final TickerMapper mapper;

    public TickerController(TickerService service, TickerMapper mapper) {
        this.service = service; this.mapper = mapper;
    }

    @GetMapping
    public List<TickerDtoV1> list() {
        return service.list().stream().map(mapper::toDtoV1).toList();
    }
}
