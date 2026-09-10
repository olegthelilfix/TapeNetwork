package net.tape.model;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.time.Instant;

/** Domain model — framework-free POJO. */
@Getter
@Setter
public class Video implements Serializable {
    private Long id;
    private Long subcategoryId;
    private Long showId;
    private String showName;
    private String showSlug;
    private String categoryName;
    private String slug;
    private String title;
    private String description;
    private Instant publishedAt;
    private Integer durationSec;
    private String views;
    private long viewCount;
    private String videoUrl;
    private Long thumbMediaId;
    private String imageUrl;
    private String[] tags;
    private java.util.List<Security> securities = new java.util.ArrayList<>();
    private java.util.List<VideoPerson> people = new java.util.ArrayList<>();
    private boolean published;
    private Instant createdAt;
    private Instant updatedAt;
}
