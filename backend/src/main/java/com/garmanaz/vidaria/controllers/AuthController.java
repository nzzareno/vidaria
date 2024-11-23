package com.garmanaz.vidaria.controllers;

import com.garmanaz.vidaria.entities.AppUser;
import com.garmanaz.vidaria.entities.Role;
import com.garmanaz.vidaria.repositories.UserRepository;
import com.garmanaz.vidaria.services.EmailService;
import com.garmanaz.vidaria.services.UserService;
import com.garmanaz.vidaria.utils.JWT.JwtResponse;
import com.garmanaz.vidaria.utils.JWT.JwtTokenUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Date;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
@Tag(name = "Authentication", description = "Endpoints for user authentication")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenUtil jwtTokenUtil;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private SimpMessagingTemplate messagingTemplate;


    @Autowired
    public AuthController(AuthenticationManager authenticationManager, JwtTokenUtil jwtTokenUtil, UserService userService, UserRepository userRepository, PasswordEncoder passwordEncoder, EmailService emailService, SimpMessagingTemplate messagingTemplate) {
        this.authenticationManager = authenticationManager;
        this.jwtTokenUtil = jwtTokenUtil;
        this.userService = userService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.messagingTemplate = messagingTemplate;
        logger.info("AuthController initialized");

    }

    @Operation(summary = "Register a new user",
            responses = {
                    @ApiResponse(responseCode = "201", description = "User registered successfully"),
                    @ApiResponse(responseCode = "400", description = "Invalid input data"),
                    @ApiResponse(responseCode = "409", description = "User already exists")
            })
    @PostMapping("/register")
    public ResponseEntity<?> register(
            @Parameter(description = "Details of the user to register") @RequestBody AppUser user) {
        logger.info("Attempting to register user: {}", user.getUsername());

        if (userService.getUserByUsername(user.getUsername()) != null) {
            logger.warn("User already exists: {}", user.getUsername());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "User already exists"));
        }

        if (!Objects.equals(user.getUsername(), "garmanaz")) {
            user.setRole(Role.USER);
        } else {
            user.setRole(Role.ADMIN);
        }

        // Validations
        if (user.getUsername() == null || user.getUsername().length() < 4) {
            logger.warn("Username too short: {}", user.getUsername());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Username must be at least 4 characters long"));
        }

        if (user.getPassword().length() < 8) {
            logger.warn("Password too short for user: {}", user.getUsername());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Password must be at least 8 characters long"));
        }

        if (user.getEmail() == null || !user.getEmail().contains("@")) {
            logger.warn("Invalid email for user: {}", user.getUsername());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid email address"));
        }

        AppUser savedUser = userService.saveUser(user);
        logger.info("User registered successfully: {}", user.getUsername());

        return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
    }

    @Operation(summary = "Get user information",
            security = @SecurityRequirement(name = "bearerAuth"),
            responses = {
                    @ApiResponse(responseCode = "200", description = "User information retrieved successfully"),
                    @ApiResponse(responseCode = "401", description = "User not authenticated"),
                    @ApiResponse(responseCode = "404", description = "User not found")
            })
    @GetMapping("/user")
    public ResponseEntity<?> getUser(@Parameter(description = "Current user's principal", hidden = true) Principal principal) {
        if (principal == null) {
            logger.warn("Unauthenticated access to /user endpoint");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated"));
        }

        String username = principal.getName();
        logger.info("Checking user with username/email: {}", username);
        AppUser user = userService.getUserByUsername(username);
        if (user == null) {
            logger.error("User not found: {}", username);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
        }
        logger.info("Password comparison for user: {}", username);

        return ResponseEntity.ok(user);
    }

    @Operation(summary = "Login with username and password",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Login successful"),
                    @ApiResponse(responseCode = "401", description = "Invalid username or password")
            })
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AppUser loginRequest) {
        logger.info("Intentando autenticar al usuario: {}", loginRequest.getUsername());

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();

            logger.info("Autenticación exitosa para el usuario: {}", userDetails.getUsername());

            String jwt = jwtTokenUtil.generateToken(userDetails.getUsername());
            return ResponseEntity.ok(new JwtResponse(jwt));
        } catch (BadCredentialsException e) {
            logger.error("Fallo de autenticación para el usuario: {}", loginRequest.getUsername());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid username or password"));
        }
    }



    @Operation(summary = "Initiate password reset",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Reset email sent successfully"),
                    @ApiResponse(responseCode = "404", description = "User not found")
            })
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || !email.contains("@")) {
            logger.warn("Invalid email: {}", email);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid email address"));
        }

        try {
            logger.info("Searching for user with email: {}", email);
            AppUser user = userService.getUserByEmail(email);

            if (user == null) {
                logger.warn("User not found for email: {}", email);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
            }

            logger.info("Generating reset token for user: {}", user.getUsername());
            String token = UUID.randomUUID().toString();
            user.setResetToken(token);
            user.setResetTokenExpiration(new Date(System.currentTimeMillis() + 15 * 60 * 1000)); // Token válido 15 minutos

            userService.saveUser(user);

            String resetLink = "http://localhost:8081/auth/reset-password-link?token=" + token;
            emailService.sendResetPasswordEmail(user.getEmail(), resetLink);
            logger.info("Password reset email sent successfully to: {}", email);

            return ResponseEntity.ok(Map.of("message", "Reset email sent successfully"));
        } catch (Exception e) {
            logger.error("Error processing forgot password request: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Internal Server Error"));
        }
    }


    @GetMapping("/reset-password-link")
    public ResponseEntity<Void> handleResetPasswordLink(@RequestParam String token) {
        boolean isValid = userService.validateResetToken(token);
        if (isValid) {

            messagingTemplate.convertAndSend("/topic/token-validated", Map.of("success", true, "token", token));


            String redirectUrl = "http://localhost:5173/verification-success?token=" + token;
            return ResponseEntity.status(HttpStatus.FOUND).header("Location", redirectUrl).build();
        } else {

            String errorRedirectUrl = "http://localhost:5173/404";
            return ResponseEntity.status(HttpStatus.FOUND).header("Location", errorRedirectUrl).build();
        }
    }

    @GetMapping("/validate-token")
    public ResponseEntity<?> validateToken(@RequestParam String token) {
        boolean isValid = userService.validateResetToken(token);
        if (isValid) {
            return ResponseEntity.ok(Map.of("message", "Token is valid"));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid or expired token"));
        }
    }


    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");

        if (token == null || newPassword == null || newPassword.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Token and password are required"));
        }

        try {
            // Busca el usuario por el token
            AppUser user = userRepository.findByResetToken(token)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid or expired token"));

            // Verifica que el token no haya expirado
            if (user.getResetTokenExpiration().before(new Date())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Token expired"));
            }

            // Encripta la nueva contraseña
            String hashedPassword = passwordEncoder.encode(newPassword);
            user.setPassword(hashedPassword);
            user.setResetToken(null); // Limpia el token
            user.setResetTokenExpiration(null); // Limpia la expiración del token

            // Guarda el usuario con la nueva contraseña
            userRepository.save(user);

            logger.info("Contraseña actualizada para el usuario: {} con hash: {}", user.getUsername(), hashedPassword);

            return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
        } catch (Exception e) {
            logger.error("Error al restablecer la contraseña: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Internal Server Error"));
        }
    }


}
