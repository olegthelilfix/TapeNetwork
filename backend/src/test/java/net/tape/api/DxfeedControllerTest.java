package net.tape.api;

import net.tape.application.JwtAuthFilter;
import net.tape.application.JwtService;
import net.tape.application.SecurityConfig;
import net.tape.service.dxfeed.DxfeedIpfService;
import net.tape.service.dxfeed.DxfeedScannerService;
import net.tape.service.dxfeed.DxfeedScheduleService;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.equalTo;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Web-layer wiring test for {@link DxfeedController}. The (dependency-free) mock services are
 * imported so real IPF/Scanner/Schedule output flows through the controller. Real
 * {@link SecurityConfig}/{@link JwtAuthFilter}/{@link JwtService} are imported so the
 * {@code /api/v1/**}.permitAll() rule governs these anonymous requests (see SearchControllerTest).
 */
@WebMvcTest(DxfeedController.class)
@Import({SecurityConfig.class, JwtAuthFilter.class, JwtService.class,
    DxfeedIpfService.class, DxfeedScannerService.class, DxfeedScheduleService.class})
class DxfeedControllerTest {

    @Autowired MockMvc mvc;

    @Test
    void ipfReturnsTextCsvForRequestedSymbol() throws Exception {
        mvc.perform(get("/api/v1/dxfeed/ipf").param("SYMBOL", "AAPL"))
            .andExpect(status().isOk())
            .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_PLAIN))
            .andExpect(content().string(containsString("#STOCK::=TYPE,SYMBOL,DESCRIPTION,TRADING_HOURS,COUNTRY,CURRENCY")))
            .andExpect(content().string(containsString("STOCK,AAPL,Apple Inc.,US_EQUITY_REGULAR,US,USD")))
            .andExpect(content().string(containsString("##COMPLETE")));
    }

    @Test
    void scannerSnapshotResolvesRequestedDatapoints() throws Exception {
        String body = """
            {
              "instrumentCategory": "UNDERLYING",
              "datapoints": [{"name": "symbol"}, {"name": "cap", "expr": "fundamental.marketCap"}],
              "filters": [{"datapoint": 0, "alternatives": [{"predicate": "anyOf", "args": ["AAPL"]}]}]
            }
            """;

        mvc.perform(post("/api/v1/dxfeed/scanner/scanner/snapshot")
                .contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.outputNames").value(org.hamcrest.Matchers.contains("symbol", "fundamental.marketCap")))
            .andExpect(jsonPath("$.entries[0].symbol").value("AAPL"))
            .andExpect(jsonPath("$.entries[0].outputs[0]").value("AAPL"))
            .andExpect(jsonPath("$.entries[0].outputs[1]").value(equalTo(3_400_000_000_000L)));
    }

    @Test
    void scheduleReturnsPerIdTradingHours() throws Exception {
        String body = """
            {"schedules": ["US_EQUITY_REGULAR"], "start": 1788480000000, "stop": 1789084800000}
            """;

        mvc.perform(post("/api/v1/dxfeed/schedule")
                .contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0]['US_EQUITY_REGULAR'].schedule.timeZone").value("America/New_York"))
            .andExpect(jsonPath("$[0]['US_EQUITY_REGULAR'].schedule.name").value("US Equity Regular Trading Hours"));
    }
}
