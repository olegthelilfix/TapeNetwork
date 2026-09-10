package net.tape.service;

import net.tape.model.Video;
import net.tape.orm.VideoEntity;
import net.tape.orm.VideoRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

/**
 * "Most popular" videos (#53): published videos ranked by EFFECTIVE view count
 * (persisted view_count + not-yet-flushed buffered views), most popular first.
 * Each returned model carries its numeric viewCount and a derived `views` display string.
 */
@Service
public class PopularVideosService {

    private final VideoRepository videos;
    private final VideoMapper videoMapper;
    private final ViewCountService viewCounts;

    public PopularVideosService(VideoRepository videos, VideoMapper videoMapper, ViewCountService viewCounts) {
        this.videos = videos;
        this.videoMapper = videoMapper;
        this.viewCounts = viewCounts;
    }

    @Transactional(readOnly = true)
    public List<Video> top(int limit) {
        int n = Math.clamp(limit, 1, 50);
        // Pull a slightly larger DB window by persisted count, then re-rank by effective count so
        // very recent (still-buffered) watches are reflected before the next flush.
        int window = Math.min(50, Math.max(n * 2, n));
        return videos.findByPublishedTrueOrderByViewCountDesc(PageRequest.of(0, window)).stream()
            .map(this::toModelWithViews)
            .sorted(Comparator.comparingLong(Video::getViewCount).reversed())
            .limit(n)
            .toList();
    }

    private Video toModelWithViews(VideoEntity e) {
        Video model = videoMapper.toModel(e);
        long effective = viewCounts.effective(e.getId(), e.getViewCount());
        model.setViewCount(effective);
        model.setViews(Format.views(effective));
        return model;
    }
}
