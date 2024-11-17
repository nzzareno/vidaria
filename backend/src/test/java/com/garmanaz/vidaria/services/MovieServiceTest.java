package com.garmanaz.vidaria.services;

import com.garmanaz.vidaria.DTO.MovieResponse;
import com.garmanaz.vidaria.entities.Genre;
import com.garmanaz.vidaria.entities.Movie;
import com.garmanaz.vidaria.repositories.CategoryRepository;
import com.garmanaz.vidaria.repositories.GenreRepository;
import com.garmanaz.vidaria.repositories.MovieRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@EnableCaching
public class MovieServiceTest {

    @Mock
    private MovieRepository movieRepository;

    @Mock
    private MovieCacheService movieCacheService;

    @Mock
    GenreRepository genreRepository;

    @Mock
    CategoryRepository categoryRepository;

    @Mock
    RedisTemplate<String, String> redisTemplate;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private MovieService movieService;


    @Test
    public void getMoviesByCategoryTest() {
        Page<Movie> page = mock(Page.class);
        when(movieRepository.findMoviesByCategory("popular", null)).thenReturn(page);
        movieService.getMoviesByCategory("popular", null);
        verify(movieRepository).findMoviesByCategory("popular", null);
    }


    @Test
    public void searchMoviesTest() {
        Page<Movie> page = mock(Page.class);
        Pageable pageable = PageRequest.of(0, 10, Sort.by(Sort.Order.desc("popularity"), Sort.Order.desc("rating")));

        when(movieRepository.searchMovies(
                "terminator",
                List.of("Action"),
                List.of("top_rated"),
                null, null, null, null, null, null,
                pageable)
        ).thenReturn(page);


        movieService.searchMovies(
                "terminator",
                List.of("Action"),
                List.of("top_rated"),
                null, null, null, null, null, null,
                pageable);
    }

    @Test
    public void getBestMoviesByGenresTest() {
        Page<Movie> page = mock(Page.class);
        Pageable pageable = PageRequest.of(0, 10, Sort.by(Sort.Order.desc("popularity"), Sort.Order.desc("rating")));

        when(movieRepository.getBestMoviesByGenres("Action", pageable)).thenReturn(page);

        movieService.getBestMoviesByGenres("Action", pageable);
    }

    @Test
    public void getPaginatedMoviesTest() {
        Page<Movie> page = mock(Page.class);
        Pageable pageable = PageRequest.of(0, 10, Sort.by(Sort.Order.desc("popularity"), Sort.Order.desc("rating")));

        when(movieRepository.findAll(pageable)).thenReturn(page);

        movieService.getPaginatedMovies(pageable);
    }


    @Test
    public void getGenresTest() {
        MovieResponse.GenreResponse genreResponse = new MovieResponse.GenreResponse();
        genreResponse.setGenres(List.of(
                new MovieResponse.Genre(1L, "Action"),
                new MovieResponse.Genre(2L, "Comedy")
        ));
        ResponseEntity<MovieResponse.GenreResponse> responseEntity = new ResponseEntity<>(genreResponse, HttpStatus.OK);
        when(restTemplate.exchange(anyString(), eq(HttpMethod.GET), isNull(), eq(MovieResponse.GenreResponse.class)))
                .thenReturn(responseEntity);

        List<Genre> genres = movieService.getGenres();

        assertNotNull(genres);
        assertEquals(2, genres.size());
        verify(restTemplate, times(1)).exchange(anyString(), eq(HttpMethod.GET), isNull(), eq(MovieResponse.GenreResponse.class));
    }

    @Test
    public void saveMovieTest() {
        Movie movie = new Movie();
        movie.setTitle("New Movie");
        when(movieRepository.save(any(Movie.class))).thenReturn(movie);

        Movie savedMovie = movieService.saveMovie(movie);

        assertNotNull(savedMovie);
        assertEquals("New Movie", savedMovie.getTitle());
        verify(movieRepository, times(1)).save(movie);
    }

    @Test
    public void updateMovieTest() {
        Long movieId = 1L;
        Movie existingMovie = new Movie();
        existingMovie.setId(movieId);
        existingMovie.setTitle("Old Title");
        when(movieRepository.findById(movieId)).thenReturn(Optional.of(existingMovie));

        Movie updatedMovieData = new Movie();
        updatedMovieData.setTitle("Updated Title");

        when(movieRepository.save(existingMovie)).thenReturn(existingMovie);

        Movie updatedMovie = movieService.updateMovie(movieId, updatedMovieData);

        assertNotNull(updatedMovie);
        assertEquals("Updated Title", updatedMovie.getTitle());
        verify(movieRepository, times(1)).save(existingMovie);
    }

}
