package net.tape.api;

/** Public (v1) compact person entry for lists / the header menu. Id-less, slug-addressed. */
public record PersonSummaryDtoV1(
    String slug,
    String name,
    String initials) {}
