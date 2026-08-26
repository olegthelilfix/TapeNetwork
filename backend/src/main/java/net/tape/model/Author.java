package net.tape.model;

import lombok.Getter;
import lombok.Setter;

/** Domain model — framework-free POJO. */
@Getter
@Setter
public class Author {
    private Long id;
    private String name;
    private String bio;
    private Long avatarMediaId;
    private String imageUrl;
}
