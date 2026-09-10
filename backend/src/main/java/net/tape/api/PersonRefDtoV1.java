package net.tape.api;

/** Public (v1) DTO for a person referenced from a video, with their role on that video. */
public record PersonRefDtoV1(
    String slug,
    String name,
    String initials,
    String role) {}
