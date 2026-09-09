package net.tape.model;

import lombok.Getter;
import lombok.Setter;

/** Domain model — framework-free POJO. */
@Getter
@Setter
public class Person {
    private Long id;
    private String slug;
    private String name;
    private String initials;
    private String bio;
    private Long avatarMediaId;
    private String imageUrl;
    private int sort;
}
