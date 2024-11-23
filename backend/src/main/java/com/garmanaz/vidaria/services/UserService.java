package com.garmanaz.vidaria.services;

import com.garmanaz.vidaria.entities.AppUser;
import com.garmanaz.vidaria.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;


    @Autowired
    private PasswordEncoder passwordEncoder;



    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;

    }

    public AppUser saveUser(AppUser user) {
        user.setRole(user.getRole());
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        AppUser savedUser = userRepository.save(user);
        return savedUser != null ? savedUser : null;
    }



    public boolean checkPassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }

    public AppUser getUserByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }

    public boolean validateResetToken(String token) {
        Optional<AppUser> user = userRepository.findByResetToken(token);
        return user.isPresent() && user.get().getResetTokenExpiration().after(new Date());
    }

    public AppUser getUserByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    public AppUser getUserByResetToken(String token) {
        return userRepository.findByResetToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired token"));
    }
}