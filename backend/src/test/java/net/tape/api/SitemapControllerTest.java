package net.tape.api;

import net.tape.application.JwtAuthFilter;
import net.tape.application.JwtService;
import net.tape.application.SecurityConfig;
import net.tape.model.Article;
import net.tape.model.Video;
import net.tape.orm.CategoryEntity;
import net.tape.orm.CategoryRepository;
import net.tape.orm.EpisodeEntity;
import net.tape.orm.EpisodeRepository;
import net.tape.orm.ShowEntity;
import net.tape.orm.ShowRepository;
import net.tape.orm.SubcategoryEntity;
import net.tape.orm.SubcategoryRepository;
import net.tape.service.ArticleStore;
import net.tape.service.VideoStore;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.hasItems;
import static org.hamcrest.Matchers.hasSize;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Web-layer slice test for {@link SitemapController}. Unlike every other public controller, this
 * one talks directly to repositories/stores (no {@code *Service}/{@code *Mapper} layer) and
 * returns a local {@code SitemapEntry} record rather than a {@code *DtoV1} — so all six
 * collaborators need mocking just to load the {@code @WebMvcTest} context.
 *
 * <p>Two levels of coverage, per the resolved plan: a required "lighter" test that only checks
 * the four static entries show up when every collaborator is empty, and a stretch test that
 * feeds one entity through each collaborator to pin the per-entity {@code SitemapEntry} mapping
 * (path shape and {@code lastmod} formatting).
 *
 * <p>The real {@link SecurityConfig}/{@link JwtAuthFilter}/{@link JwtService} beans are imported
 * so the real {@code /api/v1/**}.permitAll() rule (rather than Spring Boot's default deny-all)
 * governs this anonymous request — see {@code HealthControllerTest}'s Javadoc for why.
 */
@WebMvcTest(SitemapController.class)
@Import({SecurityConfig.class, JwtAuthFilter.class, JwtService.class})
class SitemapControllerTest {

    @Autowired MockMvc mvc;
    @MockitoBean ShowRepository shows;
    @MockitoBean EpisodeRepository episodes;
    @MockitoBean CategoryRepository categories;
    @MockitoBean SubcategoryRepository subcategories;
    @MockitoBean VideoStore videos;
    @MockitoBean ArticleStore articles;

    @Test
    void includesOnlyTheFourStaticEntriesWhenNoContentExists() throws Exception {
        // No stubbing needed: Mockito's default answer for an unstubbed List-returning method
        // is an empty list, which is exactly the "no published content" case here.
        mvc.perform(get("/api/v1/sitemap-data"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(4)))
            .andExpect(jsonPath("$[*].loc", containsInAnyOrder("/", "/shows", "/on-demand", "/articles")));
    }

    @Test
    void mapsOneEntityFromEachCollaboratorIntoItsSitemapEntry() throws Exception {
        ShowEntity show = new ShowEntity();
        show.setSlug("market-open");
        show.setUpdatedAt(Instant.parse("2026-01-15T00:00:00Z"));
        when(shows.findByPublishedTrueOrderBySortAsc()).thenReturn(List.of(show));

        EpisodeEntity episode = new EpisodeEntity();
        episode.setSlug("ep-1");
        episode.setPublished(true);
        episode.setUpdatedAt(Instant.parse("2026-01-16T00:00:00Z"));
        when(episodes.findAll()).thenReturn(List.of(episode));

        CategoryEntity category = new CategoryEntity();
        category.setSlug("markets");
        when(categories.findByPublishedTrueOrderBySortAsc()).thenReturn(List.of(category));

        CategoryEntity parentCategory = new CategoryEntity();
        parentCategory.setSlug("markets");
        SubcategoryEntity subcategory = new SubcategoryEntity();
        subcategory.setSlug("stocks");
        subcategory.setCategory(parentCategory);
        when(subcategories.findAll()).thenReturn(List.of(subcategory));

        Video video = new Video();
        video.setSlug("video-1");
        video.setPublished(true);
        video.setUpdatedAt(Instant.parse("2026-01-17T00:00:00Z"));
        when(videos.findAll()).thenReturn(List.of(video));

        Article article = new Article();
        article.setSlug("article-1");
        article.setPublished(true);
        article.setUpdatedAt(Instant.parse("2026-01-18T00:00:00Z"));
        when(articles.findAll()).thenReturn(List.of(article));

        mvc.perform(get("/api/v1/sitemap-data"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(10)))
            .andExpect(jsonPath("$[*].loc", hasItems(
                "/", "/shows", "/on-demand", "/articles",
                "/shows/market-open", "/watch/ep-1", "/on-demand/markets",
                "/on-demand/markets/stocks", "/watch/video-1", "/articles/article-1")))
            .andExpect(jsonPath("$[?(@.loc=='/shows/market-open')].lastmod").value("2026-01-15"))
            .andExpect(jsonPath("$[?(@.loc=='/watch/ep-1')].lastmod").value("2026-01-16"))
            .andExpect(jsonPath("$[?(@.loc=='/watch/video-1')].lastmod").value("2026-01-17"))
            .andExpect(jsonPath("$[?(@.loc=='/articles/article-1')].lastmod").value("2026-01-18"));
    }
}
