package com.garmanaz.vidaria.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.garmanaz.vidaria.DTO.WatchlistRequest;
import com.garmanaz.vidaria.entities.AppUser;
import com.garmanaz.vidaria.entities.Movie;
import com.garmanaz.vidaria.entities.Role;
import com.garmanaz.vidaria.entities.Watchlist;
import com.garmanaz.vidaria.services.WatchlistService;
import com.garmanaz.vidaria.utils.JWT.JwtTokenUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import java.util.ArrayList;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;


@WebMvcTest(WatchlistController.class)
@WithMockUser(username = "john", roles = {"USER"})
public class WatchlistControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private WatchlistService watchlistService;

    @MockBean
    private RestTemplateBuilder restTemplateBuilder;

    @MockBean
    private UserDetailsService userDetailsService;

    @MockBean
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private ObjectMapper objectMapper;


    @Test
    void addToWatchlistTest() throws Exception {
        WatchlistRequest request = new WatchlistRequest();
        request.setUserId(1L);
        request.setMovieId(10L);

        AppUser user = new AppUser();
        user.setId(1L);
        user.setUsername("test");
        user.setEmail("g@gmail.com");
        user.setRole(Role.USER);

        Movie movie = new Movie();
        movie.setId(10L);
        movie.setTitle("Terminator");

        Watchlist watchlistItem = new Watchlist();
        watchlistItem.setId(1L);
        watchlistItem.setUser(user);
        watchlistItem.setMovie(movie);

        when(watchlistService.addToWatchlist(any(Long.class), any(Long.class), any(Long.class)))
                .thenReturn(watchlistItem);

        mockMvc.perform(post("/api/watchlist/add")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().is(201)).andReturn();

        verify(watchlistService).addToWatchlist(request.getUserId(), request.getMovieId(), request.getSerieId());
    }

    @Test
    void getWatchlistByIdTest() {
        Long userId = 1L;

        when(watchlistService.getWatchlistForUser(userId)).thenReturn(new ArrayList<Watchlist>());

        try {
            mockMvc.perform(get("/api/watchlist/" + userId))
                    .andExpect(status().isNoContent());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        verify(watchlistService).getWatchlistForUser(userId);

    }

    @Test
    void deleteFromWatchlistTest() throws Exception {
        long userId = 1L;
        long movieId = 1L;

        mockMvc.perform(delete("/api/watchlist").with(csrf())
                        .with(csrf())
                        .param("userId", Long.toString(userId))
                        .param("movieId", Long.toString(movieId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Item removed from watchlist"));
    }

    @Test
    void deleteAllFromWatchlistTest() {
        long userId = 1L;
        try {
            mockMvc.perform(delete("/api/watchlist/clear/" + userId).with(csrf()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("Watchlist cleared"));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        verify(watchlistService).deleteAllFromWatchlist(userId);


    }

    @Test
    void checkIfInWatchlistTest() throws Exception {
        Long userId = 1L;
        Long movieId = 1L;

        when(watchlistService.isInWatchlist(userId, movieId, null)).thenReturn(true);

        mockMvc.perform(get("/api/watchlist/check")
                        .param("userId", userId.toString())
                        .param("movieId", movieId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exists").value(true));

        verify(watchlistService).isInWatchlist(userId, movieId, null);
    }
}
