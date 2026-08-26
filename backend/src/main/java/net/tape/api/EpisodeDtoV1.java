package net.tape.api;

/** Public (v1) DTO. */
public record EpisodeDtoV1(
    String slug,
    String epNo,
    String title,
    String description,
    java.time.Instant publishedAt,
    Integer durationSec,
    String durationLabel,
    String views,
    boolean live,
    java.util.List<String> tags,
    String imageUrl) {}
