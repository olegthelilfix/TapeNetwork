package net.tape.api;

import java.util.List;

/**
 * Public (v1) person page. Addressed by slug; carries no internal id.
 * Videos are the person's host/guest appearances (role distinguishable via the video's
 * people list); articles are the ones they authored.
 */
public record PersonDtoV1(
    String slug,
    String name,
    String initials,
    String bio,
    String imageUrl,
    List<PersonVideoDtoV1> videos,
    List<ArticleDtoV1> articles) {}
