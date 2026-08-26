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
@Table(name = "episode")
@Indexed
@Getter
@Setter
public class EpisodeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "show_id", insertable = false, updatable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private ShowEntity show;

    @Column(name = "show_id", nullable = false)
    private Long showId;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(name = "ep_no")
    private String epNo;

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

    @Column(name = "is_live", nullable = false)
    private boolean live = false;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(columnDefinition = "text[]")
    private String[] tags = new String[0];

    @Column(nullable = false)
    private boolean published = true;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();
}
