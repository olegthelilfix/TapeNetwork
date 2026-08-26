package net.tape.service;

import net.tape.model.Article;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CachedContentStoreTest {

    @Mock ContentStore<Article> database;

    @Test
    void preloadsAndWritesThroughMutations() {
        Article original = article(7L, "old");
        Article updated = article(7L, "new");
        when(database.findAll()).thenReturn(List.of(original));
        when(database.update(7L, original)).thenReturn(updated);
        when(database.delete(7L)).thenReturn(updated);

        CachedContentStore<Article> cache = new CachedContentStore<>(database, Article::getId);
        cache.preload();
        assertEquals("old", cache.findById(7L).orElseThrow().getTitle());

        cache.update(7L, original);
        assertEquals("new", cache.findById(7L).orElseThrow().getTitle());

        cache.delete(7L);
        assertTrue(cache.findById(7L).isEmpty());
        verify(database).update(7L, original);
        verify(database).delete(7L);
    }

    private static Article article(Long id, String title) {
        Article article = new Article();
        article.setId(id);
        article.setTitle(title);
        return article;
    }
}
