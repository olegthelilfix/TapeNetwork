package net.tape.api;

/** Public (v1) DTO. */
public record SubcategorySummaryDtoV1(
    String slug,
    String name,
    String blurb,
    String imageUrl,
    int videoCount) {}
