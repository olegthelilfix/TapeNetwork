package net.tape.service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import net.tape.api.SearchHit;
import net.tape.orm.EpisodeEntity;
import net.tape.orm.ShowEntity;
import org.hibernate.search.mapper.orm.Search;
import org.hibernate.search.mapper.orm.session.SearchSession;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class SearchService {

    @PersistenceContext
    private EntityManager em;

    private final ArticleStore articles;
    private final VideoStore videos;
    private final MediaResolver media;

    public SearchService(ArticleStore articles, VideoStore videos, MediaResolver media) {
        this.articles = articles;
        this.videos = videos;
        this.media = media;
    }

    @Transactional(readOnly = true)
    public List<SearchHit> search(String q, String type, int limit) {
        if (q == null || q.isBlank()) return List.of();
        String query = q.toLowerCase(Locale.ROOT);
        int per = Math.min(Math.max(1, limit), 50);
        Set<String> types = (type == null || type.isBlank() || type.equalsIgnoreCase("all"))
            ? Set.of("show", "episode", "video", "article")
            : Set.of(type.toLowerCase(Locale.ROOT));

        List<SearchHit> hits = new ArrayList<>();
        SearchSession session = (types.contains("episode") || types.contains("show") || types.contains("video"))
            ? Search.session(em) : null;

        if (types.contains("article")) {
            articles.findAll().stream()
                .filter(a -> matches(query, a.getTitle(), a.getDek()))
                .limit(per)
                .forEach(a -> hits.add(new SearchHit("article", a.getSlug(), a.getTitle(),
                    a.getCategoryName(), a.getImageUrl(), "/articles/" + a.getSlug())));
        }
        if (types.contains("episode")) {
            session.search(EpisodeEntity.class)
                .where(f -> f.match().fields("title", "description").matching(q))
                .fetchHits(per)
                .forEach(e -> hits.add(new SearchHit("episode", e.getSlug(), e.getTitle(),
                    e.getShow() != null ? e.getShow().getName() : null,
                    media.url(e.getThumbMediaId()), "/watch/" + e.getSlug())));
        }
        if (types.contains("video")) {
            session.search(net.tape.orm.VideoEntity.class)
                .where(f -> f.match()
                    .fields("title", "description",
                        "securityLinks.security.symbol", "securityLinks.security.name",
                        "personLinks.person.name")
                    .matching(q))
                .fetchHits(per)
                .forEach(v -> hits.add(new SearchHit("video", v.getSlug(), v.getTitle(),
                    v.getShow() != null ? v.getShow().getName() : null,
                    media.url(v.getThumbMediaId()), "/watch/" + v.getSlug())));
        }
        if (types.contains("show")) {
            session.search(ShowEntity.class)
                .where(f -> f.match().fields("name", "blurb").matching(q))
                .fetchHits(per)
                .forEach(s -> hits.add(new SearchHit("show", s.getSlug(), s.getName(),
                    s.getScheduleSlot(), media.url(s.getCoverMediaId()), "/shows/" + s.getSlug())));
        }
        return hits;
    }

    private static boolean matches(String query, String... fields) {
        for (String field : fields) {
            if (field != null && field.toLowerCase(Locale.ROOT).contains(query)) return true;
        }
        return false;
    }
}
