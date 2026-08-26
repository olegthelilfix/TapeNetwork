package net.tape.application;

import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class JwtServiceTest {

    private final JwtService jwt = new JwtService("dev-secret-change-me-please-32bytes-min", 60);

    @Test
    void issuesAndParsesRoundTrip() {
        String token = jwt.issue("admin@tape.local", "ADMIN");
        Claims claims = jwt.parse(token);
        assertEquals("admin@tape.local", claims.getSubject());
        assertEquals("ADMIN", claims.get("role"));
    }

    @Test
    void rejectsGarbage() {
        assertNull(jwt.parse("not-a-token"));
    }

    @Test
    void rejectsTokenSignedWithAnotherSecret() {
        JwtService other = new JwtService("another-secret-that-is-long-enough-32b!", 60);
        String token = other.issue("x@y.com", "EDITOR");
        assertNull(jwt.parse(token));
    }
}
