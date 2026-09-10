package net.tape.service.dxfeed;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** Ported from {@code web/src/services/server/dxfeedMock/ipf.test.ts}. */
class DxfeedIpfServiceTest {

    private final DxfeedIpfService service = new DxfeedIpfService();

    private static List<String> stockRows(String csv) {
        return csv.lines().filter(line -> line.startsWith("STOCK,")).toList();
    }

    @Test
    void declaresStockColumnsHeaderMatchingRowShape() {
        String csv = service.buildIpfCsv(List.of("AAPL"), null);
        String header = csv.lines().findFirst().orElseThrow();

        assertEquals("#STOCK::=TYPE,SYMBOL,DESCRIPTION,TRADING_HOURS,COUNTRY,CURRENCY", header);
    }

    @Test
    void filtersToRequestedSymbolList() {
        String csv = service.buildIpfCsv(List.of("AAPL", "MSFT"), null);
        List<String> rows = stockRows(csv);

        assertEquals(2, rows.size());
        assertTrue(rows.get(0).contains("AAPL"));
        assertTrue(rows.get(1).contains("MSFT"));
    }

    @Test
    void returnsEveryInstrumentWhenNoSymbolsOrText() {
        List<String> rows = stockRows(service.buildIpfCsv(null, null));

        assertTrue(rows.size() > 40);
    }

    @Test
    void matchesBySymbolOrDescriptionSubstringInTextMode() {
        List<String> rows = stockRows(service.buildIpfCsv(null, "apple"));

        assertEquals(1, rows.size());
        assertTrue(rows.getFirst().contains("AAPL"));
    }

    @Test
    void endsWithCompleteFooter() {
        String csv = service.buildIpfCsv(List.of("AAPL"), null);
        List<String> lines = csv.lines().toList();

        assertEquals("##COMPLETE", lines.getLast());
    }
}
