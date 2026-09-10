package net.tape.model;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

/** A person as they appear on a video, carrying the role for that appearance. */
@Getter
@Setter
public class VideoPerson implements Serializable {
    private String slug;
    private String name;
    private String initials;
    private String role;
}
