package net.tape.api;

/** Public (v1) DTO. */
public record SubcategoryDetailDtoV1(
    String slug,
    String name,
    String blurb,
    String categorySlug,
    String categoryName,
    java.util.List<VideoDtoV1> videos) {}
