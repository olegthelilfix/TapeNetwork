package net.tape.service;

import net.tape.orm.VideoEntity;
import net.tape.orm.VideoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.LongAdder;

/**
 * Real view counting (#53). Watches increment an in-memory buffer (no DB write on the hot
 * public GET path); a scheduled task flushes the accumulated deltas to {@code video.view_count}
 * atomically about once a minute. Reads return the EFFECTIVE count (persisted + buffered) so the
 * home "most popular" list and video detail reflect very recent watches without waiting for a flush.
 */
@Service
public class ViewCountService {

    private static final Logger log = LoggerFactory.getLogger(ViewCountService.class);

    private final VideoRepository videos;
    private final VideoStore videoStore;
    private final Map<Long, LongAdder> pending = new ConcurrentHashMap<>();

    public ViewCountService(VideoRepository videos, VideoStore videoStore) {
        this.videos = videos;
        this.videoStore = videoStore;
    }

    /** Record one watch of a video (buffered in memory). */
    public void recordView(Long videoId) {
        if (videoId == null) return;
        pending.computeIfAbsent(videoId, id -> new LongAdder()).increment();
    }

    /** Buffered (not-yet-flushed) delta for a video. */
    public long buffered(Long videoId) {
        LongAdder adder = pending.get(videoId);
        return adder == null ? 0L : adder.sum();
    }

    /** Effective view count = persisted + buffered. */
    public long effective(Long videoId, long persisted) {
        return persisted + buffered(videoId);
    }

    /**
     * Flush buffered deltas to the database roughly once a minute. Each video's delta is drained
     * atomically (sumThenReset) and added to the persisted counter via a single UPDATE; the
     * write-through video cache is evicted so subsequent reads see the new persisted value.
     */
    @Scheduled(fixedDelayString = "${tape.views.flush-ms:60000}", initialDelayString = "${tape.views.flush-ms:60000}")
    @Transactional
    public void flush() {
        if (pending.isEmpty()) return;
        List<Long> touched = new ArrayList<>(pending.keySet());
        long total = 0;
        for (Long id : touched) {
            LongAdder adder = pending.get(id);
            if (adder == null) continue;
            long delta = adder.sumThenReset();
            if (delta <= 0) continue;
            total += delta;
            int updated = videos.addViews(id, delta);
            if (updated == 0) {
                // Video no longer exists; drop its buffer.
                pending.remove(id);
            } else {
                videoStore.reload(id);
            }
        }
        // Prune empty adders so the map doesn't grow without bound.
        pending.entrySet().removeIf(e -> e.getValue().sum() == 0);
        if (total > 0) log.debug("Flushed {} views across {} videos", total, touched.size());
    }
}
