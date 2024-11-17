package com.garmanaz.vidaria.services;


import com.garmanaz.vidaria.entities.AppUser;
import com.garmanaz.vidaria.entities.Role;
import com.garmanaz.vidaria.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;


    private AppUser user;
    private Role role;

    @BeforeEach
    void setUp() {
        user = new AppUser();
        role = Role.USER;
        user.setUsername("kuryak");
        user.setPassword("251097");
        user.setRole(role);


    }

    @Test
    public void testSaveUser_success() {
        when(passwordEncoder.encode("251097")).thenReturn("encodedPassword");
        when(userRepository.save(user)).thenReturn(user);
        AppUser savedUser = userService.saveUser(user);
        assertEquals(user, savedUser);
    }

    @Test
    public void testCheckPassword_success() {
        when(passwordEncoder.matches("251097", "encodedPassword")).thenReturn(true);
        boolean result = userService.checkPassword("251097", "encodedPassword");
        assertTrue(result);
    }

    @Test
    public void testGetUserByUsername_success() {
        when(userRepository.findByUsername("kuryak")).thenReturn(java.util.Optional.of(user));
        AppUser result = userService.getUserByUsername("kuryak");
        assertEquals(user, result);

        verify(userRepository).findByUsername("kuryak");
    }

    @Test
    public void testGetUserByUsername_failure() {
        when(userRepository.findByUsername("kuryak")).thenReturn(Optional.empty());
        AppUser result = userService.getUserByUsername("kuryak");
        assertNull(result);

        verify(userRepository).findByUsername("kuryak");
    }

    @Test
    public void testSaveUser_failure() {
        when(passwordEncoder.encode("251097")).thenReturn("encodedPassword");
        when(userRepository.save(user)).thenReturn(null);
        AppUser savedUser = userService.saveUser(user);
        assertNull(savedUser);
    }

    @Test
    public void testCheckPassword_failure() {
        when(passwordEncoder.matches("251097", "encodedPassword")).thenReturn(false);
        boolean result = userService.checkPassword("251097", "encodedPassword");
        assertFalse(result);
    }
}
