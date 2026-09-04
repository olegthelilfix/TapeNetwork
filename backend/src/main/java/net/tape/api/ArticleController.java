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

    /**
     * Returns pagination in the response body ({@link PagedResponse}), not an
     * {@code X-Total-Count} header. No current or planned consumer needs header-based totals; the
     * admin API uses that header instead, because its CMS client (Refine's {@code simple-rest} data
     * provider) requires it. See {@link AbstractCrudController#list} for that contrast.
     */
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
