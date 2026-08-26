package net.tape.api;

/** Public (v1) DTO. */
public record PlayerDtoV1(
    String kind,
    String slug,
    String title,
    String description,
    String showName,
    String showSlug,
    String durationLabel,
    String imageUrl,
    boolean live,
    java.util.List<String> tags,
    java.time.Instant publishedAt,
    String videoUrl) {}
