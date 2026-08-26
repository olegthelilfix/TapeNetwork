package net.tape.api;

/** Public (v1) DTO. */
public record ScheduleItemDtoV1(
    String timeEt,
    String showName,
    String showSlug,
    String hostsLabel,
    boolean live) {}
