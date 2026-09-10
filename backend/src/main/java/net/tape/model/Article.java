package net.tape.model;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

import java.time.Instant;
import java.util.List;

/**
 * Domain model for an article — framework-free POJO. The admin (private) API returns this
 * directly; the public API maps it to a versioned DTO. Populated from ArticleEntity by the
 * MapStruct mapper, which also resolves category/author names and the media URL.
 */
@Getter
@Setter
public class Article implements Serializable {
    private Long id;
    private String slug;
    private Long categoryId;
    private String categoryName;
    private String categorySlug;
    private Long authorId;
    private String authorName;
    private String title;
    private String dek;
    private List<String> body;
    private Integer readMinutes;
    private Long heroMediaId;
    private String imageUrl;
    private Instant publishedAt;
    private boolean published;
    private boolean featured;
    private Instant createdAt;
    private Instant updatedAt;
}
