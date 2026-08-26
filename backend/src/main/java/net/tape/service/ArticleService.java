package net.tape.service;

import net.tape.model.Article;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Service
@Transactional(readOnly = true)
public class ArticleService {

    private final ArticleStore articles;

    public ArticleService(ArticleStore articles) {
        this.articles = articles;
    }

    public Page<Article> list(String categorySlug, int page, int size) {
        int pageNumber = Math.max(0, page);
        int pageSize = Math.clamp(size, 1, 50);
        List<Article> filtered = articles.findAll().stream()
            .filter(Article::isPublished)
            .filter(a -> categorySlug == null || categorySlug.isBlank()
                || Objects.equals(categorySlug, a.getCategorySlug()))
            .toList();
        int from = Math.min(pageNumber * pageSize, filtered.size());
        int to = Math.min(from + pageSize, filtered.size());
        return new PageImpl<>(filtered.subList(from, to), PageRequest.of(pageNumber, pageSize), filtered.size());
    }

    public Article bySlug(String slug) {
        return articles.findAll().stream()
            .filter(a -> Objects.equals(slug, a.getSlug()))
            .findFirst()
            .orElseThrow(() -> new NotFoundException("article", slug));
    }

    public List<Article> latest() {
        return articles.findAll().stream()
            .filter(Article::isPublished)
            .sorted(Comparator.comparing(Article::getPublishedAt,
                Comparator.nullsLast(Comparator.reverseOrder())))
            .limit(4)
            .toList();
    }
}
