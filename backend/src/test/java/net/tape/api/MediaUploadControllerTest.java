package net.tape.api;

import net.tape.model.MediaAsset;
import net.tape.orm.MediaAssetEntity;
import net.tape.orm.MediaAssetRepository;
import net.tape.service.MediaMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MediaUploadControllerTest {

    @Mock MediaAssetRepository repo;
    @Mock MediaMapper mapper;
    @TempDir Path mediaDir;

    @AfterEach
    void clearRequestContext() {
        RequestContextHolder.resetRequestAttributes();
    }

    @Test
    void sanitizesPathSeparatorsBeforeWritingUpload() throws Exception {
        MediaAssetEntity saved = new MediaAssetEntity();
        MediaAsset result = new MediaAsset();
        when(repo.save(any(MediaAssetEntity.class))).thenReturn(saved);
        when(mapper.toModel(saved)).thenReturn(result);
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(
            new MockHttpServletRequest("POST", "/api/admin/media/upload"),
            new MockHttpServletResponse()));

        MockMultipartFile file = new MockMultipartFile(
            "file", "../evil/logo.PNG", "image/png", "image".getBytes());
        MediaAsset actual = new MediaUploadController(repo, mapper, mediaDir.toString()).upload(file);

        assertEquals(result, actual);
        Path written;
        try (var files = Files.list(mediaDir)) {
            written = files.findFirst().orElseThrow();
        }
        assertEquals("image", Files.readString(written));
        assertTrue(written.getFileName().toString().endsWith("_.._evil_logo.PNG"));
        assertFalse(written.getFileName().toString().contains("/"));

        ArgumentCaptor<MediaAssetEntity> captor = ArgumentCaptor.forClass(MediaAssetEntity.class);
        verify(repo).save(captor.capture());
        assertEquals("../evil/logo.PNG", captor.getValue().getFilename());
        assertEquals("image", captor.getValue().getKind());
        assertEquals("image/png", captor.getValue().getMime());
        verify(mapper).toModel(saved);
    }
}
