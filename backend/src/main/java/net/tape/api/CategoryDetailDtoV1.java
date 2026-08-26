package net.tape.api;

/** Public (v1) DTO. */
public record CategoryDetailDtoV1(
    String slug,
    String name,
    String blurb,
    java.util.List<SubcategorySummaryDtoV1> subcategories) {}
