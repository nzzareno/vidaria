package com.garmanaz.vidaria.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.garmanaz.vidaria.entities.AppUser;
import com.garmanaz.vidaria.entities.Role;
import com.garmanaz.vidaria.repositories.UserRepository;
import com.garmanaz.vidaria.services.EmailService;
import com.garmanaz.vidaria.services.UserService;
import com.garmanaz.vidaria.utils.JWT.JwtTokenUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@WithMockUser(username = "john")
@ActiveProfiles("test")
public class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private UserService userService;

    @MockBean
    private EmailService emailService;

    @MockBean
    private RestTemplateBuilder restTemplateBuilder;

    @MockBean
    private JwtTokenUtil jwtTokenUtil;

    @MockBean
    private UserDetailsService myUserDetailsService;

    @MockBean
    private RedisTemplate<String, Object> redisTemplate;

    @MockBean
    private AuthenticationManager authenticationManager;

    @Test
    void registerUserSuccessTest() throws Exception {
        // Configuración del usuario a registrar
        AppUser user = AppUser.builder()
                .id(1L)
                .username("john")
                .password("strongPassword123") // Contraseña válida
                .email("gar@gmail.com")
                .role(Role.USER)
                .build();

        // Simulación del servicio
        when(userService.getUserByUsername("john")).thenReturn(null);
        when(userService.saveUser(any(AppUser.class))).thenReturn(user);

        // Prueba
        mockMvc.perform(post("/auth/register").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(user)))
                .andExpect(status().is(201))
                .andExpect(jsonPath("$.username").value("john"))
                .andExpect(jsonPath("$.email").value("gar@gmail.com"))
                .andExpect(jsonPath("$.role").value("USER"));

        verify(userService).getUserByUsername("john");
        verify(userService).saveUser(any(AppUser.class));
    }

    @Test
    void registerTestUserAlreadyExists() throws Exception {
        AppUser user = new AppUser();
        user.setId(1L);
        user.setUsername("john");
        user.setPassword("testPassword");
        user.setRole(Role.USER);
        user.setEmail("g@gmail.com");

        when(userService.getUserByUsername(user.getUsername())).thenReturn(user);

        mockMvc.perform(post("/auth/register").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(user)))
                .andExpect(status().isConflict());

        verify(userService).getUserByUsername(user.getUsername());

    }

    @Test
    void loginUserTest() throws Exception {
        // Configurar el usuario y detalles de usuario simulados
        AppUser user = new AppUser();
        user.setUsername("john");
        user.setPassword("password");
        user.setRole(Role.USER);
        user.setEmail("g@gmail.com");

        UserDetails userDetails = User.withUsername(user.getUsername())
                .password(user.getPassword())
                .roles(user.getRole().name())
                .build();

        Authentication auth = new UsernamePasswordAuthenticationToken(userDetails, user.getPassword());

        // Simular `authenticationManager` sin verificar `UserService`
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(auth);

        mockMvc.perform(post("/auth/login").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(user)))
                .andExpect(status().isOk());
    }

    @Test
    void getUserTest() throws Exception {

        AppUser user = new AppUser();
        user.setUsername("john");
        user.setPassword("password");
        user.setRole(Role.USER);
        user.setEmail("g@gmail.com");


        when(userService.getUserByUsername("john")).thenReturn(user);


        mockMvc.perform(get("/auth/user").principal(() -> "john"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("john"));


        verify(userService).getUserByUsername("john");
    }
}
