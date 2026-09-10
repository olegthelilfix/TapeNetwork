package net.tape.model;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.time.Instant;

/** Domain model — framework-free POJO. */
@Getter
@Setter
public class AdminUser implements Serializable {
    private Long id;
    private String email;
    private String role;
    private boolean active;
    private Instant createdAt;
}
