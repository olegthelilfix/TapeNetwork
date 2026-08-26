package net.tape.orm;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "home_block")
@Getter
@Setter
public class HomeBlockEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String type; // featured | most_watched | up_next

    @Column(name = "ref_type")
    private String refType; // episode | video | article

    @Column(name = "ref_id")
    private Long refId;

    private String label;

    @Column(nullable = false)
    private int sort = 0;
}
