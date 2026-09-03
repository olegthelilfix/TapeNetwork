package net.tape.api;

import net.tape.service.SearchService;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/search")
public class SearchController {

    private final SearchService service;

    public SearchController(SearchService service) {
        this.service = service;
    }

    @GetMapping
    public List<SearchHit> search(
        @RequestParam(name = "q", required = false) String q,
        @RequestParam(name = "type", required = false) String type,
        @RequestParam(name = "limit", defaultValue = "8") int limit) {
        // DEMO ONLY — DO NOT MERGE. Artificial 300ms slowdown to exercise the
        // perf-compare workflow (should trip the lat_search regression gate).
        try {
            Thread.sleep(300);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        return service.search(q, type, limit);
    }
}
