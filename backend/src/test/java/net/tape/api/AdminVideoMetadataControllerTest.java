package net.tape.api;

import net.tape.api.support.JwtTestSupport;
import net.tape.application.JwtAuthFilter;
import net.tape.application.JwtService;
import net.tape.application.SecurityConfig;
import net.tape.model.VideoPerson;
import net.tape.service.SecurityMapper;
import net.tape.service.VideoMetadataService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Web-layer slice test for {@link AdminVideoMetadataController} attach/detach (#54). */
@WebMvcTest(AdminVideoMetadataController.class)
@Import({SecurityConfig.class, JwtAuthFilter.class, JwtService.class, JwtTestSupport.class})
class AdminVideoMetadataControllerTest {

    @Autowired MockMvc mvc;
    @Autowired JwtService jwt;
    @Autowired JwtTestSupport jwtTestSupport;
    @MockitoBean VideoMetadataService metadata;
    @MockitoBean SecurityMapper securityMapper;

    private String authHeader() {
        return jwtTestSupport.bearerHeader(jwt);
    }

    @Test
    void putPeopleWithoutAuthorizationIsRejected() throws Exception {
        mvc.perform(put("/api/admin/videos/1/people")
                .contentType(MediaType.APPLICATION_JSON).content("[]"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void putSecuritiesWithoutAuthorizationIsRejected() throws Exception {
        mvc.perform(put("/api/admin/videos/1/securities")
                .contentType(MediaType.APPLICATION_JSON).content("[]"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void getPeopleReturnsAttachedPeopleWithRoles() throws Exception {
        VideoPerson host = new VideoPerson();
        host.setSlug("jane-doe"); host.setName("Jane Doe"); host.setInitials("JD"); host.setRole("host");
        VideoPerson guest = new VideoPerson();
        guest.setSlug("john-roe"); guest.setName("John Roe"); guest.setInitials("JR"); guest.setRole("guest");
        when(metadata.peopleFor(1L)).thenReturn(List.of(host, guest));

        mvc.perform(get("/api/admin/videos/1/people").header("Authorization", authHeader()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(2)))
            .andExpect(jsonPath("$[0].slug").value("jane-doe"))
            .andExpect(jsonPath("$[0].role").value("host"))
            .andExpect(jsonPath("$[1].role").value("guest"));
    }

    @Test
    void putPeopleReplacesTheSet() throws Exception {
        when(metadata.peopleFor(1L)).thenReturn(List.of());

        mvc.perform(put("/api/admin/videos/1/people")
                .header("Authorization", authHeader())
                .contentType(MediaType.APPLICATION_JSON)
                .content("[{\"personId\":5,\"role\":\"host\"},{\"personId\":6,\"role\":\"guest\"}]"))
            .andExpect(status().isOk());

        verify(metadata).setPeople(eq(1L), any());
    }
}
