package net.tape.api;

import net.tape.api.support.JwtTestSupport;
import net.tape.application.JwtAuthFilter;
import net.tape.application.JwtService;
import net.tape.application.SecurityConfig;
import net.tape.model.Show;
import net.tape.orm.ShowEntity;
import net.tape.orm.ShowRepository;
import net.tape.service.ShowMapper;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Web-layer slice test for {@link AdminShowController}, the repo-backed branch of
 * {@link AbstractCrudController} (see the class Javadoc there for the two constructor shapes).
 * {@code AdminShowController} is package-private, so this test lives in {@code net.tape.api} —
 * the same package — to compile at all.
 *
 * <p>Per the resolved plan, this exercises the <em>real</em> JWT chain rather than mocking
 * {@link JwtService} or using {@code @WithMockUser}: importing the real {@link SecurityConfig},
 * {@link JwtAuthFilter} and {@link JwtService} beans puts the real
 * {@code SecurityFilterChain} into the test context, which {@code spring-security-test}'s MockMvc
 * integration then enforces exactly like production. {@link JwtTestSupport} (also imported) mints
 * a real signed token via the real {@code JwtService} bean — see its Javadoc for the full pattern.
 *
 * <p>Unlike the public {@code *DtoV1} contract, the admin API speaks the domain model directly
 * (has {@code id}, per {@code CLAUDE.md}), so — unlike the public-controller tests in this
 * package — these assertions expect {@code id} to be present, not absent.
 */
@WebMvcTest(AdminShowController.class)
@Import({SecurityConfig.class, JwtAuthFilter.class, JwtService.class, JwtTestSupport.class})
class AdminShowControllerTest {

    @Autowired MockMvc mvc;
    @Autowired JwtService jwt;
    @Autowired JwtTestSupport jwtTestSupport;
    @MockitoBean ShowRepository repo;
    @MockitoBean ShowMapper mapper;

    private String authHeader() {
        return jwtTestSupport.bearerHeader(jwt);
    }

    @Test
    void listWithoutAuthorizationHeaderIsRejected() throws Exception {
        mvc.perform(get("/api/admin/shows"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void listWithInvalidTokenIsRejected() throws Exception {
        mvc.perform(get("/api/admin/shows").header("Authorization", "Bearer not-a-real-token"))
            .andExpect(status().isUnauthorized());
    }

    /**
     * The 401 boundary matters most on the write verbs, not the read path — a security
     * regression that only leaves GET protected and opens up POST/PATCH/DELETE would still
     * pass a suite that only checks {@code list}. Pin it on delete as the cheapest write verb.
     */
    @Test
    void deleteWithoutAuthorizationHeaderIsRejected() throws Exception {
        mvc.perform(delete("/api/admin/shows/1"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void listWithValidTokenReturnsShowsIncludingId() throws Exception {
        ShowEntity entity = new ShowEntity();
        entity.setId(1L);
        entity.setSlug("market-open");
        when(repo.findAll(any(Pageable.class))).thenReturn(pageOf(entity));
        Show model = new Show();
        model.setId(1L);
        model.setSlug("market-open");
        when(mapper.toModel(entity)).thenReturn(model);

        mvc.perform(get("/api/admin/shows").header("Authorization", authHeader()))
            .andExpect(status().isOk())
            .andExpect(header().string("X-Total-Count", "1"))
            .andExpect(jsonPath("$[0].id").value(1))
            .andExpect(jsonPath("$[0].slug").value("market-open"));
    }

    /**
     * {@code listWithValidTokenReturnsShowsIncludingId} above stubs {@code any(Pageable.class)}
     * and a self-sized page, so it can't tell whether {@code _start}/{@code _end} were parsed
     * correctly, and its {@code X-Total-Count} assertion can't distinguish
     * {@code getTotalElements()} from {@code getContent().size()} (both happen to be 1). This
     * test closes both gaps: it captures the actual {@link Pageable} built from explicit
     * {@code _start}/{@code _end} params and checks the page number/size math, and it returns a
     * total (42) that differs from the page's content size (1), so the header assertion only
     * passes if {@code X-Total-Count} really reflects {@code getTotalElements()}.
     */
    @Test
    void listWithExplicitStartAndEndBuildsCorrectPageRequest() throws Exception {
        ShowEntity entity = new ShowEntity();
        entity.setId(1L);
        entity.setSlug("market-open");
        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
        // total (100) must stay above offset+pageSize (25+25=50), or PageImpl's constructor
        // silently recomputes it as offset+content.size() instead of trusting this value.
        when(repo.findAll(pageableCaptor.capture()))
            .thenReturn(new PageImpl<>(List.of(entity), PageRequest.of(1, 25), 100));
        Show model = new Show();
        model.setId(1L);
        model.setSlug("market-open");
        when(mapper.toModel(entity)).thenReturn(model);

        mvc.perform(get("/api/admin/shows")
                .param("_start", "25")
                .param("_end", "50")
                .header("Authorization", authHeader()))
            .andExpect(status().isOk())
            .andExpect(header().string("X-Total-Count", "100"));

        Pageable used = pageableCaptor.getValue();
        assertEquals(1, used.getPageNumber());
        assertEquals(25, used.getPageSize());
    }

    @Test
    void getOneWithValidTokenReturnsShowById() throws Exception {
        ShowEntity entity = new ShowEntity();
        entity.setId(1L);
        entity.setSlug("market-open");
        when(repo.findById(1L)).thenReturn(Optional.of(entity));
        Show model = new Show();
        model.setId(1L);
        model.setSlug("market-open");
        when(mapper.toModel(entity)).thenReturn(model);

        mvc.perform(get("/api/admin/shows/1").header("Authorization", authHeader()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.slug").value("market-open"));
    }

    @Test
    void getOneReturns404WhenShowDoesNotExist() throws Exception {
        when(repo.findById(99L)).thenReturn(Optional.empty());

        mvc.perform(get("/api/admin/shows/99").header("Authorization", authHeader()))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void createPersistsNewShowAndReturnsIt() throws Exception {
        ShowEntity saved = new ShowEntity();
        saved.setId(2L);
        saved.setSlug("new-show");
        when(repo.save(any(ShowEntity.class))).thenReturn(saved);
        Show model = new Show();
        model.setId(2L);
        model.setSlug("new-show");
        when(mapper.toModel(saved)).thenReturn(model);

        mvc.perform(post("/api/admin/shows")
                .header("Authorization", authHeader())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"slug\":\"new-show\",\"name\":\"New Show\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(2))
            .andExpect(jsonPath("$.slug").value("new-show"));
        verify(repo).save(any(ShowEntity.class));
    }

    @Test
    void updatePatchesExistingShowAndReturnsIt() throws Exception {
        ShowEntity entity = new ShowEntity();
        entity.setId(1L);
        entity.setSlug("market-open");
        when(repo.findById(1L)).thenReturn(Optional.of(entity));
        when(repo.save(entity)).thenReturn(entity);
        Show updated = new Show();
        updated.setId(1L);
        updated.setSlug("market-open");
        updated.setTagline("Updated tagline");
        when(mapper.toModel(entity)).thenReturn(updated);

        mvc.perform(patch("/api/admin/shows/1")
                .header("Authorization", authHeader())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"tagline\":\"Updated tagline\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.tagline").value("Updated tagline"));
    }

    @Test
    void deleteRemovesShowAndReturnsIt() throws Exception {
        ShowEntity entity = new ShowEntity();
        entity.setId(1L);
        entity.setSlug("market-open");
        when(repo.findById(1L)).thenReturn(Optional.of(entity));
        Show model = new Show();
        model.setId(1L);
        model.setSlug("market-open");
        when(mapper.toModel(entity)).thenReturn(model);

        mvc.perform(delete("/api/admin/shows/1").header("Authorization", authHeader()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1));
        verify(repo).delete(entity);
    }

    private static Page<ShowEntity> pageOf(ShowEntity... entities) {
        return new PageImpl<>(List.of(entities));
    }
}
