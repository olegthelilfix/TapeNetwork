package net.tape.api;

/** Public (v1) DTO. */
public record ShowDetailDtoV1(
    String slug,
    String name,
    String tagline,
    String blurb,
    String description,
    String scheduleSlot,
    int episodesCount,
    String hoursPerWeek,
    String monthlyViews,
    String imageUrl,
    java.util.List<HostDtoV1> hosts,
    java.util.List<EpisodeDtoV1> episodes) {}
