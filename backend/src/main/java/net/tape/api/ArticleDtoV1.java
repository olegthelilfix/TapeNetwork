package net.tape.api;

import java.time.Instant;
import java.util.List;

/**
 * Public (v1) article representation. Deliberately omits internal ids and audit fields —
 * the outside world addresses articles by slug. Body is null in list responses.
 */
public record ArticleDtoV1(
    String slug,
    String category,
    String title,
    String dek,
    String author,
    List<String> body,
    Integer readMinutes,
    String imageUrl,
    Instant publishedAt) {}
