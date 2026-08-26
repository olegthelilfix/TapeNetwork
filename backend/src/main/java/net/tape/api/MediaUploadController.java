package net.tape.api;

import net.tape.model.MediaAsset;
import net.tape.orm.MediaAssetEntity;
import net.tape.service.MediaMapper;
import net.tape.orm.MediaAssetRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;

/** Handles media file uploads from the CMS. Stores under tape.media.dir, served at /uploads/**. */
@RestController
@RequestMapping("/api/admin/media")
public class MediaUploadController {

    private final MediaAssetRepository repo;
    private final MediaMapper mapper;
    private final Path dir;

    public MediaUploadController(MediaAssetRepository repo, MediaMapper mapper, @Value("${tape.media.dir}") String mediaDir) {
        this.repo = repo;
        this.mapper = mapper;
        this.dir = Paths.get(mediaDir).toAbsolutePath();
    }

    @PostMapping("/upload")
    public MediaAsset upload(@RequestParam("file") MultipartFile file) throws IOException {
        Files.createDirectories(dir);
        String original = file.getOriginalFilename() == null ? "file" : file.getOriginalFilename();
        String safe = original.replaceAll("[^A-Za-z0-9._-]", "_");
        String name = System.nanoTime() + "_" + safe;
        Path target = dir.resolve(name);
        try (var in = file.getInputStream()) {
            Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
        }
        String url = ServletUriComponentsBuilder.fromCurrentContextPath()
            .path("/uploads/").path(name).toUriString();

        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase(Locale.ROOT);
        MediaAssetEntity asset = new MediaAssetEntity();
        asset.setFilename(original);
        asset.setUrl(url);
        asset.setMime(file.getContentType());
        asset.setKind(contentType.startsWith("video") ? "video" : "image");
        return mapper.toModel(repo.save(asset));
    }
}
