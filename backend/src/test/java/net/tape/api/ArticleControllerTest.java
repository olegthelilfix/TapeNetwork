package net.tape.api;

import net.tape.application.JwtAuthFilter;
import net.tape.application.JwtService;
import net.tape.application.SecurityConfig;
import net.tape.model.Article;
import net.tape.service.ArticleMapper;
import net.tape.service.ArticleService;
import net.tape.service.NotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Web-layer slice test for {@link ArticleController}. {@link ArticleService} is mocked with
 * {@code page}/{@code size}/{@code category} treated as explicit contract, not just the default
 * shape: one test exercises the endpoint's declared defaults ({@code page=0}, {@code size=12},
 * no category) and a second exercises non-default values end-to-end, asserting the service is
 * invoked with exactly those values and that the response reflects them. This makes a future
 * change to the defaults (or to how query params are parsed) fail loudly here first.
 *
 * <p>The real {@link SecurityConfig}/{@link JwtAuthFilter}/{@link JwtService} beans are imported
 * so the real {@code /api/v1/**}.permitAll() rule (rather than Spring Boot's default deny-all)
 * governs these anonymous requests — see {@code HealthControllerTest}'s Javadoc for why.
 */
@WebMvcTest(ArticleController.class)
@Import({SecurityConfig.class, JwtAuthFilter.class, JwtService.class})
class ArticleControllerTest {

    @Autowired MockMvc mvc;
    @MockitoBean ArticleService service;
    @MockitoBean ArticleMapper mapper;

    @Test
    void listWithNoQueryParamsUsesDeclaredDefaults() throws Exception {
        Article article = new Article();
        article.setSlug("earnings-preview");
        Page<Article> page = new PageImpl<>(List.of(article), PageRequest.of(0, 12), 1);
        when(service.list(null, 0, 12)).thenReturn(page);
        when(mapper.toDtoV1(article)).thenReturn(new ArticleDtoV1(
            "earnings-preview", "markets", "Earnings Preview", "What to watch.", "Jane Doe",
            null, 5, "/uploads/earnings-preview.jpg", Instant.parse("2026-01-01T00:00:00Z")));

        mvc.perform(get("/api/v1/articles"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.items", hasSize(1)))
            .andExpect(jsonPath("$.items[0].id").doesNotExist())
            .andExpect(jsonPath("$.items[0].slug").value("earnings-preview"))
            .andExpect(jsonPath("$.page").value(0))
            .andExpect(jsonPath("$.size").value(12))
            .andExpect(jsonPath("$.total").value(1))
            .andExpect(jsonPath("$.totalPages").value(1));
        verify(service).list(null, 0, 12);
    }

    @Test
    void listWithExplicitNonDefaultParamsIsPassedThroughVerbatim() throws Exception {
        Page<Article> page = new PageImpl<>(List.of(), PageRequest.of(2, 5), 0);
        when(service.list("markets", 2, 5)).thenReturn(page);

        mvc.perform(get("/api/v1/articles")
                .param("page", "2")
                .param("size", "5")
                .param("category", "markets"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.items", hasSize(0)))
            .andExpect(jsonPath("$.page").value(2))
            .andExpect(jsonPath("$.size").value(5))
            .andExpect(jsonPath("$.total").value(0))
            .andExpect(jsonPath("$.totalPages").value(0));
        verify(service).list("markets", 2, 5);
    }

    @Test
    void bySlugReturnsDtoWithNoIdField() throws Exception {
        Article article = new Article();
        article.setSlug("earnings-preview");
        when(service.bySlug("earnings-preview")).thenReturn(article);
        when(mapper.toDtoV1(article)).thenReturn(new ArticleDtoV1(
            "earnings-preview", "markets", "Earnings Preview", "What to watch.", "Jane Doe",
            List.of("Paragraph one.", "Paragraph two."), 5, "/uploads/earnings-preview.jpg",
            Instant.parse("2026-01-01T00:00:00Z")));

        mvc.perform(get("/api/v1/articles/earnings-preview"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").doesNotExist())
            .andExpect(jsonPath("$.slug").value("earnings-preview"))
            .andExpect(jsonPath("$.body", hasSize(2)));
    }

    @Test
    void bySlugReturns404WhenMissing() throws Exception {
        when(service.bySlug("missing")).thenThrow(new NotFoundException("article", "missing"));

        mvc.perform(get("/api/v1/articles/missing"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.status").value(404))
            .andExpect(jsonPath("$.error").value("Not Found"))
            .andExpect(jsonPath("$.message").exists())
            .andExpect(jsonPath("$.time").exists());
    }
}
