package net.tape.model;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

/** Domain model — framework-free POJO. */
@Getter
@Setter
public class Category implements Serializable {
    private Long id;
    private String slug;
    private String name;
    private String blurb;
    private Long coverMediaId;
    private String imageUrl;
    private int sort;
    private boolean published;
    private int subcategoryCount;
    private int videoCount;
    private java.util.List<String> subNames;
    private java.util.List<Subcategory> subcategories;
}
