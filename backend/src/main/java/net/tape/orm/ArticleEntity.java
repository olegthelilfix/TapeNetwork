package net.tape.orm;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.FullTextField;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.Indexed;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "article")
@Indexed
@Getter
@Setter
public class ArticleEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String slug;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", insertable = false, updatable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private CategoryEntity category;

    @Column(name = "category_id")
    private Long categoryId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", insertable = false, updatable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private AuthorEntity author;

    @Column(name = "author_id")
    private Long authorId;

    // Canonical person authorship (#56); author_id retained for backward compatibility.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "person_id", insertable = false, updatable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private PersonEntity person;

    @Column(name = "person_id")
    private Long personId;

    @FullTextField
    @Column(nullable = false)
    private String title;

    @FullTextField
    @Column(columnDefinition = "text")
    private String dek;

    /** Array of paragraph strings, stored as jsonb. */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "jsonb")
    private List<String> body = new ArrayList<>();

    @Column(name = "read_minutes")
    private Integer readMinutes;

    @Column(name = "hero_media_id")
    private Long heroMediaId;

    @Column(name = "published_at")
    private Instant publishedAt;

    @Column(nullable = false)
    private boolean published = false;

    @Column(nullable = false)
    private boolean featured = false;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();
}
