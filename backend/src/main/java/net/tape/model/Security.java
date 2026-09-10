package net.tape.model;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

/** Domain model — framework-free POJO. */
@Getter
@Setter
public class Security implements Serializable {
    private Long id;
    private String symbol;
    private String name;
    private int sort;
}
