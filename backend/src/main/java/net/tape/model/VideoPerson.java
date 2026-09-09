package net.tape.model;

import lombok.Getter;
import lombok.Setter;

/** A person as they appear on a video, carrying the role for that appearance. */
@Getter
@Setter
public class VideoPerson {
    private String slug;
    private String name;
    private String initials;
    private String role;
}
