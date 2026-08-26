package net.tape.api;

import net.tape.application.JwtService;

import jakarta.validation.constraints.NotBlank;
import net.tape.orm.AdminUserEntity;
import net.tape.orm.AdminUserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/auth")
public class AuthController {

    public record LoginRequest(@NotBlank String email, @NotBlank String password) {}
    public record LoginResponse(String token, String email, String role) {}

    private final AdminUserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthController(AdminUserRepository users, PasswordEncoder encoder, JwtService jwt) {
        this.users = users;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        AdminUserEntity user = users.findByEmailAndActiveTrue(req.email()).orElse(null);
        if (user == null || !encoder.matches(req.password(), user.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Invalid credentials"));
        }
        String token = jwt.issue(user.getEmail(), user.getRole());
        return ResponseEntity.ok(new LoginResponse(token, user.getEmail(), user.getRole()));
    }

    /** Validates the current token — returns 200 if authenticated, 401 otherwise (handled by security filter). */
    @GetMapping("/me")
    public ResponseEntity<?> me(java.security.Principal principal) {
        return ResponseEntity.ok(Map.of("email", principal.getName()));
    }
}
