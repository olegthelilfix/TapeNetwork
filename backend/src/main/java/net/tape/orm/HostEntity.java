package net.tape.orm;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "host")
@Getter
@Setter
public class HostEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Read-only association for traversal; writable via scalar showId (used by the CMS).
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "show_id", insertable = false, updatable = false)
    @JsonIgnore
    private ShowEntity show;

    @Column(name = "show_id", nullable = false)
    private Long showId;

    private String initials;

    @Column(nullable = false)
    private String name;

    private String role;

    @Column(nullable = false)
    private int sort = 0;
}
