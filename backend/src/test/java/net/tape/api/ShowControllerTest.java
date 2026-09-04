package net.tape.api;

import net.tape.application.JwtAuthFilter;
import net.tape.application.JwtService;
import net.tape.application.SecurityConfig;
import net.tape.model.Show;
import net.tape.service.NotFoundException;
import net.tape.service.ShowMapper;
import net.tape.service.ShowService;
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
 * Web-layer slice test: real Spring MVC dispatch + {@code ApiExceptionHandler}, with
 * {@link ShowService} and {@link ShowMapper} mocked (no DB, no Lucene). {@code /api/v1/**} is
 * {@code permitAll()} in {@code SecurityConfig}, so these calls need no auth headers — but the
 * real {@link SecurityConfig}/{@link JwtAuthFilter}/{@link JwtService} beans still have to be
 * imported so that rule actually governs the request (see {@code HealthControllerTest}'s Javadoc
 * for why {@code @WebMvcTest} needs this even for a public endpoint).
 */
@WebMvcTest(ShowController.class)
@Import({SecurityConfig.class, JwtAuthFilter.class, JwtService.class})
class ShowControllerTest {

    @Autowired MockMvc mvc;
    @MockitoBean ShowService service;
    @MockitoBean ShowMapper mapper;

    @Test
    void listReturnsSummaryDtosWithNoIdField() throws Exception {
        Show show = new Show();
        show.setSlug("market-open");
        when(service.list()).thenReturn(List.of(show));
        when(mapper.toSummaryDtoV1(show)).thenReturn(new ShowSummaryDtoV1(
            "market-open", "Market Open", "Where the bell rings first", "Daily open coverage.",
            "9:00 ET", "/uploads/market-open.jpg"));

        mvc.perform(get("/api/v1/shows"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].id").doesNotExist())
            .andExpect(jsonPath("$[0].slug").value("market-open"))
            .andExpect(jsonPath("$[0].name").value("Market Open"))
            .andExpect(jsonPath("$[0].tagline").value("Where the bell rings first"))
            .andExpect(jsonPath("$[0].blurb").value("Daily open coverage."))
            .andExpect(jsonPath("$[0].scheduleSlot").value("9:00 ET"))
            .andExpect(jsonPath("$[0].imageUrl").value("/uploads/market-open.jpg"));
    }

    @Test
    void bySlugReturnsDetailDtoWithNoIdField() throws Exception {
        Show show = new Show();
        show.setSlug("market-open");
        when(service.bySlug("market-open")).thenReturn(show);
        when(mapper.toDetailDtoV1(show)).thenReturn(new ShowDetailDtoV1(
            "market-open", "Market Open", "Where the bell rings first", "Daily open coverage.",
            "Full description of the show.", "9:00 ET", 42, "5", "1.2M",
            "/uploads/market-open.jpg", List.of(), List.of()));

        mvc.perform(get("/api/v1/shows/market-open"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").doesNotExist())
            .andExpect(jsonPath("$.slug").value("market-open"))
            .andExpect(jsonPath("$.episodesCount").value(42))
            .andExpect(jsonPath("$.hosts").isArray())
            .andExpect(jsonPath("$.episodes").isArray());
    }

    @Test
    void bySlugReturns404WhenShowIsMissing() throws Exception {
        when(service.bySlug("missing")).thenThrow(new NotFoundException("show", "missing"));

        mvc.perform(get("/api/v1/shows/missing"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.status").value(404))
            .andExpect(jsonPath("$.error").value("Not Found"))
            .andExpect(jsonPath("$.message").exists())
            .andExpect(jsonPath("$.time").exists());
    }
}
