package net.tape.orm;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.FullTextField;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.Indexed;

import java.time.Instant;

@Entity
@Table(name = "show")
@Indexed
@Getter
@Setter
public class ShowEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String slug;

    @FullTextField
    @Column(nullable = false)
    private String name;

    private String tagline;

    @FullTextField
    private String blurb;

    @Column(columnDefinition = "text")
    private String description;

    @Column(name = "schedule_slot")
    private String scheduleSlot;

    @Column(name = "episodes_count", nullable = false)
    private int episodesCount = 0;

    @Column(name = "hours_per_week")
    private String hoursPerWeek;

    @Column(name = "monthly_views")
    private String monthlyViews;

    @Column(name = "cover_media_id")
    private Long coverMediaId;

    @Column(nullable = false)
    private int sort = 0;

    @Column(nullable = false)
    private boolean published = true;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();
}
