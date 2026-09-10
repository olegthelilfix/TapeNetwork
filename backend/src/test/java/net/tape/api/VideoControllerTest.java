package net.tape.api;

import net.tape.application.JwtAuthFilter;
import net.tape.application.JwtService;
import net.tape.application.SecurityConfig;
import net.tape.model.Video;
import net.tape.service.PopularVideosService;
import net.tape.service.VideoMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Web-layer slice test for GET /api/v1/videos/popular (#53). Public, id-less payload. */
@WebMvcTest(VideoController.class)
@Import({SecurityConfig.class, JwtAuthFilter.class, JwtService.class})
class VideoControllerTest {

    @Autowired MockMvc mvc;
    @MockitoBean PopularVideosService popular;
    @MockitoBean VideoMapper mapper;

    private static Video video(String slug, long viewCount, String views) {
        Video v = new Video();
        v.setSlug(slug);
        v.setTitle("Title " + slug);
        v.setViewCount(viewCount);
        v.setViews(views);
        return v;
    }

    private static VideoDtoV1 dto(String slug, long viewCount, String views) {
        return new VideoDtoV1(slug, "Title " + slug, null, null, null, null,
            "Market Open", "Markets", views, viewCount, List.of(), List.of(), List.of(), null);
    }

    @Test
    void popularReturnsTopVideosOrderedWithNoId() throws Exception {
        Video a = video("top", 5000, "5K");
        Video b = video("second", 1200, "1.2K");
        when(popular.top(5)).thenReturn(List.of(a, b));
        when(mapper.toDtoV1(a)).thenReturn(dto("top", 5000, "5K"));
        when(mapper.toDtoV1(b)).thenReturn(dto("second", 1200, "1.2K"));

        mvc.perform(get("/api/v1/videos/popular"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(2)))
            .andExpect(jsonPath("$[0].id").doesNotExist())
            .andExpect(jsonPath("$[0].slug").value("top"))
            .andExpect(jsonPath("$[0].views").value("5K"))
            .andExpect(jsonPath("$[0].viewCount").value(5000))
            .andExpect(jsonPath("$[1].slug").value("second"));
    }

    @Test
    void popularHonorsLimitParameter() throws Exception {
        when(popular.top(3)).thenReturn(List.of());

        mvc.perform(get("/api/v1/videos/popular").param("limit", "3"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(0)));

        verify(popular).top(eq(3));
    }
}
