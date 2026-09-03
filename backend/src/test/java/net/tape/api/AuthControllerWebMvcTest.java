package net.tape.api;

import net.tape.api.support.JwtTestSupport;
import net.tape.application.JwtAuthFilter;
import net.tape.application.JwtService;
import net.tape.application.SecurityConfig;
import net.tape.orm.AdminUserEntity;
import net.tape.orm.AdminUserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Web-layer slice test for {@link AuthController}. This complements the existing plain-Mockito
 * {@code AuthControllerTest} (which unit-tests {@code login()}'s branching directly against a
 * bare controller instance) by exercising the real HTTP and security boundary instead:
 * {@code /login} is {@code permitAll()} in {@link SecurityConfig} (reachable with no token), while
 * {@code /me} sits under {@code /api/admin/**} and requires a real, valid JWT — see
 * {@code AdminShowControllerTest}'s Javadoc for the shared real-JWT-chain pattern used here.
 */
@WebMvcTest(AuthController.class)
@Import({SecurityConfig.class, JwtAuthFilter.class, JwtService.class, JwtTestSupport.class})
class AuthControllerWebMvcTest {

    @Autowired MockMvc mvc;
    @Autowired JwtService jwt;
    @Autowired JwtTestSupport jwtTestSupport;
    @MockitoBean AdminUserRepository users;
    @MockitoBean PasswordEncoder encoder;

    private String authHeader() {
        return jwtTestSupport.bearerHeader(jwt);
    }

    private static AdminUserEntity adminUser() {
        AdminUserEntity user = new AdminUserEntity();
        user.setEmail("admin@tape.local");
        user.setPasswordHash("hashed-password");
        user.setRole("ADMIN");
        user.setActive(true);
        return user;
    }

    @Test
    void loginWithValidCredentialsReturnsRealSignedToken() throws Exception {
        AdminUserEntity user = adminUser();
        when(users.findByEmailAndActiveTrue(user.getEmail())).thenReturn(Optional.of(user));
        when(encoder.matches("password", user.getPasswordHash())).thenReturn(true);

        mvc.perform(post("/api/admin/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"admin@tape.local\",\"password\":\"password\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.email").value("admin@tape.local"))
            .andExpect(jsonPath("$.role").value("ADMIN"))
            .andExpect(jsonPath("$.token").isNotEmpty());
    }

    @Test
    void loginWithWrongPasswordReturns401() throws Exception {
        AdminUserEntity user = adminUser();
        when(users.findByEmailAndActiveTrue(user.getEmail())).thenReturn(Optional.of(user));
        when(encoder.matches("wrong", user.getPasswordHash())).thenReturn(false);

        mvc.perform(post("/api/admin/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"admin@tape.local\",\"password\":\"wrong\"}"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.error").value("Invalid credentials"));
    }

    @Test
    void loginWithUnknownEmailReturns401() throws Exception {
        when(users.findByEmailAndActiveTrue("missing@tape.local")).thenReturn(Optional.empty());

        mvc.perform(post("/api/admin/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"missing@tape.local\",\"password\":\"anything\"}"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void meWithoutAuthorizationHeaderIsRejected() throws Exception {
        mvc.perform(get("/api/admin/auth/me"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void meWithValidTokenReturnsAuthenticatedEmail() throws Exception {
        mvc.perform(get("/api/admin/auth/me").header("Authorization", authHeader()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.email").value(JwtTestSupport.ADMIN_EMAIL));
    }
}
