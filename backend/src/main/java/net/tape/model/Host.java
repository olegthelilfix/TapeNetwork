package net.tape.model;

import lombok.Getter;
import lombok.Setter;

/** Domain model — framework-free POJO. */
@Getter
@Setter
public class Host {
    private Long id;
    private Long showId;
    private String initials;
    private String name;
    private String role;
    private int sort;
}
