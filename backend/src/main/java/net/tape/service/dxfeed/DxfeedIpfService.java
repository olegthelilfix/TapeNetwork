package net.tape.service.dxfeed;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

import net.tape.service.dxfeed.DxfeedInstruments.InstrumentSeed;

/**
 * Mock dxFeed IPF (Instrument Profile) service — ported as-is from
 * {@code web/src/services/server/dxfeedMock/ipf.ts}. Mirrors dxFeed's classic IPF text format:
 * a {@code #TYPE::=col,col,...} header per instrument type, then CSV rows whose first field is
 * that TYPE, ending with {@code ##COMPLETE}.
 */
@Service
public class DxfeedIpfService {

    private static final List<String> IPF_COLUMNS =
        List.of("TYPE", "SYMBOL", "DESCRIPTION", "TRADING_HOURS", "COUNTRY", "CURRENCY");

    private static final int TEXT_SEARCH_LIMIT = 20;

    /**
     * @param symbols exact-symbol filter (null/empty = no symbol filter)
     * @param text    substring search over symbol/description (used only when symbols is empty)
     */
    public String buildIpfCsv(List<String> symbols, String text) {
        Set<String> symbolSet = symbols != null && !symbols.isEmpty() ? Set.copyOf(symbols) : null;
        String textQuery = text != null ? text.trim().toLowerCase(Locale.ROOT) : null;

        List<InstrumentSeed> rows;
        if (symbolSet != null) {
            rows = DxfeedInstruments.MOCK_INSTRUMENTS.stream()
                .filter(instrument -> symbolSet.contains(instrument.symbol()))
                .toList();
        } else if (textQuery != null && !textQuery.isEmpty()) {
            rows = DxfeedInstruments.MOCK_INSTRUMENTS.stream()
                .filter(instrument ->
                    instrument.symbol().toLowerCase(Locale.ROOT).contains(textQuery)
                        || instrument.description().toLowerCase(Locale.ROOT).contains(textQuery))
                .limit(TEXT_SEARCH_LIMIT)
                .toList();
        } else {
            rows = DxfeedInstruments.MOCK_INSTRUMENTS;
        }

        String header = "#STOCK::=" + String.join(",", IPF_COLUMNS);
        String body = rows.stream()
            .map(instrument -> String.join(",",
                "STOCK",
                instrument.symbol(),
                instrument.description(),
                DxfeedInstruments.HEATMAP_TRADING_HOURS_ID,
                "US",
                "USD"))
            .collect(Collectors.joining("\n"));

        StringBuilder out = new StringBuilder(header);
        if (!body.isEmpty()) {
            out.append('\n').append(body);
        }
        out.append('\n').append("##COMPLETE");
        return out.toString();
    }
}
