package net.tape.api;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * Admin: proxy a video upload to tape-streamer over the internal network.
 *
 * <p>The streamer's own {@code POST /videos} is NOT reachable from the internet — the edge
 * proxy (Caddy) only forwards GET/HEAD/OPTIONS to {@code video.*}, so writes must come through
 * here. This endpoint sits under {@code /api/admin/**}, which {@code SecurityConfig} guards with
 * the editor/admin JWT, so the upload is authenticated by the same token the CMS already holds
 * (a browser SPA can keep no real secret of its own). Listing + HLS streaming stay direct and
 * public because they are read-only.
 *
 * <p>Upstream status and body are passed through verbatim (202 accepted / 400 bad extension /
 * 409 duplicate) so the CMS can surface the streamer's message unchanged.
 */
@RestController
@RequestMapping("/api/admin/videos/stream")
class AdminStreamerUploadController {

    private final RestClient streamer;

    AdminStreamerUploadController(RestClient.Builder builder,
                                  @Value("${tape.streamer.url}") String streamerUrl) {
        this.streamer = builder.baseUrl(streamerUrl.replaceAll("/+$", "")).build();
    }

    @PostMapping(path = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<byte[]> upload(@RequestParam("file") MultipartFile file) throws IOException {
        final String filename = file.getOriginalFilename() == null ? "upload" : file.getOriginalFilename();
        final byte[] bytes = file.getBytes();

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new ByteArrayResource(bytes) {
            @Override
            public String getFilename() {
                return filename;
            }
        });

        ResponseEntity<byte[]> upstream = streamer.post()
            .uri("/videos")
            .contentType(MediaType.MULTIPART_FORM_DATA)
            .body(body)
            .retrieve()
            // Don't throw on 4xx/5xx: pass the streamer's status + body straight back to the CMS.
            .onStatus(HttpStatusCode::isError, (request, response) -> { })
            .toEntity(byte[].class);

        MediaType contentType = upstream.getHeaders().getContentType();
        ResponseEntity.BodyBuilder out = ResponseEntity.status(upstream.getStatusCode());
        if (contentType != null) {
            out.contentType(contentType);
        }
        return out.body(upstream.getBody());
    }
}
