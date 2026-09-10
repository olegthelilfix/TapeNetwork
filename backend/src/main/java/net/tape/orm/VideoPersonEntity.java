package net.tape.orm;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.Objects;

/** Join row video &lt;-&gt; person carrying a role (host | guest) (#54). */
@Entity
@Table(name = "video_person")
@Getter
@Setter
@IdClass(VideoPersonEntity.Key.class)
public class VideoPersonEntity {

    @Id
    @Column(name = "video_id")
    private Long videoId;

    @Id
    @Column(name = "person_id")
    private Long personId;

    @Id
    @Column(nullable = false)
    private String role = "host";

    @org.hibernate.search.mapper.pojo.mapping.definition.annotation.IndexedEmbedded(includePaths = {"name"})
    @org.hibernate.search.mapper.pojo.mapping.definition.annotation.IndexingDependency(reindexOnUpdate = org.hibernate.search.mapper.pojo.automaticindexing.ReindexOnUpdate.SHALLOW)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "person_id", insertable = false, updatable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private PersonEntity person;

    @Getter
    @Setter
    public static class Key implements Serializable {
        private Long videoId;
        private Long personId;
        private String role;

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof Key key)) return false;
            return Objects.equals(videoId, key.videoId)
                && Objects.equals(personId, key.personId)
                && Objects.equals(role, key.role);
        }

        @Override
        public int hashCode() {
            return Objects.hash(videoId, personId, role);
        }
    }
}
