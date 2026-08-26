package net.tape.api;

import net.tape.service.ShowMapper;
import net.tape.service.ShowService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/shows")
public class ShowController {
    private final ShowService service;
    private final ShowMapper mapper;

    public ShowController(ShowService service, ShowMapper mapper) {
        this.service = service; this.mapper = mapper;
    }

    @GetMapping
    public List<ShowSummaryDtoV1> list() {
        return service.list().stream().map(mapper::toSummaryDtoV1).toList();
    }

    @GetMapping("/{slug}")
    public ShowDetailDtoV1 bySlug(@PathVariable String slug) {
        return mapper.toDetailDtoV1(service.bySlug(slug));
    }
}
