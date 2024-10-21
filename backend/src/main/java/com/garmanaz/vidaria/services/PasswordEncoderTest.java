package com.garmanaz.vidaria.services;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordEncoderTest {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String rawPassword = "rude";
        // Generar hash
        String encodedPassword = encoder.encode(rawPassword);
        System.out.println("Generated Hash: " + encodedPassword);

        // Verificar hash
        boolean matches = encoder.matches(rawPassword, encodedPassword);
        System.out.println("Password matches: " + matches);
    }
}
