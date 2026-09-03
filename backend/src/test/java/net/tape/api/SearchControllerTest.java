package net.tape.api;

import net.tape.application.JwtAuthFilter;
import net.tape.application.JwtService;
import net.tape.application.SecurityConfig;
import net.tape.service.SearchService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Web-layer slice test for {@link SearchController}. {@link SearchHit} isn't a {@code *DtoV1}
 * record, but it's still id-free by construction (see its field list), and there's no 404 case:
 * an empty query yields an empty list, not a not-found error (per the plan's per-controller notes).
 *
 * <p>The real {@link SecurityConfig}/{@link JwtAuthFilter}/{@link JwtService} beans are imported
 * so the real {@code /api/v1/**}.permitAll() rule (rather than Spring Boot's default deny-all)
 * governs these anonymous requests — see {@code HealthControllerTest}'s Javadoc for why.
 */
@WebMvcTest(SearchController.class)
@Import({SecurityConfig.class, JwtAuthFilter.class, JwtService.class})
class SearchControllerTest {

    @Autowired MockMvc mvc;
    @MockitoBean SearchService service;

    @Test
    void searchWithQueryReturnsHitsAndAppliesDefaultLimit() throws Exception {
        when(service.search("earnings", null, 8)).thenReturn(List.of(new SearchHit(
            "article", "earnings-preview", "Earnings Preview", "Markets",
            "/uploads/earnings-preview.jpg", "/articles/earnings-preview")));

        mvc.perform(get("/api/v1/search").param("q", "earnings"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].type").value("article"))
            .andExpect(jsonPath("$[0].slug").value("earnings-preview"))
            .andExpect(jsonPath("$[0].url").value("/articles/earnings-preview"));
        verify(service).search("earnings", null, 8);
    }

    @Test
    void searchWithExplicitTypeAndLimitPassesThemThrough() throws Exception {
        when(service.search("earnings", "video", 3)).thenReturn(List.of());

        mvc.perform(get("/api/v1/search")
                .param("q", "earnings")
                .param("type", "video")
                .param("limit", "3"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(0)));
        verify(service).search("earnings", "video", 3);
    }

    @Test
    void searchWithNoQueryReturnsWhateverTheServiceReturns() throws Exception {
        // The blank-query "no results" rule lives in SearchService (mocked here), not the
        // controller — this test only pins the controller's pass-through wiring.
        when(service.search(null, null, 8)).thenReturn(List.of());

        mvc.perform(get("/api/v1/search"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(0)));
    }
}
