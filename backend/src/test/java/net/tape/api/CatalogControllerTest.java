package net.tape.api;

import net.tape.application.JwtAuthFilter;
import net.tape.application.JwtService;
import net.tape.application.SecurityConfig;
import net.tape.model.Category;
import net.tape.model.Subcategory;
import net.tape.model.Video;
import net.tape.service.CatalogService;
import net.tape.service.CategoryMapper;
import net.tape.service.NotFoundException;
import net.tape.service.SubcategoryMapper;
import net.tape.service.VideoMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Web-layer slice test for {@link CatalogController}'s four endpoints. {@link CatalogService}
 * and all three mappers it depends on are mocked; each mapper returns a hand-built {@code *DtoV1}
 * record so the JSON assertions are independent of MapStruct/service internals.
 *
 * <p>The real {@link SecurityConfig}/{@link JwtAuthFilter}/{@link JwtService} beans are imported
 * so the real {@code /api/v1/**}.permitAll() rule (rather than Spring Boot's default deny-all)
 * governs these anonymous requests — see {@code HealthControllerTest}'s Javadoc for why.
 */
@WebMvcTest(CatalogController.class)
@Import({SecurityConfig.class, JwtAuthFilter.class, JwtService.class})
class CatalogControllerTest {

    @Autowired MockMvc mvc;
    @MockitoBean CatalogService service;
    @MockitoBean CategoryMapper categoryMapper;
    @MockitoBean SubcategoryMapper subcategoryMapper;
    @MockitoBean VideoMapper videoMapper;

    @Test
    void categoriesReturnsSummaryListWithNoIdField() throws Exception {
        Category category = new Category();
        category.setSlug("markets");
        when(service.listCategories()).thenReturn(List.of(category));
        when(categoryMapper.toSummaryDtoV1(category)).thenReturn(new CategorySummaryDtoV1(
            "markets", "Markets", "All things markets.", "/uploads/markets.jpg", 3, 27,
            List.of("Stocks", "Bonds", "Commodities")));

        mvc.perform(get("/api/v1/on-demand/categories"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].id").doesNotExist())
            .andExpect(jsonPath("$[0].slug").value("markets"))
            .andExpect(jsonPath("$[0].subcategoryCount").value(3))
            .andExpect(jsonPath("$[0].videoCount").value(27))
            .andExpect(jsonPath("$[0].subNames", hasSize(3)));
    }

    @Test
    void categoryBySlugReturnsDetailDtoWithNoIdField() throws Exception {
        Category category = new Category();
        category.setSlug("markets");
        when(service.categoryBySlug("markets")).thenReturn(category);
        when(categoryMapper.toDetailDtoV1(category)).thenReturn(new CategoryDetailDtoV1(
            "markets", "Markets", "All things markets.", List.of()));

        mvc.perform(get("/api/v1/on-demand/categories/markets"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").doesNotExist())
            .andExpect(jsonPath("$.slug").value("markets"))
            .andExpect(jsonPath("$.subcategories").isArray());
    }

    @Test
    void categoryBySlugReturns404WhenMissing() throws Exception {
        when(service.categoryBySlug("missing")).thenThrow(new NotFoundException("category", "missing"));

        mvc.perform(get("/api/v1/on-demand/categories/missing"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.status").value(404))
            .andExpect(jsonPath("$.error").value("Not Found"))
            .andExpect(jsonPath("$.message").exists())
            .andExpect(jsonPath("$.time").exists());
    }

    @Test
    void subcategoryBySlugReturnsDetailDtoWithNoIdField() throws Exception {
        Subcategory subcategory = new Subcategory();
        subcategory.setSlug("stocks");
        when(service.subcategoryBySlug("stocks")).thenReturn(subcategory);
        when(subcategoryMapper.toDetailDtoV1(subcategory)).thenReturn(new SubcategoryDetailDtoV1(
            "stocks", "Stocks", "Equity coverage.", "markets", "Markets", List.of()));

        mvc.perform(get("/api/v1/on-demand/subcategories/stocks"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").doesNotExist())
            .andExpect(jsonPath("$.slug").value("stocks"))
            .andExpect(jsonPath("$.categorySlug").value("markets"))
            .andExpect(jsonPath("$.videos").isArray());
    }

    @Test
    void subcategoryBySlugReturns404WhenMissing() throws Exception {
        when(service.subcategoryBySlug("missing")).thenThrow(new NotFoundException("subcategory", "missing"));

        mvc.perform(get("/api/v1/on-demand/subcategories/missing"))
            .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
            .andExpect(jsonPath("$.error").value("Not Found"))
            .andExpect(jsonPath("$.message").exists())
            .andExpect(jsonPath("$.time").exists());
    }

    @Test
    void videoBySlugReturnsDtoWithNoIdField() throws Exception {
        Video video = new Video();
        video.setSlug("earnings-call");
        when(service.videoBySlug("earnings-call")).thenReturn(video);
        when(videoMapper.toDtoV1(video)).thenReturn(new VideoDtoV1(
            "earnings-call", "Q3 Earnings Call", "Full replay.", java.time.Instant.parse("2026-01-01T00:00:00Z"),
            754, "12:34", "Market Open", "Markets", "12K", 12000L, List.of("earnings"),
            List.of(new SecurityDtoV1("AAPL", "Apple Inc.")),
            List.of(new PersonRefDtoV1("jane-doe", "Jane Doe", "JD", "host")),
            "/uploads/earnings.jpg"));

        mvc.perform(get("/api/v1/on-demand/videos/earnings-call"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").doesNotExist())
            .andExpect(jsonPath("$.slug").value("earnings-call"))
            .andExpect(jsonPath("$.durationLabel").value("12:34"))
            .andExpect(jsonPath("$.securities[0].symbol").value("AAPL"))
            .andExpect(jsonPath("$.people[0].slug").value("jane-doe"))
            .andExpect(jsonPath("$.people[0].role").value("host"));
    }

    @Test
    void videoBySlugReturns404WhenMissing() throws Exception {
        when(service.videoBySlug("missing")).thenThrow(new NotFoundException("video", "missing"));

        mvc.perform(get("/api/v1/on-demand/videos/missing"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.status").value(404))
            .andExpect(jsonPath("$.error").value("Not Found"))
            .andExpect(jsonPath("$.message").exists())
            .andExpect(jsonPath("$.time").exists());
    }
}
