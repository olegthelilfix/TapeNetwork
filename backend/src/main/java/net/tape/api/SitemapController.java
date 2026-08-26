package net.tape.api;

import net.tape.model.Article;
import net.tape.model.Video;
import net.tape.orm.CategoryRepository;
import net.tape.orm.EpisodeRepository;
import net.tape.orm.ShowRepository;
import net.tape.orm.SubcategoryRepository;
import net.tape.service.ArticleStore;
import net.tape.service.VideoStore;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/** Flat list of public URLs + lastmod; the Next.js app renders sitemap.xml from it. */
@RestController
@RequestMapping("/api/v1/sitemap-data")
public class SitemapController {

    public record SitemapEntry(String loc, String lastmod) {}

    private static final DateTimeFormatter DAY = DateTimeFormatter.ofPattern("yyyy-MM-dd").withZone(ZoneOffset.UTC);

    private final ShowRepository shows;
    private final EpisodeRepository episodes;
    private final CategoryRepository categories;
    private final SubcategoryRepository subcategories;
    private final VideoStore videos;
    private final ArticleStore articles;

    public SitemapController(ShowRepository shows, EpisodeRepository episodes, CategoryRepository categories,
                            SubcategoryRepository subcategories, VideoStore videos, ArticleStore articles) {
        this.shows = shows;
        this.episodes = episodes;
        this.categories = categories;
        this.subcategories = subcategories;
        this.videos = videos;
        this.articles = articles;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<SitemapEntry> entries() {
        List<SitemapEntry> out = new ArrayList<>();
        out.add(new SitemapEntry("/", null));
        out.add(new SitemapEntry("/shows", null));
        out.add(new SitemapEntry("/on-demand", null));
        out.add(new SitemapEntry("/articles", null));

        shows.findByPublishedTrueOrderBySortAsc()
            .forEach(s -> out.add(new SitemapEntry("/shows/" + s.getSlug(), day(s.getUpdatedAt()))));
        episodes.findAll().stream().filter(net.tape.orm.EpisodeEntity::isPublished)
            .forEach(e -> out.add(new SitemapEntry("/watch/" + e.getSlug(), day(e.getUpdatedAt()))));
        categories.findByPublishedTrueOrderBySortAsc()
            .forEach(c -> out.add(new SitemapEntry("/on-demand/" + c.getSlug(), null)));
        subcategories.findAll()
            .forEach(s -> out.add(new SitemapEntry(
                "/on-demand/" + s.getCategory().getSlug() + "/" + s.getSlug(), null)));
        videos.findAll().stream().filter(Video::isPublished)
            .forEach(v -> out.add(new SitemapEntry("/watch/" + v.getSlug(), day(v.getUpdatedAt()))));
        articles.findAll().stream().filter(Article::isPublished)
            .forEach(a -> out.add(new SitemapEntry("/articles/" + a.getSlug(), day(a.getUpdatedAt()))));
        return out;
    }

    private static String day(Instant i) {
        return i == null ? null : DAY.format(i);
    }
}
