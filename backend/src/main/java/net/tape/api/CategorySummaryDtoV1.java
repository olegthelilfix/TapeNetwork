package net.tape.api;

/** Public (v1) DTO. */
public record CategorySummaryDtoV1(
    String slug,
    String name,
    String blurb,
    String imageUrl,
    int subcategoryCount,
    int videoCount,
    java.util.List<String> subNames) {}
