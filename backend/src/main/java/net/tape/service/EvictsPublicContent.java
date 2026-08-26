package net.tape.service;

import org.springframework.cache.annotation.CacheEvict;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Composed annotation: clears every public read-through cache.
 *
 * <p>Placed on admin write endpoints so any create/update/delete drops stale public
 * entries immediately. Coarse by design — admin writes are rare, public reads are hot,
 * and category listings depend on video state, so a global evict keeps everything consistent.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@CacheEvict(cacheNames = {
    PublicCaches.SHOWS, PublicCaches.SHOW_DETAIL,
    PublicCaches.CATEGORIES, PublicCaches.CATEGORY_DETAIL, PublicCaches.SUBCATEGORY_DETAIL,
    PublicCaches.SCHEDULE, PublicCaches.TICKER
}, allEntries = true)
public @interface EvictsPublicContent {
}
