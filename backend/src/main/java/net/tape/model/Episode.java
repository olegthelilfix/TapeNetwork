package net.tape.model;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.time.Instant;

/** Domain model — framework-free POJO. */
@Getter
@Setter
public class Episode implements Serializable {
    private Long id;
    private Long showId;
    private String showName;
    private String showSlug;
    private String slug;
    private String epNo;
    private String title;
    private String description;
    private Instant publishedAt;
    private Integer durationSec;
    private String views;
    private String videoUrl;
    private Long thumbMediaId;
    private String imageUrl;
    private boolean live;
    private String[] tags;
    private boolean published;
    private Instant createdAt;
    private Instant updatedAt;
}
