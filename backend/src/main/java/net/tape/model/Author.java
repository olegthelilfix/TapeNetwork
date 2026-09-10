package net.tape.model;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

/** Domain model — framework-free POJO. */
@Getter
@Setter
public class Author implements Serializable {
    private Long id;
    private String name;
    private String bio;
    private Long avatarMediaId;
    private String imageUrl;
}
