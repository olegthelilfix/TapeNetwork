package net.tape.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** Unit test for the derived views display formatter (#53). */
class FormatViewsTest {

    @Test
    void formatsSmallCountsVerbatim() {
        assertEquals("0", Format.views(0));
        assertEquals("1", Format.views(1));
        assertEquals("999", Format.views(999));
    }

    @Test
    void formatsThousandsWithOneDecimalUnderTenK() {
        assertEquals("1K", Format.views(1000));
        assertEquals("1.2K", Format.views(1200));
        assertEquals("9.9K", Format.views(9900));
    }

    @Test
    void formatsTensOfThousandsAsWholeK() {
        assertEquals("12K", Format.views(12_300));
        assertEquals("999K", Format.views(999_000));
    }

    @Test
    void formatsMillions() {
        assertEquals("1M", Format.views(1_000_000));
        assertEquals("3.4M", Format.views(3_400_000));
    }

    @Test
    void clampsNegativeToZero() {
        assertEquals("0", Format.views(-5));
    }
}
