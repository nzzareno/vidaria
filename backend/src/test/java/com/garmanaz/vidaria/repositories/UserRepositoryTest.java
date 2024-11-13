package com.garmanaz.vidaria.repositories;

import com.garmanaz.vidaria.entities.AppUser;
import com.garmanaz.vidaria.entities.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DataJpaTest
@ActiveProfiles("test")
public class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    private AppUser testUser;
    private Role testRole;


    @BeforeEach
    public void setUp() {
        testUser = AppUser.builder()
                .username("testUser")
                .password("password123")
                .email("testuser@example.com")
                .role(testRole)
                .build();

        userRepository.save(testUser);
    }

    @Test
    public void testFindByUsername() {
        Optional<AppUser> foundUser = userRepository.findByUsername("testUser");

        assertTrue(foundUser.isPresent());
        assertEquals("testUser", foundUser.get().getUsername());
        assertEquals("testuser@example.com", foundUser.get().getEmail());
    }

    @Test
    public void testFindByUsernameNotFound() {
        Optional<AppUser> foundUser = userRepository.findByUsername("nonExistingUser");
        assertTrue(foundUser.isEmpty());
    }
}
