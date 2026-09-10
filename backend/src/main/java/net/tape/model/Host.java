package net.tape.model;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

/** Domain model — framework-free POJO. */
@Getter
@Setter
public class Host implements Serializable {
    private Long id;
    private Long showId;
    private String initials;
    private String name;
    private String role;
    private int sort;
}
