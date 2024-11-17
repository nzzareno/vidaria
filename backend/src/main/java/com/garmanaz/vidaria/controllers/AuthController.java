package com.garmanaz.vidaria.controllers;

import com.garmanaz.vidaria.entities.AppUser;
import com.garmanaz.vidaria.entities.Role;
import com.garmanaz.vidaria.services.UserService;
import com.garmanaz.vidaria.utils.ErrorResponse;
import com.garmanaz.vidaria.utils.JWT.JwtResponse;
import com.garmanaz.vidaria.utils.JWT.JwtTokenUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenUtil jwtTokenUtil;
    private final UserService userService;

    @Autowired
    public AuthController(AuthenticationManager authenticationManager, JwtTokenUtil jwtTokenUtil, UserService userService) {
        this.authenticationManager = authenticationManager;
        this.jwtTokenUtil = jwtTokenUtil;
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AppUser user) {
        if (userService.getUserByUsername(user.getUsername()) != null) {
            System.out.println("User already exists: " + user.getUsername()); // Log temporal
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "User already exists"));
        }
        if (!Objects.equals(user.getUsername(), "garmanaz")) {
            user.setRole(Role.USER);
        } else {
            user.setRole(Role.ADMIN);
        }

        // Verificar si username es demasiado corto
        if (user.getUsername() == null || user.getUsername().length() < 4) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Username must be at least 4 characters long"));
        }

        // Verificar si password es null o demasiado corto
        if (user.getPassword().length() < 8) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Password must be at least 8 characters long"));
        }

        // Verificar si email es válido
        if (user.getEmail() == null || !user.getEmail().contains("@")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Invalid email address"));
        }

        // Guardar usuario
        AppUser savedUser = userService.saveUser(user);

        return ResponseEntity.ok(savedUser);
    }


    @GetMapping("/user")
    public ResponseEntity<?> getUser(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }

        String username = principal.getName();

        AppUser user = userService.getUserByUsername(username);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
        }
        return ResponseEntity.ok(user);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AppUser loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()));
            SecurityContextHolder.getContext().setAuthentication(authentication);
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String jwt = jwtTokenUtil.generateToken(userDetails.getUsername());
            return ResponseEntity.ok(new JwtResponse(jwt));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid username or password"));
        }
    }
}

