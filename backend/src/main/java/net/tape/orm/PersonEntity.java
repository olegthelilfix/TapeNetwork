package net.tape.orm;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "person")
@Getter
@Setter
public class PersonEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String slug;

    @org.hibernate.search.mapper.pojo.mapping.definition.annotation.FullTextField
    @Column(nullable = false)
    private String name;

    private String initials;

    @Column(columnDefinition = "text")
    private String bio;

    @Column(name = "avatar_media_id")
    private Long avatarMediaId;

    @Column(nullable = false)
    private int sort = 0;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();
}
