package net.tape.api;

import net.tape.application.JwtAuthFilter;
import net.tape.application.JwtService;
import net.tape.application.SecurityConfig;
import net.tape.service.NotFoundException;
import net.tape.service.PersonService;
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
 * Web-layer slice test for the public person page {@code GET /api/v1/people/{slug}} (#56).
 * Mirrors {@link ShowControllerTest}: {@code /api/v1/**} is {@code permitAll()} but the real
 * security beans are still imported so the rule governs the request. Public payload is id-less.
 */
@WebMvcTest(PersonController.class)
@Import({SecurityConfig.class, JwtAuthFilter.class, JwtService.class})
class PersonControllerTest {

    @Autowired MockMvc mvc;
    @MockitoBean PersonService service;

    @Test
    void bySlugReturnsPersonWithVideosAndArticlesAndNoId() throws Exception {
        PersonDtoV1 dto = new PersonDtoV1(
            "jane-doe", "Jane Doe", "JD", "Markets anchor.", "/uploads/jane.jpg",
            List.of(new PersonVideoDtoV1("chips-lead", "Chips lead", "The Opening Bell",
                "12:34", "/uploads/chips.jpg", "host")),
            List.of(new ArticleDtoV1("fed-last-mile", "Macro & Rates", "The Fed's last mile",
                "A positioning problem.", "Jane Doe", null, 6, "/uploads/fed.jpg", null)));
        when(service.bySlug("jane-doe")).thenReturn(dto);

        mvc.perform(get("/api/v1/people/jane-doe"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").doesNotExist())
            .andExpect(jsonPath("$.slug").value("jane-doe"))
            .andExpect(jsonPath("$.name").value("Jane Doe"))
            .andExpect(jsonPath("$.bio").value("Markets anchor."))
            .andExpect(jsonPath("$.videos", hasSize(1)))
            .andExpect(jsonPath("$.videos[0].slug").value("chips-lead"))
            .andExpect(jsonPath("$.videos[0].role").value("host"))
            .andExpect(jsonPath("$.articles", hasSize(1)))
            .andExpect(jsonPath("$.articles[0].slug").value("fed-last-mile"))
            .andExpect(jsonPath("$.articles[0].id").doesNotExist());
    }

    @Test
    void listReturnsPersonSummaries() throws Exception {
        when(service.list()).thenReturn(List.of(
            new PersonSummaryDtoV1("jane-doe", "Jane Doe", "JD"),
            new PersonSummaryDtoV1("john-roe", "John Roe", "JR")));

        mvc.perform(get("/api/v1/people"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(2)))
            .andExpect(jsonPath("$[0].slug").value("jane-doe"))
            .andExpect(jsonPath("$[0].name").value("Jane Doe"))
            .andExpect(jsonPath("$[0].id").doesNotExist());
    }

    @Test
    void bySlugReturns404WhenPersonIsMissing() throws Exception {
        when(service.bySlug("missing")).thenThrow(new NotFoundException("person", "missing"));

        mvc.perform(get("/api/v1/people/missing"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.status").value(404))
            .andExpect(jsonPath("$.error").value("Not Found"))
            .andExpect(jsonPath("$.message").exists())
            .andExpect(jsonPath("$.time").exists());
    }
}
