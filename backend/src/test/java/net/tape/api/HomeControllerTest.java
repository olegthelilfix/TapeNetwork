package net.tape.api;

import net.tape.application.JwtAuthFilter;
import net.tape.application.JwtService;
import net.tape.application.SecurityConfig;
import net.tape.service.HomeService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.Matchers.nullValue;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Web-layer slice test for {@link HomeController}. {@link HomeService} is mocked and returns a
 * fully hand-built {@link HomeResponseDtoV1} — the biggest single response shape in the public
 * API — so this test pins the nesting (liveNow/featured/mostWatched/upNext/ticker/schedule/
 * latestArticles) rather than any of the aggregation logic that lives in the (mocked) service.
 *
 * <p>The real {@link SecurityConfig}/{@link JwtAuthFilter}/{@link JwtService} beans are imported
 * so the real {@code /api/v1/**}.permitAll() rule (rather than Spring Boot's default deny-all)
 * governs this anonymous request — see {@code HealthControllerTest}'s Javadoc for why.
 */
@WebMvcTest(HomeController.class)
@Import({SecurityConfig.class, JwtAuthFilter.class, JwtService.class})
class HomeControllerTest {

    @Autowired MockMvc mvc;
    @MockitoBean HomeService service;

    @Test
    void homeReturnsAggregatedResponseWithNoIdFields() throws Exception {
        HomeCardDtoV1 liveNow = new HomeCardDtoV1(
            "episode", "live-market-wrap", "Live Market Wrap", "Market Open", "12:00",
            "/uploads/live.jpg", true, "8.4k");
        HomeCardDtoV1 featured = new HomeCardDtoV1(
            "video", "earnings-call", "Q3 Earnings Call", "Market Open", "12:34",
            "/uploads/earnings.jpg", false, "1.2k");
        when(service.home()).thenReturn(new HomeResponseDtoV1(
            liveNow, List.of(featured), List.of(), List.of(),
            List.of(new TickerDtoV1("SPX", "5,123.45", "+0.42%", "up")),
            List.of(new ScheduleItemDtoV1("9:00 ET", "Market Open", "market-open", "Jane Doe", true)),
            List.of(new ArticleDtoV1("earnings-preview", "markets", "Earnings Preview", "dek",
                "Jane Doe", null, 5, "/uploads/earnings-preview.jpg", null))));

        mvc.perform(get("/api/v1/home"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.liveNow.id").doesNotExist())
            .andExpect(jsonPath("$.liveNow.slug").value("live-market-wrap"))
            .andExpect(jsonPath("$.liveNow.live").value(true))
            .andExpect(jsonPath("$.featured[0].slug").value("earnings-call"))
            .andExpect(jsonPath("$.mostWatched").isArray())
            .andExpect(jsonPath("$.upNext").isArray())
            .andExpect(jsonPath("$.ticker[0].symbol").value("SPX"))
            .andExpect(jsonPath("$.schedule[0].showSlug").value("market-open"))
            .andExpect(jsonPath("$.latestArticles[0].slug").value("earnings-preview"))
            .andExpect(jsonPath("$.latestArticles[0].id").doesNotExist());
    }

    /**
     * {@code liveNow == null} is the real "off-air" state, not a fabricated edge case: per
     * {@code HomeService.home()}, {@code liveNow} is {@code .orElse(null)} whenever there's no
     * currently-live episode. {@code HomeResponseDtoV1} has no {@code @JsonInclude(NON_NULL)}, so
     * Jackson must still serialize a present {@code "liveNow": null} field, not omit the key.
     */
    @Test
    void homeWithNoLiveEpisodeReturnsNullLiveNow() throws Exception {
        when(service.home()).thenReturn(new HomeResponseDtoV1(
            null, List.of(), List.of(), List.of(), List.of(), List.of(), List.of()));

        mvc.perform(get("/api/v1/home"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.liveNow").value(nullValue()));
    }
}
