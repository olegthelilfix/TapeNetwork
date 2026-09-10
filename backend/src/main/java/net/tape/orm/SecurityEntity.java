package net.tape.orm;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import org.hibernate.search.mapper.pojo.mapping.definition.annotation.KeywordField;

@Entity
@Table(name = "security")
@Getter
@Setter
public class SecurityEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @KeywordField
    @Column(nullable = false, unique = true)
    private String symbol;

    @org.hibernate.search.mapper.pojo.mapping.definition.annotation.FullTextField
    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private int sort = 0;
}
