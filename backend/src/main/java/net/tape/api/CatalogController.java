package net.tape.api;

import net.tape.service.CatalogService;
import net.tape.service.CategoryMapper;
import net.tape.service.SubcategoryMapper;
import net.tape.service.VideoMapper;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/on-demand")
public class CatalogController {
    private final CatalogService service;
    private final CategoryMapper categoryMapper;
    private final SubcategoryMapper subcategoryMapper;
    private final VideoMapper videoMapper;

    public CatalogController(CatalogService service, CategoryMapper categoryMapper,
                            SubcategoryMapper subcategoryMapper, VideoMapper videoMapper) {
        this.service = service; this.categoryMapper = categoryMapper;
        this.subcategoryMapper = subcategoryMapper; this.videoMapper = videoMapper;
    }

    @GetMapping("/categories")
    public List<CategorySummaryDtoV1> categories() {
        return service.listCategories().stream().map(categoryMapper::toSummaryDtoV1).toList();
    }

    @GetMapping("/categories/{slug}")
    public CategoryDetailDtoV1 category(@PathVariable String slug) {
        return categoryMapper.toDetailDtoV1(service.categoryBySlug(slug));
    }

    @GetMapping("/subcategories/{slug}")
    public SubcategoryDetailDtoV1 subcategory(@PathVariable String slug) {
        return subcategoryMapper.toDetailDtoV1(service.subcategoryBySlug(slug));
    }

    @GetMapping("/videos/{slug}")
    public VideoDtoV1 video(@PathVariable String slug) {
        return videoMapper.toDtoV1(service.videoBySlug(slug));
    }
}
