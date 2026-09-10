package net.tape.orm;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.Objects;

/** Join row show &lt;-&gt; person (show hosting expressed as a person link) (#54). */
@Entity
@Table(name = "show_person")
@Getter
@Setter
@IdClass(ShowPersonEntity.Key.class)
public class ShowPersonEntity {

    @Id
    @Column(name = "show_id")
    private Long showId;

    @Id
    @Column(name = "person_id")
    private Long personId;

    @Id
    @Column(nullable = false)
    private String role = "host";

    @Column(nullable = false)
    private int sort = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "person_id", insertable = false, updatable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private PersonEntity person;

    @Getter
    @Setter
    public static class Key implements Serializable {
        private Long showId;
        private Long personId;
        private String role;

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof Key key)) return false;
            return Objects.equals(showId, key.showId)
                && Objects.equals(personId, key.personId)
                && Objects.equals(role, key.role);
        }

        @Override
        public int hashCode() {
            return Objects.hash(showId, personId, role);
        }
    }
}
