package net.tape.api;

/** Public (v1) DTO. */
public record HomeCardDtoV1(
    String refType,
    String slug,
    String title,
    String subtitle,
    String durationLabel,
    String imageUrl,
    boolean live,
    String views) {}
