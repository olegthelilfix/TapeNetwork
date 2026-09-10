package net.tape.api;

import net.tape.api.support.JwtTestSupport;
import net.tape.application.JwtAuthFilter;
import net.tape.application.JwtService;
import net.tape.application.SecurityConfig;
import net.tape.model.Security;
import net.tape.orm.SecurityEntity;
import net.tape.orm.SecurityRepository;
import net.tape.service.SecurityMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Web-layer slice test for {@link AdminSecurityController} (repo-backed admin CRUD, #54). */
@WebMvcTest(AdminSecurityController.class)
@Import({SecurityConfig.class, JwtAuthFilter.class, JwtService.class, JwtTestSupport.class})
class AdminSecurityControllerTest {

    @Autowired MockMvc mvc;
    @Autowired JwtService jwt;
    @Autowired JwtTestSupport jwtTestSupport;
    @MockitoBean SecurityRepository repo;
    @MockitoBean SecurityMapper mapper;

    private String authHeader() {
        return jwtTestSupport.bearerHeader(jwt);
    }

    @Test
    void listWithoutAuthorizationHeaderIsRejected() throws Exception {
        mvc.perform(post("/api/admin/securities")
                .contentType(MediaType.APPLICATION_JSON).content("{}"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void deleteWithoutAuthorizationHeaderIsRejected() throws Exception {
        mvc.perform(delete("/api/admin/securities/1"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void createPersistsSecurityAndReturnsItWithId() throws Exception {
        SecurityEntity saved = new SecurityEntity();
        saved.setId(7L);
        saved.setSymbol("AAPL");
        saved.setName("Apple Inc.");
        when(repo.save(any(SecurityEntity.class))).thenReturn(saved);
        Security model = new Security();
        model.setId(7L);
        model.setSymbol("AAPL");
        model.setName("Apple Inc.");
        when(mapper.toModel(saved)).thenReturn(model);

        mvc.perform(post("/api/admin/securities")
                .header("Authorization", authHeader())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"symbol\":\"AAPL\",\"name\":\"Apple Inc.\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(7))
            .andExpect(jsonPath("$.symbol").value("AAPL"))
            .andExpect(jsonPath("$.name").value("Apple Inc."));
        verify(repo).save(any(SecurityEntity.class));
    }
}
