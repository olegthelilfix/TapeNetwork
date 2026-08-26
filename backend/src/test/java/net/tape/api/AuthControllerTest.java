package net.tape.api;

import net.tape.application.JwtService;
import net.tape.orm.AdminUserEntity;
import net.tape.orm.AdminUserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock AdminUserRepository users;
    @Mock PasswordEncoder encoder;
    @Mock JwtService jwt;

    private AuthController controller() {
        return new AuthController(users, encoder, jwt);
    }

    @Test
    void rejectsUnknownUser() {
        when(users.findByEmailAndActiveTrue("missing@example.com")).thenReturn(Optional.empty());

        ResponseEntity<?> response = controller().login(
            new AuthController.LoginRequest("missing@example.com", "password"));

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        verifyNoInteractions(encoder, jwt);
    }

    @Test
    void rejectsWrongPassword() {
        AdminUserEntity user = user("admin@example.com", "ADMIN");
        when(users.findByEmailAndActiveTrue(user.getEmail())).thenReturn(Optional.of(user));
        when(encoder.matches("wrong", user.getPasswordHash())).thenReturn(false);

        ResponseEntity<?> response = controller().login(
            new AuthController.LoginRequest(user.getEmail(), "wrong"));

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        verifyNoInteractions(jwt);
    }

    @Test
    void returnsTokenForValidCredentials() {
        AdminUserEntity user = user("admin@example.com", "ADMIN");
        when(users.findByEmailAndActiveTrue(user.getEmail())).thenReturn(Optional.of(user));
        when(encoder.matches("password", user.getPasswordHash())).thenReturn(true);
        when(jwt.issue(user.getEmail(), user.getRole())).thenReturn("signed-token");

        ResponseEntity<?> response = controller().login(
            new AuthController.LoginRequest(user.getEmail(), "password"));

        assertEquals(HttpStatus.OK, response.getStatusCode());
        AuthController.LoginResponse body = assertInstanceOf(
            AuthController.LoginResponse.class, response.getBody());
        assertEquals("signed-token", body.token());
        assertEquals(user.getEmail(), body.email());
        assertEquals("ADMIN", body.role());
    }

    private static AdminUserEntity user(String email, String role) {
        AdminUserEntity user = new AdminUserEntity();
        user.setEmail(email);
        user.setPasswordHash("hashed-password");
        user.setRole(role);
        user.setActive(true);
        return user;
    }
}
