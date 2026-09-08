package net.tape.api;

import net.tape.application.JwtAuthFilter;
import net.tape.application.JwtService;
import net.tape.application.SecurityConfig;
import net.tape.model.ScheduleSlot;
import net.tape.service.ScheduleMapper;
import net.tape.service.ScheduleService;
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
 * Web-layer slice test for {@link ScheduleController}: a flat, unparameterized list endpoint.
 * The real {@link SecurityConfig}/{@link JwtAuthFilter}/{@link JwtService} beans are imported so
 * the real {@code /api/v1/**}.permitAll() rule governs this anonymous request — see
 * {@code HealthControllerTest}'s Javadoc for why {@code @WebMvcTest} needs this.
 */
@WebMvcTest(ScheduleController.class)
@Import({SecurityConfig.class, JwtAuthFilter.class, JwtService.class})
class ScheduleControllerTest {

    @Autowired MockMvc mvc;
    @MockitoBean ScheduleService service;
    @MockitoBean ScheduleMapper mapper;

    @Test
    void listReturnsScheduleItemsWithNoIdField() throws Exception {
        ScheduleSlot slot = new ScheduleSlot();
        slot.setShowSlug("market-open");
        when(service.list()).thenReturn(List.of(slot));
        when(mapper.toDtoV1(slot)).thenReturn(new ScheduleItemDtoV1(
            "9:00 ET", "Market Open", "market-open", "Jane Doe", true));

        mvc.perform(get("/api/v1/schedule"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].id").doesNotExist())
            .andExpect(jsonPath("$[0].timeEt").value("9:00 ET"))
            .andExpect(jsonPath("$[0].showName").value("Market Open"))
            .andExpect(jsonPath("$[0].showSlug").value("market-open"))
            .andExpect(jsonPath("$[0].hostsLabel").value("Jane Doe"))
            .andExpect(jsonPath("$[0].live").value(true));
    }

    @Test
    void listReturnsEmptyArrayWhenNoSlotsExist() throws Exception {
        when(service.list()).thenReturn(List.of());

        mvc.perform(get("/api/v1/schedule"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(0)));
    }
}
