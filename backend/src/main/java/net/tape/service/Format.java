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

    /** View count -> compact display, e.g. 950 -> "950", 12_300 -> "12K", 3_400_000 -> "3.4M". */
    public static String views(long count) {
        if (count < 1000) return Long.toString(Math.max(0, count));
        if (count < 1_000_000) {
            double k = count / 1000.0;
            return (count < 10_000 ? trim1(k) : Long.toString(Math.round(k))) + "K";
        }
        double mm = count / 1_000_000.0;
        return trim1(mm) + "M";
    }

    private static String trim1(double v) {
        String s = String.format(java.util.Locale.ROOT, "%.1f", v);
        return s.endsWith(".0") ? s.substring(0, s.length() - 2) : s;
    }
}
