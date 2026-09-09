package net.tape.api;

/** A video a person appears in, with their role on it (host | guest) — for the person page. */
public record PersonVideoDtoV1(
    String slug,
    String title,
    String showName,
    String durationLabel,
    String imageUrl,
    String role) {}
