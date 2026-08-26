package net.tape.model;

import lombok.Getter;
import lombok.Setter;

/** Domain model — framework-free POJO. */
@Getter
@Setter
public class HomeBlock {
    private Long id;
    private String type;
    private String refType;
    private Long refId;
    private String label;
    private int sort;
}
