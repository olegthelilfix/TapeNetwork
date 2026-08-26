package net.tape.orm;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "ticker_quote")
@Getter
@Setter
public class TickerQuoteEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String symbol;

    @Column(nullable = false)
    private String price;

    @Column(nullable = false)
    private String change;

    @Column(nullable = false)
    private String direction = "up"; // up | down

    @Column(nullable = false)
    private int sort = 0;
}
