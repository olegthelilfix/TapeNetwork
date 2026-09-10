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
    String views,
    long viewCount,
    java.util.List<String> tags,
    java.util.List<SecurityDtoV1> securities,
    java.util.List<PersonRefDtoV1> people,
    String imageUrl) {}
