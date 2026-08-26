package net.tape.service;

import net.tape.api.*;
import net.tape.model.Episode;
import net.tape.model.Video;
import net.tape.orm.EpisodeRepository;
import net.tape.orm.HomeBlockEntity;
import net.tape.orm.HomeBlockRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class HomeService {

    private final HomeBlockRepository blocks;
    private final EpisodeRepository episodes;
    private final VideoStore videos;
    private final EpisodeMapper episodeMapper;
    private final ArticleService articleService;
    private final ArticleMapper articleMapper;
    private final ScheduleService scheduleService;
    private final ScheduleMapper scheduleMapper;
    private final TickerService tickerService;
    private final TickerMapper tickerMapper;

    public HomeService(HomeBlockRepository blocks, EpisodeRepository episodes, VideoStore videos,
                       EpisodeMapper episodeMapper,
                       ArticleService articleService, ArticleMapper articleMapper,
                       ScheduleService scheduleService, ScheduleMapper scheduleMapper,
                       TickerService tickerService, TickerMapper tickerMapper) {
        this.blocks = blocks; this.episodes = episodes; this.videos = videos;
        this.episodeMapper = episodeMapper;
        this.articleService = articleService; this.articleMapper = articleMapper;
        this.scheduleService = scheduleService; this.scheduleMapper = scheduleMapper;
        this.tickerService = tickerService; this.tickerMapper = tickerMapper;
    }

    public HomeResponseDtoV1 home() {
        HomeCardDtoV1 liveNow = episodes.findFirstByLiveTrueAndPublishedTrueOrderByPublishedAtDesc()
            .map(e -> episodeCard(episodeMapper.toModel(e))).orElse(null);
        return new HomeResponseDtoV1(
            liveNow,
            cards("featured"),
            cards("most_watched"),
            cards("up_next"),
            tickerService.list().stream().map(tickerMapper::toDtoV1).toList(),
            scheduleService.list().stream().map(scheduleMapper::toDtoV1).toList(),
            articleService.latest().stream().map(articleMapper::toDtoV1).toList());
    }

    private List<HomeCardDtoV1> cards(String type) {
        List<HomeCardDtoV1> out = new ArrayList<>();
        for (HomeBlockEntity b : blocks.findByTypeOrderBySortAsc(type)) {
            HomeCardDtoV1 card = switch (b.getRefType() == null ? "" : b.getRefType()) {
                case "episode" -> episodes.findById(b.getRefId()).map(e -> episodeCard(episodeMapper.toModel(e))).orElse(null);
                case "video" -> videos.findById(b.getRefId()).map(this::videoCard).orElse(null);
                default -> null;
            };
            if (card != null) out.add(card);
        }
        return out;
    }

    private HomeCardDtoV1 episodeCard(Episode e) {
        return new HomeCardDtoV1("episode", e.getSlug(), e.getTitle(), e.getShowName(),
            Format.duration(e.getDurationSec()), e.getImageUrl(), e.isLive(), e.getViews());
    }

    private HomeCardDtoV1 videoCard(Video v) {
        return new HomeCardDtoV1("video", v.getSlug(), v.getTitle(), v.getShowName(),
            Format.duration(v.getDurationSec()), v.getImageUrl(), false, v.getViews());
    }
}
