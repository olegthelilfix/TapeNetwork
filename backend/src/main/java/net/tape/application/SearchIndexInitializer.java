package net.tape.application;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import net.tape.orm.ArticleEntity;
import net.tape.orm.VideoEntity;
import net.tape.orm.EpisodeEntity;
import net.tape.orm.ShowEntity;
import org.hibernate.search.mapper.orm.Search;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * Rebuilds the Lucene index at startup. Flyway seeds bypass Hibernate ORM events, so the
 * seeded rows aren't auto-indexed; a mass-index makes them searchable. Subsequent CMS edits
 * are indexed automatically by Hibernate Search's ORM listeners.
 */
@Component
@ConditionalOnProperty(value = "tape.search.reindex-on-startup", havingValue = "true", matchIfMissing = true)
public class SearchIndexInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(SearchIndexInitializer.class);

    private final EntityManagerFactory emf;

    public SearchIndexInitializer(EntityManagerFactory emf) {
        this.emf = emf;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        EntityManager em = emf.createEntityManager();
        try {
            log.info("Hibernate Search: starting mass indexing…");
            Search.session(em)
                .massIndexer(ShowEntity.class, EpisodeEntity.class, VideoEntity.class, ArticleEntity.class)
                .startAndWait();
            log.info("Hibernate Search: mass indexing complete.");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } catch (Exception e) {
            log.warn("Hibernate Search: mass indexing failed: {}", e.getMessage());
        } finally {
            em.close();
        }
    }
}
