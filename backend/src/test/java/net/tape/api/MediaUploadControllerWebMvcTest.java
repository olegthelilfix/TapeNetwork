package net.tape.api;

import net.tape.api.support.JwtTestSupport;
import net.tape.application.JwtAuthFilter;
import net.tape.application.JwtService;
import net.tape.application.SecurityConfig;
import net.tape.model.MediaAsset;
import net.tape.orm.MediaAssetEntity;
import net.tape.orm.MediaAssetRepository;
import net.tape.service.MediaMapper;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Web-layer slice test for {@link MediaUploadController}. This complements the existing
 * plain-Mockito {@code MediaUploadControllerTest} (which unit-tests filename sanitization by
 * calling the controller directly against a real {@code @TempDir}) by exercising the real HTTP
 * and security boundary instead: {@code /api/admin/media/upload} sits under
 * {@code /api/admin/**} in {@link SecurityConfig}, so it requires a real, valid JWT — see
 * {@code AdminShowControllerTest}'s Javadoc for the shared real-JWT-chain pattern used here.
 *
 * <p>{@code tape.media.dir} is pointed at a real temp directory via {@link DynamicPropertySource}
 * (created directly with {@link Files#createTempDirectory}, not JUnit's {@code @TempDir}
 * extension, so there's no ordering ambiguity between when the directory exists and when the
 * property is registered — {@code @DynamicPropertySource} runs before the Spring context, and
 * this way the directory is guaranteed to exist by then).
 */
@WebMvcTest(MediaUploadController.class)
@Import({SecurityConfig.class, JwtAuthFilter.class, JwtService.class, JwtTestSupport.class})
class MediaUploadControllerWebMvcTest {

    private static Path mediaDir;

    @DynamicPropertySource
    static void mediaDirProperty(DynamicPropertyRegistry registry) throws IOException {
        mediaDir = Files.createTempDirectory("media-upload-webmvc-test");
        registry.add("tape.media.dir", () -> mediaDir.toString());
    }

    @AfterAll
    static void deleteMediaDir() throws IOException {
        try (var paths = Files.walk(mediaDir)) {
            paths.sorted(Comparator.reverseOrder()).forEach(path -> {
                try {
                    Files.delete(path);
                } catch (IOException e) {
                    throw new java.io.UncheckedIOException(e);
                }
            });
        }
    }

    @Autowired MockMvc mvc;
    @Autowired JwtService jwt;
    @Autowired JwtTestSupport jwtTestSupport;
    @MockitoBean MediaAssetRepository repo;
    @MockitoBean MediaMapper mapper;

    private String authHeader() {
        return jwtTestSupport.bearerHeader(jwt);
    }

    @Test
    void uploadWithoutAuthorizationHeaderIsRejected() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "logo.png", "image/png", "img".getBytes());

        mvc.perform(multipart("/api/admin/media/upload").file(file))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void uploadWithValidTokenStoresFileAndReturnsMappedAsset() throws Exception {
        MediaAssetEntity saved = new MediaAssetEntity();
        MediaAsset result = new MediaAsset();
        result.setId(1L);
        result.setFilename("logo.png");
        result.setKind("image");
        ArgumentCaptor<MediaAssetEntity> entityCaptor = ArgumentCaptor.forClass(MediaAssetEntity.class);
        when(repo.save(entityCaptor.capture())).thenReturn(saved);
        when(mapper.toModel(saved)).thenReturn(result);
        MockMultipartFile file = new MockMultipartFile("file", "logo.png", "image/png", "img".getBytes());

        mvc.perform(multipart("/api/admin/media/upload").file(file).header("Authorization", authHeader()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.filename").value("logo.png"))
            .andExpect(jsonPath("$.kind").value("image"));

        MediaAssetEntity persisted = entityCaptor.getValue();
        assertEquals("logo.png", persisted.getFilename());
        assertEquals("image/png", persisted.getMime());
        assertEquals("image", persisted.getKind());
    }

    /**
     * Same sanitization behavior the plain-Mockito test already covers directly, exercised here
     * through the real HTTP multipart path instead — a hostile filename must not escape
     * {@code tape.media.dir} on disk, and the sanitized name is exactly what a real client's
     * upload would produce.
     */
    @Test
    void uploadSanitizesHostileFilenameOnRealHttpPath() throws Exception {
        when(repo.save(any(MediaAssetEntity.class))).thenReturn(new MediaAssetEntity());
        when(mapper.toModel(any(MediaAssetEntity.class))).thenReturn(new MediaAsset());
        MockMultipartFile file = new MockMultipartFile(
            "file", "../../evil/logo.PNG", "image/png", "image".getBytes());

        mvc.perform(multipart("/api/admin/media/upload").file(file).header("Authorization", authHeader()))
            .andExpect(status().isOk());

        Path written;
        try (var files = Files.list(mediaDir)) {
            written = files.findFirst().orElseThrow();
        }
        String storedName = written.getFileName().toString();
        assertTrue(storedName.endsWith("_.._.._evil_logo.PNG"));
        assertFalse(storedName.contains("/"));
    }
}
