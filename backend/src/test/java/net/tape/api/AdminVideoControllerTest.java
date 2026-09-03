package net.tape.api;

import net.tape.api.support.JwtTestSupport;
import net.tape.application.JwtAuthFilter;
import net.tape.application.JwtService;
import net.tape.application.SecurityConfig;
import net.tape.model.Video;
import net.tape.service.VideoStore;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
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
 * Web-layer slice test for {@link AdminVideoController}, the {@code ContentStore}-backed branch
 * of {@link AbstractCrudController} (as opposed to {@link AdminShowControllerTest}'s repo-backed
 * branch) — {@link VideoStore} extends {@code CachedContentStore<Video>} and is mocked wholesale
 * here, so the in-memory caching behavior itself is out of scope for this test.
 *
 * <p>See {@link AdminShowControllerTest}'s Javadoc for the shared real-JWT-chain auth pattern;
 * it isn't repeated in full here, but every test still goes through the real
 * {@code SecurityFilterChain}.
 */
@WebMvcTest(AdminVideoController.class)
@Import({SecurityConfig.class, JwtAuthFilter.class, JwtService.class, JwtTestSupport.class})
class AdminVideoControllerTest {

    @Autowired MockMvc mvc;
    @Autowired JwtService jwt;
    @Autowired JwtTestSupport jwtTestSupport;
    @MockitoBean VideoStore store;

    private String authHeader() {
        return jwtTestSupport.bearerHeader(jwt);
    }

    @Test
    void listWithoutAuthorizationHeaderIsRejected() throws Exception {
        mvc.perform(get("/api/admin/videos"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void listWithInvalidTokenIsRejected() throws Exception {
        mvc.perform(get("/api/admin/videos").header("Authorization", "Bearer not-a-real-token"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void listWithValidTokenReturnsVideosIncludingId() throws Exception {
        Video video = new Video();
        video.setId(1L);
        video.setSlug("earnings-call");
        when(store.findAll()).thenReturn(List.of(video));

        mvc.perform(get("/api/admin/videos").header("Authorization", authHeader()))
            .andExpect(status().isOk())
            .andExpect(header().string("X-Total-Count", "1"))
            .andExpect(jsonPath("$[0].id").value(1))
            .andExpect(jsonPath("$[0].slug").value("earnings-call"));
    }

    @Test
    void getOneWithValidTokenReturnsVideoById() throws Exception {
        Video video = new Video();
        video.setId(1L);
        video.setSlug("earnings-call");
        when(store.findById(1L)).thenReturn(Optional.of(video));

        mvc.perform(get("/api/admin/videos/1").header("Authorization", authHeader()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.slug").value("earnings-call"));
    }

    @Test
    void getOneReturns404WhenVideoDoesNotExist() throws Exception {
        when(store.findById(99L)).thenReturn(Optional.empty());

        mvc.perform(get("/api/admin/videos/99").header("Authorization", authHeader()))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void createDelegatesToStoreAndReturnsCreatedVideo() throws Exception {
        Video created = new Video();
        created.setId(2L);
        created.setSlug("new-video");
        when(store.create(any(Video.class))).thenReturn(created);

        mvc.perform(post("/api/admin/videos")
                .header("Authorization", authHeader())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"slug\":\"new-video\",\"title\":\"New Video\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(2))
            .andExpect(jsonPath("$.slug").value("new-video"));
        verify(store).create(any(Video.class));
    }

    @Test
    void updateDelegatesToStoreAndReturnsUpdatedVideo() throws Exception {
        Video updated = new Video();
        updated.setId(1L);
        updated.setSlug("earnings-call");
        updated.setTitle("Updated title");
        when(store.update(eq(1L), any(Video.class))).thenReturn(updated);

        mvc.perform(patch("/api/admin/videos/1")
                .header("Authorization", authHeader())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"Updated title\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.title").value("Updated title"));
    }

    @Test
    void deleteDelegatesToStoreAndReturnsDeletedVideo() throws Exception {
        Video deleted = new Video();
        deleted.setId(1L);
        deleted.setSlug("earnings-call");
        when(store.delete(1L)).thenReturn(deleted);

        mvc.perform(delete("/api/admin/videos/1").header("Authorization", authHeader()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1));
        verify(store).delete(1L);
    }
}
