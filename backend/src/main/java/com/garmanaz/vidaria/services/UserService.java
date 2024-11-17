package com.garmanaz.vidaria.services;

import com.garmanaz.vidaria.entities.AppUser;
import com.garmanaz.vidaria.repositories.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;


    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
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



}