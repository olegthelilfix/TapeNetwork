package net.tape.api;

import net.tape.service.dxfeed.DxfeedIpfService;
import net.tape.service.dxfeed.DxfeedScannerService;
import net.tape.service.dxfeed.DxfeedScannerService.SnapshotRequest;
import net.tape.service.dxfeed.DxfeedScannerService.SnapshotResponse;
import net.tape.service.dxfeed.DxfeedScheduleService;
import net.tape.service.dxfeed.DxfeedScheduleService.ScheduleRequest;
import net.tape.service.dxfeed.DxfeedScheduleService.ScheduleWrapper;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

/**
 * Mock dxFeed data provider API for the heatmap widget (IPF / Scanner / Schedule), ported from the
 * web BFF ({@code web/src/app/api/dxfeed/**}) into the backend so all data lives server-side.
 *
 * <p>These are <em>integration</em> endpoints — a deliberate exception to the Postgres-backed
 * Entity&harr;Model&harr;DtoV1 pattern (like {@link SearchHit}): no JPA, no Flyway. Paths mirror the
 * widget's provider layout so only the base URL changes when it is repointed here. Under
 * {@code /api/v1/**} they are already {@code permitAll} in {@code SecurityConfig}.
 */
@RestController
@RequestMapping("/api/v1/dxfeed")
public class DxfeedController {

    private final DxfeedIpfService ipfService;
    private final DxfeedScannerService scannerService;
    private final DxfeedScheduleService scheduleService;

    public DxfeedController(DxfeedIpfService ipfService,
                           DxfeedScannerService scannerService,
                           DxfeedScheduleService scheduleService) {
        this.ipfService = ipfService;
        this.scannerService = scannerService;
        this.scheduleService = scheduleService;
    }

    @GetMapping(value = "/ipf", produces = "text/plain;charset=UTF-8")
    public String ipf(@RequestParam(name = "SYMBOL", required = false) String symbol,
                     @RequestParam(name = "text", required = false) String text) {
        List<String> symbols = symbol == null
            ? null
            : Arrays.stream(symbol.split(",")).filter(s -> !s.isEmpty()).toList();
        return ipfService.buildIpfCsv(symbols, text);
    }

    @PostMapping(value = "/scanner/scanner/snapshot",
        consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public SnapshotResponse scannerSnapshot(@RequestBody SnapshotRequest request) {
        return scannerService.buildSnapshot(request);
    }

    @PostMapping(value = "/schedule",
        consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public List<Map<String, ScheduleWrapper>> schedule(@RequestBody ScheduleRequest request) {
        return scheduleService.build(request);
    }
}
