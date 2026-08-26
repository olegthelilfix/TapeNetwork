package net.tape.api;

import net.tape.service.ArticleMapper;
import net.tape.service.ArticleService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/articles")
public class ArticleController {
    private final ArticleService service;
    private final ArticleMapper mapper;

    public ArticleController(ArticleService service, ArticleMapper mapper) {
        this.service = service; this.mapper = mapper;
    }

    @GetMapping
    public PagedResponse<ArticleDtoV1> list(
        @RequestParam(required = false) String category,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "12") int size) {
        return PagedResponse.of(service.list(category, page, size).map(mapper::toDtoV1));
    }

    @GetMapping("/{slug}")
    public ArticleDtoV1 bySlug(@PathVariable String slug) {
        return mapper.toDtoV1(service.bySlug(slug));
    }
}
