package net.tape.service;

public final class Format {
    private Format() {}

    /** Seconds -> "H:MM:SS" or "M:SS". Null-safe. */
    public static String duration(Integer sec) {
        if (sec == null || sec < 0) return null;
        int h = sec / 3600, m = (sec % 3600) / 60, s = sec % 60;
        if (h > 0) return String.format("%d:%02d:%02d", h, m, s);
        return String.format("%d:%02d", m, s);
    }
}
