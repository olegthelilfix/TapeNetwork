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
@Table(name = "video")
@Indexed
@Getter
@Setter
public class VideoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subcategory_id", insertable = false, updatable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private SubcategoryEntity subcategory;

    @Column(name = "subcategory_id", nullable = false)
    private Long subcategoryId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "show_id", insertable = false, updatable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private ShowEntity show;

    @Column(name = "show_id")
    private Long showId;

    @Column(nullable = false, unique = true)
    private String slug;

    @FullTextField
    @Column(nullable = false)
    private String title;

    @FullTextField
    @Column(columnDefinition = "text")
    private String description;

    @Column(name = "published_at")
    private Instant publishedAt;

    @Column(name = "duration_sec")
    private Integer durationSec;

    private String views;

    @Column(name = "video_url")
    private String videoUrl;

    @Column(name = "thumb_media_id")
    private Long thumbMediaId;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(columnDefinition = "text[]")
    private String[] tags = new String[0];

    // Read-only associations for search indexing of attached securities/people (#54).
    // Writes go through the dedicated join repositories, not these collections.
    @org.hibernate.search.mapper.pojo.mapping.definition.annotation.IndexedEmbedded(includePaths = {"security.symbol", "security.name"})
    @OneToMany(fetch = FetchType.LAZY)
    @JoinColumn(name = "video_id", insertable = false, updatable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<VideoSecurityEntity> securityLinks = new ArrayList<>();

    @org.hibernate.search.mapper.pojo.mapping.definition.annotation.IndexedEmbedded(includePaths = {"person.name"})
    @OneToMany(fetch = FetchType.LAZY)
    @JoinColumn(name = "video_id", insertable = false, updatable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<VideoPersonEntity> personLinks = new ArrayList<>();

    @Column(nullable = false)
    private boolean published = true;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();
}
