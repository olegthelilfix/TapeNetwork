package net.tape.api;

import java.util.List;

/** Public (v1) aggregated home payload. */
public record HomeResponseDtoV1(
    HomeCardDtoV1 liveNow,
    List<HomeCardDtoV1> featured,
    List<HomeCardDtoV1> mostWatched,
    List<HomeCardDtoV1> upNext,
    List<TickerDtoV1> ticker,
    List<ScheduleItemDtoV1> schedule,
    List<ArticleDtoV1> latestArticles) {}
