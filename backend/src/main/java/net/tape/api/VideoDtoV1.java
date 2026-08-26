package net.tape.api;

/** Public (v1) DTO. */
public record VideoDtoV1(
    String slug,
    String title,
    String description,
    java.time.Instant publishedAt,
    Integer durationSec,
    String durationLabel,
    String showName,
    String categoryName,
    java.util.List<String> tags,
    String imageUrl) {}
