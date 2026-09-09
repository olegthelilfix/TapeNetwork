package net.tape.model;

import lombok.Getter;
import lombok.Setter;

/** Domain model — framework-free POJO. */
@Getter
@Setter
public class Security {
    private Long id;
    private String symbol;
    private String name;
    private int sort;
}
