package net.tape.service;

import net.tape.model.Article;
import net.tape.orm.ArticleEntity;
import net.tape.orm.ArticleRepository;
import org.springframework.stereotype.Service;

@Service
public class ArticleStore extends CachedContentStore<Article> {

    public ArticleStore(ArticleRepository repo, ArticleMapper mapper) {
        super(new JpaContentStore<ArticleEntity, Article>(
            repo, mapper::toModel, mapper::applyToEntity, ArticleEntity::new, Article.class),
            Article::getId);
    }
}
