package net.tape.service;

import net.tape.model.Episode;
import net.tape.model.Host;
import net.tape.model.Show;
import net.tape.orm.*;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class ShowService {

    private final ShowRepository shows;
    private final HostRepository hosts;
    private final EpisodeRepository episodes;
    private final ShowMapper showMapper;
    private final HostMapper hostMapper;
    private final EpisodeMapper episodeMapper;

    public ShowService(ShowRepository shows, HostRepository hosts, EpisodeRepository episodes,
                       ShowMapper showMapper, HostMapper hostMapper, EpisodeMapper episodeMapper) {
        this.shows = shows; this.hosts = hosts; this.episodes = episodes;
        this.showMapper = showMapper; this.hostMapper = hostMapper; this.episodeMapper = episodeMapper;
    }

    @Cacheable(PublicCaches.SHOWS)
    public List<Show> list() {
        return shows.findByPublishedTrueOrderBySortAsc().stream().map(showMapper::toModel).toList();
    }

    @Cacheable(PublicCaches.SHOW_DETAIL)
    public Show bySlug(String slug) {
        ShowEntity s = shows.findBySlug(slug).orElseThrow(() -> new NotFoundException("show", slug));
        Show model = showMapper.toModel(s);
        List<Host> hostModels = hosts.findByShowIdOrderBySortAsc(s.getId()).stream().map(hostMapper::toModel).toList();
        List<Episode> epModels = episodes.findByShowIdAndPublishedTrueOrderByPublishedAtDesc(s.getId())
            .stream().map(episodeMapper::toModel).toList();
        model.setHosts(hostModels);
        model.setEpisodes(epModels);
        return model;
    }
}
