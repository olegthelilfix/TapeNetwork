package net.tape.model;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

/** Domain model — framework-free POJO. */
@Getter
@Setter
public class TickerQuote implements Serializable {
    private Long id;
    private String symbol;
    private String price;
    private String change;
    private String direction;
    private int sort;
}
