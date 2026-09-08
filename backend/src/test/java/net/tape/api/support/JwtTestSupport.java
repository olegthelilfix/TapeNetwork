package net.tape.api.support;

import net.tape.application.JwtService;
import org.springframework.boot.test.context.TestConfiguration;

/**
 * Shared helper for admin-controller {@code @WebMvcTest} slice tests that exercise the real
 * JWT authentication chain instead of mocking {@link JwtService} or using {@code @WithMockUser}.
 *
 * <p>Registered as a {@code @TestConfiguration} bean (rather than a static utility class) so it
 * can be {@code @Autowired} into the test class like any other collaborator, keeping the test
 * class's field list uniform and leaving room to grow (e.g. minting tokens for other roles)
 * without changing every call site.
 *
 * <p>Usage — import it alongside the real security beans so the real {@code SecurityFilterChain}
 * is present in the test's {@code ApplicationContext} (this is what makes
 * {@code spring-security-test}'s MockMvc integration enforce security exactly like production):
 *
 * <pre>{@code
 * @WebMvcTest(AdminShowController.class)
 * @Import({SecurityConfig.class, JwtAuthFilter.class, JwtService.class, JwtTestSupport.class})
 * class AdminShowControllerTest {
 *     @Autowired MockMvc mvc;
 *     @Autowired JwtService jwt;
 *     @Autowired JwtTestSupport jwtTestSupport;
 *
 *     @Test
 *     void authorizedRequestSucceeds() throws Exception {
 *         mvc.perform(get("/api/admin/shows")
 *                 .header("Authorization", jwtTestSupport.bearerHeader(jwt)))
 *             .andExpect(status().isOk());
 *     }
 *
 *     @Test
 *     void unauthenticatedRequestIsRejected() throws Exception {
 *         mvc.perform(get("/api/admin/shows")).andExpect(status().isUnauthorized());
 *     }
 * }
 * }</pre>
 */
@TestConfiguration
public class JwtTestSupport {

    /** Role minted onto every test token. Admin CRUD endpoints don't distinguish finer roles. */
    public static final String ADMIN_ROLE = "ADMIN";

    /** Subject (email) minted onto every test token. */
    public static final String ADMIN_EMAIL = "editor@tape.local";

    /** Mints a real, signed JWT for a test admin user via the given (real) {@link JwtService}. */
    public String mintAdminToken(JwtService jwt) {
        return jwt.issue(ADMIN_EMAIL, ADMIN_ROLE);
    }

    /** Convenience: the full {@code Authorization} header value carrying a minted admin token. */
    public String bearerHeader(JwtService jwt) {
        return "Bearer " + mintAdminToken(jwt);
    }
}
