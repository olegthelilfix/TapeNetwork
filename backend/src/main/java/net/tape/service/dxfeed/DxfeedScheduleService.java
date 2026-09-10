package net.tape.service.dxfeed;

import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Mock dxFeed Schedule (trading hours) service — ported as-is from
 * {@code web/src/services/server/dxfeedMock/schedule.ts}. Weekdays get PRE_MARKET / REGULAR /
 * AFTER_MARKET sessions; weekends are a single NO_TRADING holiday. Times carry a fixed EST
 * offset — the mock only needs the {@code "YYYY-MM-DD HH:mm:ss+ZZ"} shape the widget parses.
 */
@Service
public class DxfeedScheduleService {

    private static final long MS_PER_DAY = 86_400_000L;
    private static final String SESSION_OFFSET = "-05:00";

    public record ScheduleRequest(List<String> schedules, long start, long stop, String tz) {
    }

    public record Session(String startTime, String endTime, String type) {
    }

    public record Day(String id, String isHoliday, String isShort, List<Session> sessions) {
    }

    public record Schedule(String name, String timeZone, List<Day> days) {
    }

    public record ScheduleWrapper(Schedule schedule) {
    }

    public List<Map<String, ScheduleWrapper>> build(ScheduleRequest request) {
        List<Day> days = buildDays(request.start(), request.stop());

        List<Map<String, ScheduleWrapper>> out = new ArrayList<>();
        for (String scheduleId : request.schedules()) {
            String name = DxfeedInstruments.HEATMAP_TRADING_HOURS_ID.equals(scheduleId)
                ? "US Equity Regular Trading Hours"
                : scheduleId;
            out.add(Map.of(scheduleId, new ScheduleWrapper(new Schedule(name, "America/New_York", days))));
        }
        return out;
    }

    private static List<Day> buildDays(long start, long stop) {
        long firstDay = Math.floorDiv(start, MS_PER_DAY) * MS_PER_DAY;
        long lastDay = Math.floorDiv(stop + MS_PER_DAY - 1, MS_PER_DAY) * MS_PER_DAY; // ceil for positive epoch

        List<Day> days = new ArrayList<>();
        for (long day = firstDay; day <= lastDay; day += MS_PER_DAY) {
            LocalDate date = Instant.ofEpochMilli(day).atZone(ZoneOffset.UTC).toLocalDate();
            String dateId = date.toString(); // ISO yyyy-MM-dd
            DayOfWeek dow = date.getDayOfWeek();
            boolean weekend = dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY;
            days.add(buildDay(dateId, weekend));
        }
        return days;
    }

    private static Day buildDay(String dateId, boolean isWeekend) {
        if (isWeekend) {
            return new Day(dateId, "true", "false", List.of(
                new Session(session(dateId, "00:00:00"), session(dateId, "23:59:59"), "NO_TRADING")));
        }
        return new Day(dateId, "false", "false", List.of(
            new Session(session(dateId, "04:00:00"), session(dateId, "09:30:00"), "PRE_MARKET"),
            new Session(session(dateId, "09:30:00"), session(dateId, "16:00:00"), "REGULAR"),
            new Session(session(dateId, "16:00:00"), session(dateId, "20:00:00"), "AFTER_MARKET")));
    }

    private static String session(String dateId, String time) {
        return dateId + " " + time + SESSION_OFFSET;
    }
}
