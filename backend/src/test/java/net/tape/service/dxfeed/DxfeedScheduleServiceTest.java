package net.tape.service.dxfeed;

import net.tape.service.dxfeed.DxfeedScheduleService.Day;
import net.tape.service.dxfeed.DxfeedScheduleService.ScheduleRequest;
import net.tape.service.dxfeed.DxfeedScheduleService.ScheduleWrapper;
import net.tape.service.dxfeed.DxfeedScheduleService.Session;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

/** Ported from {@code web/src/services/server/dxfeedMock/schedule.test.ts}. */
class DxfeedScheduleServiceTest {

    private static final String ID = DxfeedInstruments.HEATMAP_TRADING_HOURS_ID;

    private final DxfeedScheduleService service = new DxfeedScheduleService();

    // 2026-09-07 is a Monday, 2026-09-13 is a Sunday.
    private static final long START = LocalDate.of(2026, 9, 7).atStartOfDay(ZoneOffset.UTC).toInstant().toEpochMilli();
    private static final long STOP = LocalDate.of(2026, 9, 13).atStartOfDay(ZoneOffset.UTC).toInstant().toEpochMilli();

    private List<Day> days() {
        List<Map<String, ScheduleWrapper>> result = service.build(new ScheduleRequest(List.of(ID), START, STOP, null));
        return result.getFirst().get(ID).schedule().days();
    }

    private static Day dayById(List<Day> days, String id) {
        return days.stream().filter(day -> day.id().equals(id)).findFirst().orElse(null);
    }

    @Test
    void returnsOneEntryPerRequestedScheduleId() {
        List<Map<String, ScheduleWrapper>> result =
            service.build(new ScheduleRequest(List.of(ID), START, STOP, null));

        assertEquals(1, result.size());
        assertNotNull(result.getFirst().get(ID));
    }

    @Test
    void marksWeekendsAsHolidaysWithSingleNoTradingSession() {
        Day sunday = dayById(days(), "2026-09-13");

        assertNotNull(sunday);
        assertEquals("true", sunday.isHoliday());
        assertEquals(1, sunday.sessions().size());
        assertEquals("NO_TRADING", sunday.sessions().getFirst().type());
    }

    @Test
    void givesWeekdaysPreRegularAndAfterMarketSessions() {
        Day monday = dayById(days(), "2026-09-07");

        assertNotNull(monday);
        assertEquals("false", monday.isHoliday());
        assertEquals(List.of("PRE_MARKET", "REGULAR", "AFTER_MARKET"),
            monday.sessions().stream().map(Session::type).toList());
        assertEquals("2026-09-07 09:30:00-05:00", monday.sessions().get(1).startTime());
    }
}
