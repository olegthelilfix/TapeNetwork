package net.tape.api;

/** A single unified search result. {@code url} is the site-relative path for the client. */
public record SearchHit(
    String type,      // show | episode | video | article
    String slug,
    String title,
    String subtitle,
    String imageUrl,
    String url) {}
