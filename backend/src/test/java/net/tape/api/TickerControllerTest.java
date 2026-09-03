package net.tape.api;

import net.tape.application.JwtAuthFilter;
import net.tape.application.JwtService;
import net.tape.application.SecurityConfig;
import net.tape.model.TickerQuote;
import net.tape.service.TickerMapper;
import net.tape.service.TickerService;
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
 * Web-layer slice test for {@link TickerController}: a flat, unparameterized list endpoint.
 * The real {@link SecurityConfig}/{@link JwtAuthFilter}/{@link JwtService} beans are imported so
 * the real {@code /api/v1/**}.permitAll() rule governs this anonymous request — see
 * {@code HealthControllerTest}'s Javadoc for why {@code @WebMvcTest} needs this.
 */
@WebMvcTest(TickerController.class)
@Import({SecurityConfig.class, JwtAuthFilter.class, JwtService.class})
class TickerControllerTest {

    @Autowired MockMvc mvc;
    @MockitoBean TickerService service;
    @MockitoBean TickerMapper mapper;

    @Test
    void listReturnsQuotesWithNoIdField() throws Exception {
        TickerQuote quote = new TickerQuote();
        quote.setSymbol("SPX");
        when(service.list()).thenReturn(List.of(quote));
        when(mapper.toDtoV1(quote)).thenReturn(new TickerDtoV1("SPX", "5,123.45", "+0.42%", "up"));

        mvc.perform(get("/api/v1/ticker"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].id").doesNotExist())
            .andExpect(jsonPath("$[0].symbol").value("SPX"))
            .andExpect(jsonPath("$[0].price").value("5,123.45"))
            .andExpect(jsonPath("$[0].change").value("+0.42%"))
            .andExpect(jsonPath("$[0].direction").value("up"));
    }

    @Test
    void listReturnsEmptyArrayWhenNoQuotesExist() throws Exception {
        when(service.list()).thenReturn(List.of());

        mvc.perform(get("/api/v1/ticker"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(0)));
    }
}
