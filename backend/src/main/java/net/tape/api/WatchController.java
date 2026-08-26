package net.tape.api;

import net.tape.service.WatchService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/watch")
public class WatchController {
    private final WatchService service;

    public WatchController(WatchService service) { this.service = service; }

    @GetMapping("/{slug}")
    public PlayerDtoV1 watch(@PathVariable String slug) { return service.watch(slug); }
}
