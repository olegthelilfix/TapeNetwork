package net.tape.model;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.time.Instant;

/** Domain model — framework-free POJO. */
@Getter
@Setter
public class MediaAsset implements Serializable {
    private Long id;
    private String filename;
    private String url;
    private String mime;
    private String kind;
    private Integer width;
    private Integer height;
    private Instant createdAt;
}
