package net.tape.orm;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "media_asset")
@Getter
@Setter
public class MediaAssetEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String filename;

    @Column(nullable = false)
    private String url;

    private String mime;

    @Column(nullable = false)
    private String kind = "image"; // image | video

    private Integer width;
    private Integer height;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();
}
