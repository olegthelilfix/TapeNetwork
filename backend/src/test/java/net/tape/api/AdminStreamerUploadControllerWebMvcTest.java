package net.tape.api;

import net.tape.application.JwtAuthFilter;
import net.tape.application.JwtService;
import net.tape.application.SecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.client.RestClient;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Web-layer slice test for {@link AdminStreamerUploadController}. The whole point of routing
 * the streamer upload through the backend is that the write is authenticated: the endpoint
 * sits under {@code /api/admin/**}, which {@link SecurityConfig} guards with a valid editor/admin
 * JWT. This asserts an unauthenticated multipart POST is rejected with 401 (the streamer's own
 * {@code POST /videos} is unauthenticated, so this boundary is the protection). The happy proxy
 * path talks to a live streamer over HTTP and is covered by the Go streamer tests instead.
 *
 * <p>{@code RestClient.Builder} isn't part of the WebMvc slice, so a real builder is supplied
 * here purely so the controller bean can be constructed; the outbound call is never reached
 * because security rejects the request first.
 */
@WebMvcTest(AdminStreamerUploadController.class)
@Import({SecurityConfig.class, JwtAuthFilter.class, JwtService.class,
         AdminStreamerUploadControllerWebMvcTest.TestConfig.class})
class AdminStreamerUploadControllerWebMvcTest {

    @TestConfiguration
    static class TestConfig {
        @Bean
        RestClient.Builder restClientBuilder() {
            return RestClient.builder();
        }
    }

    @Autowired
    MockMvc mvc;

    @Test
    void uploadWithoutAuthorizationHeaderIsRejected() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "clip.mp4", "video/mp4", "bytes".getBytes());

        mvc.perform(multipart("/api/admin/videos/stream/upload").file(file))
            .andExpect(status().isUnauthorized());
    }
}
