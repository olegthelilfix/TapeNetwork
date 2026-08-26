package net.tape.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class FormatTest {

    @Test
    void formatsMinutesAndSeconds() {
        assertEquals("48:12", Format.duration(2892));
        assertEquals("0:05", Format.duration(5));
        assertEquals("27:38", Format.duration(1658));
    }

    @Test
    void formatsHours() {
        assertEquals("1:04:22", Format.duration(3862));
    }

    @Test
    void nullSafe() {
        assertNull(Format.duration(null));
        assertNull(Format.duration(-1));
    }
}
