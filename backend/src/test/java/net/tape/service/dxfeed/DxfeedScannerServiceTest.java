package net.tape.service.dxfeed;

import net.tape.service.dxfeed.DxfeedScannerService.Datapoint;
import net.tape.service.dxfeed.DxfeedScannerService.Filter;
import net.tape.service.dxfeed.DxfeedScannerService.FilterAlternative;
import net.tape.service.dxfeed.DxfeedScannerService.Options;
import net.tape.service.dxfeed.DxfeedScannerService.SnapshotRequest;
import net.tape.service.dxfeed.DxfeedScannerService.SnapshotResponse;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** Ported from {@code web/src/services/server/dxfeedMock/scanner.test.ts}. */
class DxfeedScannerServiceTest {

    private final DxfeedScannerService service = new DxfeedScannerService();

    private static Filter anyOf(int datapoint, Object... args) {
        return new Filter(datapoint, null, List.of(new FilterAlternative("anyOf", List.of(args), null)));
    }

    @Test
    void returnsOutputNamesInRequestedDatapointOrder() {
        SnapshotRequest request = new SnapshotRequest(
            "UNDERLYING",
            List.of(new Datapoint("symbol", null), new Datapoint("fundamental.marketCap", null)),
            null, null);

        SnapshotResponse result = service.buildSnapshot(request);

        assertEquals(List.of("symbol", "fundamental.marketCap"), result.outputNames());
    }

    @Test
    void resolvesKnownFundamentalAndClassificationExpressions() {
        SnapshotRequest request = new SnapshotRequest(
            "UNDERLYING",
            List.of(
                new Datapoint("symbol", null),
                new Datapoint("industry", "fundamental.morningstarIndustryCode"),
                new Datapoint("cap", "fundamental.marketCap")),
            List.of(anyOf(0, "AAPL")),
            null);

        SnapshotResponse result = service.buildSnapshot(request);

        assertEquals(1, result.entries().size());
        assertEquals("AAPL", result.entries().getFirst().symbol());
        assertEquals(List.of("AAPL", "31120030", 3_400_000_000_000L), result.entries().getFirst().outputs());
    }

    @Test
    void resolvesCandleChangeExpressionToNumberNearSeedValue() {
        SnapshotRequest request = new SnapshotRequest(
            "UNDERLYING",
            List.of(
                new Datapoint("symbol", null),
                new Datapoint("change", "changeFromCloseRatio(candlePeriod=\"1d\",session=\"all\")*100")),
            List.of(anyOf(0, "MSFT")),
            null);

        Object change = service.buildSnapshot(request).entries().getFirst().outputs().get(1);

        assertInstanceOf(Number.class, change);
        double value = ((Number) change).doubleValue();
        assertTrue(value > 0.5 - 0.31, "expected > 0.19 but was " + value);
        assertTrue(value < 0.5 + 0.31, "expected < 0.81 but was " + value);
    }

    @Test
    void returnsNullForUnrecognizedExpression() {
        SnapshotRequest request = new SnapshotRequest(
            "UNDERLYING",
            List.of(new Datapoint("symbol", null), new Datapoint("unknown", "fundamental.doesNotExist")),
            List.of(anyOf(0, "AAPL")),
            null);

        assertNull(service.buildSnapshot(request).entries().getFirst().outputs().get(1));
    }

    @Test
    void capsResultsToSnapshotSize() {
        SnapshotRequest request = new SnapshotRequest(
            "UNDERLYING",
            List.of(new Datapoint("symbol", null)),
            null,
            new Options(3));

        assertEquals(3, service.buildSnapshot(request).entries().size());
    }
}
