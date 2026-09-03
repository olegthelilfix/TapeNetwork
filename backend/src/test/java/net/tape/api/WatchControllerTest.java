package net.tape.api;

import net.tape.application.JwtAuthFilter;
import net.tape.application.JwtService;
import net.tape.application.SecurityConfig;
import net.tape.service.NotFoundException;
import net.tape.service.WatchService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Web-layer slice test for {@link WatchController}'s single slug-lookup endpoint.
 * The real {@link SecurityConfig}/{@link JwtAuthFilter}/{@link JwtService} beans are imported so
 * the real {@code /api/v1/**}.permitAll() rule governs these anonymous requests — see
 * {@code HealthControllerTest}'s Javadoc for why {@code @WebMvcTest} needs this.
 */
@WebMvcTest(WatchController.class)
@Import({SecurityConfig.class, JwtAuthFilter.class, JwtService.class})
class WatchControllerTest {

    @Autowired MockMvc mvc;
    @MockitoBean WatchService service;

    @Test
    void watchReturnsPlayerDtoWithNoIdField() throws Exception {
        when(service.watch("earnings-call")).thenReturn(new PlayerDtoV1(
            "video", "earnings-call", "Q3 Earnings Call", "Full replay.", "Market Open",
            "market-open", "12:34", "/uploads/earnings-call.jpg", false, List.of("earnings"),
            Instant.parse("2026-01-01T00:00:00Z"), "/media/earnings-call.mp4"));

        mvc.perform(get("/api/v1/watch/earnings-call"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").doesNotExist())
            .andExpect(jsonPath("$.kind").value("video"))
            .andExpect(jsonPath("$.slug").value("earnings-call"))
            .andExpect(jsonPath("$.showSlug").value("market-open"))
            .andExpect(jsonPath("$.live").value(false));
    }

    @Test
    void watchReturns404WhenNothingMatchesTheSlug() throws Exception {
        when(service.watch("missing")).thenThrow(new NotFoundException("watch", "missing"));

        mvc.perform(get("/api/v1/watch/missing"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.status").value(404))
            .andExpect(jsonPath("$.error").value("Not Found"));
    }
}
