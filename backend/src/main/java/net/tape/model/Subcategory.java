package net.tape.model;

import lombok.Getter;
import lombok.Setter;

/** Domain model — framework-free POJO. */
@Getter
@Setter
public class Subcategory {
    private Long id;
    private Long categoryId;
    private String categoryName;
    private String categorySlug;
    private String slug;
    private String name;
    private String blurb;
    private String imageUrl;
    private int sort;
    private int videoCount;
    private java.util.List<Video> videos;
}
