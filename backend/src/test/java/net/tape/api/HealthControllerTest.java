package net.tape.api;

import net.tape.application.JwtAuthFilter;
import net.tape.application.JwtService;
import net.tape.application.SecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Smoke test for {@link HealthController}: zero collaborators, so there's nothing to mock.
 *
 * <p>{@code @Import({SecurityConfig.class, JwtAuthFilter.class, JwtService.class})} is required
 * here even though this is a public, unauthenticated endpoint: with {@code spring-security-web}/
 * {@code -config} on the classpath, {@code @WebMvcTest} auto-applies Spring Boot's default
 * security autoconfiguration (deny-all, generated password) unless a real
 * {@code SecurityFilterChain} bean exists in the test context. Importing the real
 * {@link SecurityConfig} (and the beans it depends on) makes the real
 * {@code /api/v1/**}.permitAll() rule govern the request instead, which is what actually proves
 * "reachable anonymously" rather than merely "no security filter ran." This import is repeated
 * on every public-controller test in this package for the same reason.
 *
 * <p>Beyond that, no dedicated auth assertion is added — the whole public-controller test suite
 * already demonstrates anonymous access, and the auth boundary is only interesting (and
 * asserted) on the admin controllers.
 */
@WebMvcTest(HealthController.class)
@Import({SecurityConfig.class, JwtAuthFilter.class, JwtService.class})
class HealthControllerTest {

    @Autowired MockMvc mvc;

    @Test
    void returnsOkStatusAndServiceName() throws Exception {
        mvc.perform(get("/api/v1/health"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.service").value("tape-backend"))
            .andExpect(jsonPath("$.status").value("ok"))
            .andExpect(jsonPath("$.time").exists());
    }
}
