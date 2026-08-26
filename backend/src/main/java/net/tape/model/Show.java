package net.tape.model;

import lombok.Getter;
import lombok.Setter;
import java.time.Instant;

/** Domain model — framework-free POJO. */
@Getter
@Setter
public class Show {
    private Long id;
    private String slug;
    private String name;
    private String tagline;
    private String blurb;
    private String description;
    private String scheduleSlot;
    private int episodesCount;
    private String hoursPerWeek;
    private String monthlyViews;
    private Long coverMediaId;
    private String imageUrl;
    private int sort;
    private boolean published;
    private Instant createdAt;
    private Instant updatedAt;
    private java.util.List<Host> hosts;
    private java.util.List<Episode> episodes;
}
