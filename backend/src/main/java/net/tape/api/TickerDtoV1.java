package net.tape.api;

/** Public (v1) DTO. */
public record TickerDtoV1(
    String symbol,
    String price,
    String change,
    String direction) {}
