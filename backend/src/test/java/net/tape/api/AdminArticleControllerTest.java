package net.tape.api;

import net.tape.api.support.JwtTestSupport;
import net.tape.application.JwtAuthFilter;
import net.tape.application.JwtService;
import net.tape.application.SecurityConfig;
import net.tape.model.Article;
import net.tape.service.ArticleStore;
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
 * Stretch-goal coverage (per the resolved plan): a second {@code ContentStore}-backed
 * {@link AbstractCrudController} example alongside {@link AdminVideoControllerTest}, since
 * {@link ArticleStore} is an equally important content type. See
 * {@link AdminShowControllerTest}'s Javadoc for the shared real-JWT-chain auth pattern used here.
 */
@WebMvcTest(AdminArticleController.class)
@Import({SecurityConfig.class, JwtAuthFilter.class, JwtService.class, JwtTestSupport.class})
class AdminArticleControllerTest {

    @Autowired MockMvc mvc;
    @Autowired JwtService jwt;
    @Autowired JwtTestSupport jwtTestSupport;
    @MockitoBean ArticleStore store;

    private String authHeader() {
        return jwtTestSupport.bearerHeader(jwt);
    }

    @Test
    void listWithoutAuthorizationHeaderIsRejected() throws Exception {
        mvc.perform(get("/api/admin/articles"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void listWithInvalidTokenIsRejected() throws Exception {
        mvc.perform(get("/api/admin/articles").header("Authorization", "Bearer not-a-real-token"))
            .andExpect(status().isUnauthorized());
    }

    /**
     * The 401 boundary matters most on the write verbs, not the read path — see
     * {@code AdminShowControllerTest.deleteWithoutAuthorizationHeaderIsRejected}'s Javadoc.
     */
    @Test
    void deleteWithoutAuthorizationHeaderIsRejected() throws Exception {
        mvc.perform(delete("/api/admin/articles/1"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void listWithValidTokenReturnsArticlesIncludingId() throws Exception {
        Article article = new Article();
        article.setId(1L);
        article.setSlug("earnings-preview");
        when(store.findAll()).thenReturn(List.of(article));

        mvc.perform(get("/api/admin/articles").header("Authorization", authHeader()))
            .andExpect(status().isOk())
            .andExpect(header().string("X-Total-Count", "1"))
            .andExpect(jsonPath("$[0].id").value(1))
            .andExpect(jsonPath("$[0].slug").value("earnings-preview"));
    }

    @Test
    void getOneReturns404WhenArticleDoesNotExist() throws Exception {
        when(store.findById(99L)).thenReturn(Optional.empty());

        mvc.perform(get("/api/admin/articles/99").header("Authorization", authHeader()))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void createDelegatesToStoreAndReturnsCreatedArticle() throws Exception {
        Article created = new Article();
        created.setId(2L);
        created.setSlug("new-article");
        when(store.create(any(Article.class))).thenReturn(created);

        mvc.perform(post("/api/admin/articles")
                .header("Authorization", authHeader())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"slug\":\"new-article\",\"title\":\"New Article\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(2))
            .andExpect(jsonPath("$.slug").value("new-article"));
        verify(store).create(any(Article.class));
    }

    @Test
    void updateDelegatesToStoreAndReturnsUpdatedArticle() throws Exception {
        Article updated = new Article();
        updated.setId(1L);
        updated.setSlug("earnings-preview");
        updated.setTitle("Updated title");
        when(store.update(eq(1L), any(Article.class))).thenReturn(updated);

        mvc.perform(patch("/api/admin/articles/1")
                .header("Authorization", authHeader())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"Updated title\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.title").value("Updated title"));
    }

    @Test
    void deleteDelegatesToStoreAndReturnsDeletedArticle() throws Exception {
        Article deleted = new Article();
        deleted.setId(1L);
        deleted.setSlug("earnings-preview");
        when(store.delete(1L)).thenReturn(deleted);

        mvc.perform(delete("/api/admin/articles/1").header("Authorization", authHeader()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1));
        verify(store).delete(1L);
    }
}
