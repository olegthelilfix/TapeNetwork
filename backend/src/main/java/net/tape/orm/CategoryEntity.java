package net.tape.orm;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "category")
@Getter
@Setter
public class CategoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(nullable = false)
    private String name;

    private String blurb;

    @Column(name = "cover_media_id")
    private Long coverMediaId;

    @Column(nullable = false)
    private int sort = 0;

    @Column(nullable = false)
    private boolean published = true;
}
