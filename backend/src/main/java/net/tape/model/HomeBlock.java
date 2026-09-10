package net.tape.model;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

/** Domain model — framework-free POJO. */
@Getter
@Setter
public class HomeBlock implements Serializable {
    private Long id;
    private String type;
    private String refType;
    private Long refId;
    private String label;
    private int sort;
}
