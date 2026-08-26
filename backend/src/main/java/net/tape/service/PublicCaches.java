package net.tape.service;

/** Cache names for public read-through endpoints, shared by @Cacheable, eviction, and the cache manager. */
public final class PublicCaches {
    private PublicCaches() {}

    public static final String SHOWS = "shows";
    public static final String SHOW_DETAIL = "showDetail";
    public static final String CATEGORIES = "categories";
    public static final String CATEGORY_DETAIL = "categoryDetail";
    public static final String SUBCATEGORY_DETAIL = "subcategoryDetail";
    public static final String SCHEDULE = "schedule";
    public static final String TICKER = "ticker";

    /** Every public cache — used to pre-register caches and to evict them all on any write. */
    public static final String[] NAMES = {
        SHOWS, SHOW_DETAIL, CATEGORIES, CATEGORY_DETAIL, SUBCATEGORY_DETAIL, SCHEDULE, TICKER
    };
}
