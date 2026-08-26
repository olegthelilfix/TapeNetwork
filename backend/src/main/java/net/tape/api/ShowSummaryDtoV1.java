package net.tape.api;

/** Public (v1) DTO. */
public record ShowSummaryDtoV1(
    String slug,
    String name,
    String tagline,
    String blurb,
    String scheduleSlot,
    String imageUrl) {}
