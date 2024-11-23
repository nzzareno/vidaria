package com.garmanaz.vidaria.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.garmanaz.vidaria.entities.Category;
import com.garmanaz.vidaria.entities.Movie;
import com.garmanaz.vidaria.services.MovieCacheService;
import com.garmanaz.vidaria.services.MovieService;
import com.garmanaz.vidaria.services.SerieService;
import com.garmanaz.vidaria.utils.JWT.JwtTokenUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import java.util.List;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(MovieController.class)
@ExtendWith(MockitoExtension.class)
@WithMockUser(username = "john")
public class MovieControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private MovieService movieService;

    @MockBean
    private SerieService serieService;

    @MockBean
    private MovieCacheService movieCacheService;

    @MockBean
    private JwtTokenUtil jwtTokenUtil;

    @MockBean
    private RestTemplateBuilder restTemplateBuilder;

    @MockBean
    private RedisTemplate<String, String> redisTemplate;

    @Test
    void searchMoviesTest() throws Exception {
        String title = "Terminator";
        Pageable pageable = PageRequest.of(0, 20);

        Movie terminator = Movie.builder()
                .id(1L)
                .title("Terminator")
                .category(Category.builder().name("Action").build())
                .build();

        Movie forrestGump = Movie.builder()
                .id(2L)
                .title("Forrest Gump")
                .category(Category.builder().name("Drama").build())
                .build();

        List<Movie> movies = List.of(terminator, forrestGump);

        Page<Movie> myMoviePage = new PageImpl<>(movies, pageable, movies.size());

        when(movieService.searchMovies(title, null, null, null, null, null, null, null, null, pageable)).thenReturn(myMoviePage);

        mockMvc.perform(get("/movies/search").with(csrf())
                        .param("title", title)
                        .param("page", "0")
                        .param("size", "20"))
                .andExpect(status().isOk());

        verify(movieService, times(1)).searchMovies(title, null, null, null, null, null, null, null, null, pageable);

    }

    @Test
    void getBestMoviesByGenreTest() throws Exception {
        String genre = "Action";
        Pageable pageable = PageRequest.of(0, 20);

        Movie terminator = Movie.builder()
                .id(1L)
                .title("Terminator")
                .category(Category.builder().name("Action").build())
                .build();

        Movie forrestGump = Movie.builder()
                .id(2L)
                .title("Forrest Gump")
                .category(Category.builder().name("Drama").build())
                .build();


        List<Movie> movies = List.of(terminator, forrestGump);

        Page<Movie> myMoviePage = new PageImpl<>(movies, pageable, movies.size());

        when(movieService.getBestMoviesByGenres(genre, pageable)).thenReturn(myMoviePage);

        mockMvc.perform(get("/movies/best/{genre}", genre).with(csrf())
                        .param("page", "0")
                        .param("size", "20"))
                .andExpect(status().isOk());

        verify(movieService, times(1)).getBestMoviesByGenres(genre, pageable);


    }

    @Test
    void getMoviesTest() throws Exception {
        Pageable pageable = PageRequest.of(0, 10);

        Movie terminator = Movie.builder()
                .id(1L)
                .title("Terminator")
                .category(Category.builder().name("Action").build())
                .build();

        Movie forrestGump = Movie.builder()
                .id(2L)
                .title("Forrest Gump")
                .category(Category.builder().name("Drama").build())
                .build();


        Page<Movie> myMoviePage = new PageImpl<>(List.of(terminator, forrestGump), pageable, 2);

        when(movieService.getPaginatedMovies(pageable)).thenReturn(myMoviePage);


        mockMvc.perform(get("/movies").with(csrf())
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk());

        verify(movieService, times(1)).getPaginatedMovies(pageable);
    }


    @Test
    void getMovieByIdTest() throws Exception {
        Long filmId = 1L;

        Movie t = Movie.builder()
                .id(1L)
                .title("Terminator")
                .category(Category.builder().name("Action").build())
                .build();

        when(movieCacheService.getMovie(filmId)).thenReturn(t);

        mockMvc.perform(get("/movies/{film}", filmId).with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Terminator"));

        verify(movieCacheService, times(1)).getMovie(filmId);


    }

    @Test
    void deleteMovieByIdTest() throws Exception {
        Long filmId = 1L;


        mockMvc.perform(delete("/movies/{id}", filmId).with(csrf()))
                .andExpect(status().isNoContent());

        verify(movieService, times(1)).deleteMovie(filmId);

    }


}
