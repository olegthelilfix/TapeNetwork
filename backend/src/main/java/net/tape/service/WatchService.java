package net.tape.service;

import net.tape.api.PlayerDtoV1;
import net.tape.model.Episode;
import net.tape.model.Video;
import net.tape.orm.EpisodeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WatchService {
    private final VideoStore videos;
    private final EpisodeRepository episodes;
    private final EpisodeMapper episodeMapper;
    private final ViewCountService viewCounts;

    public WatchService(VideoStore videos, EpisodeRepository episodes, EpisodeMapper episodeMapper,
                        ViewCountService viewCounts) {
        this.videos = videos; this.episodes = episodes;
        this.episodeMapper = episodeMapper;
        this.viewCounts = viewCounts;
    }

    @Transactional(readOnly = true)
    public PlayerDtoV1 watch(String slug) {
        Video v = videos.findAll().stream().filter(video -> slug.equals(video.getSlug())).findFirst().orElse(null);
        if (v != null) {
            viewCounts.recordView(v.getId());
            return new PlayerDtoV1("video", v.getSlug(), v.getTitle(), v.getDescription(),
                v.getShowName(), v.getShowSlug(), Format.duration(v.getDurationSec()), v.getImageUrl(),
                false, java.util.Arrays.asList(v.getTags() == null ? new String[0] : v.getTags()),
                v.getPublishedAt(), v.getVideoUrl());
        }
        Episode e = episodes.findBySlug(slug).map(episodeMapper::toModel)
            .orElseThrow(() -> new NotFoundException("watch", slug));
        return new PlayerDtoV1("episode", e.getSlug(), e.getTitle(), e.getDescription(),
            e.getShowName(), e.getShowSlug(), Format.duration(e.getDurationSec()), e.getImageUrl(),
            e.isLive(), java.util.Arrays.asList(e.getTags() == null ? new String[0] : e.getTags()),
            e.getPublishedAt(), e.getVideoUrl());
    }
}
