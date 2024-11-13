package com.garmanaz.vidaria.services;

import com.garmanaz.vidaria.DTO.MovieResponse;
import com.garmanaz.vidaria.entities.Category;
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
import org.springframework.beans.factory.annotation.Value;
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
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class MovieServiceTest {

    @Value("${tmdb.api.key}")
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
    public void initializeTest() {
        movieService.initialize();
        verify(movieCacheService).getGenres();
        verify(categoryRepository).findByName("popular");
        verify(categoryRepository).findByName("top_rated");
        verify(categoryRepository).findByName("upcoming");
    }

    @Test
    public void syncMoviesTest() {
        movieService.syncMovies();
        verify(movieCacheService).getGenres();

        verify(categoryRepository, atLeastOnce()).findAll();
    }

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
    public void preCacheMoviesImagesTest() {
        // Mock movie repository to return a list with one movie
        Movie movie = new Movie();
        movie.setId(1L);
        movie.setBackground("background_image_url");
        when(movieRepository.findAll()).thenReturn(List.of(movie));

        // Mock RedisTemplate opsForValue and ValueOperations
        ValueOperations<String, String> valueOperations = mock(ValueOperations.class);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);

        // Call the method under test
        movieService.preCacheMoviesImages();

        // Verify interactions with Redis
        verify(redisTemplate).opsForValue();
        verify(valueOperations).set("movie:1:image", "background_image_url", 1, TimeUnit.DAYS);
    }

    @Test
    public void syncGenresTest() {
        when(genreRepository.findByName("Action")).thenReturn(null);
        when(genreRepository.findByName("Adventure")).thenReturn(null);
        when(genreRepository.findByName("Animation")).thenReturn(null);
        when(genreRepository.findByName("Comedy")).thenReturn(null);
        when(genreRepository.findByName("Crime")).thenReturn(null);

        movieService.syncGenres();

        verify(genreRepository).findByName("Action");
        verify(genreRepository).findByName("Adventure");
        verify(genreRepository).findByName("Animation");
        verify(genreRepository).findByName("Comedy");
        verify(genreRepository).findByName("Crime");

    }

    @Test
    public void syncCategoriesTest() {
        when(categoryRepository.findByName("popular")).thenReturn(null);
        when(categoryRepository.findByName("top_rated")).thenReturn(null);
        when(categoryRepository.findByName("upcoming")).thenReturn(null);
        when(categoryRepository.findByName("now_playing")).thenReturn(null);
        when(categoryRepository.findByName("trending")).thenReturn(null);

        movieService.syncCategories();

        verify(categoryRepository).findByName("popular");
        verify(categoryRepository).findByName("top_rated");
        verify(categoryRepository).findByName("upcoming");
        verify(categoryRepository).findByName("now_playing");
        verify(categoryRepository).findByName("trending");

        verify(categoryRepository).save(new Category("popular"));
        verify(categoryRepository).save(new Category("top_rated"));
        verify(categoryRepository).save(new Category("upcoming"));
        verify(categoryRepository).save(new Category("now_playing"));
        verify(categoryRepository).save(new Category("trending"));
    }


    @Test
    public void getGenresTest() {
        // Arrange - Creating mock GenreResponse with genres populated
        MovieResponse.GenreResponse genreResponse = new MovieResponse.GenreResponse();
        genreResponse.setGenres(List.of(
                new MovieResponse.Genre(1L, "Action"),
                new MovieResponse.Genre(2L, "Comedy"),
                new MovieResponse.Genre(3L, "Horror")
        ));

        // Creating mock ResponseEntity with GenreResponse
        ResponseEntity<MovieResponse.GenreResponse> responseEntity = new ResponseEntity<>(genreResponse, HttpStatus.OK);

        // Setting up the mock RestTemplate behavior
        when(restTemplate.exchange(
                eq( "https://api.themoviedb.org/3/genre/movie/list?api_key="+System.getenv("tmdb.api.key")),
                eq(HttpMethod.GET),
                isNull(),
                eq(MovieResponse.GenreResponse.class))
        ).thenReturn(responseEntity);

        // Expected list of Genre entities
        List<Genre> expectedGenres = List.of(
                new Genre(1L, "Action"),
                new Genre(2L, "Comedy"),
                new Genre(3L, "Horror")
        );

        // Act - Invoke the actual method
        List<Genre> actualGenres = movieService.getGenres();

        // Output actualGenres for debugging
        System.out.println("Actual Genres: " + actualGenres);

        // Assert - Validate that expected and actual lists match
        assertEquals(expectedGenres, actualGenres, "The genres returned should match the expected genres.");
    }


}
