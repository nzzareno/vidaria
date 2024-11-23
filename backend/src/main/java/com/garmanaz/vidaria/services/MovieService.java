package com.garmanaz.vidaria.services;

import com.garmanaz.vidaria.DTO.MovieResponse;
import com.garmanaz.vidaria.entities.Genre;
import com.garmanaz.vidaria.entities.Movie;
import com.garmanaz.vidaria.repositories.CategoryRepository;
import com.garmanaz.vidaria.repositories.GenreRepository;
import com.garmanaz.vidaria.repositories.MovieRepository;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@Transactional
public class MovieService {

    private static final String API_URL = "https://api.themoviedb.org/3";
    private final MovieRepository movieRepository;
    private final GenreRepository genreRepository;
    private final CategoryRepository categoryRepository;
    private final RestTemplate restTemplate;
    private final RedisTemplate<String, Movie> movieRedisTemplate;
    private final MovieCacheService movieCacheService;


    @Value("${tmdb.api.key}")
    private String API_KEY;

    @Autowired
    public MovieService(MovieRepository movieRepository, GenreRepository genreRepository, CategoryRepository categoryRepository, RestTemplate restTemplate, RedisTemplate<String, Movie> movieRedisTemplate, MovieCacheService movieCacheService) {
        this.movieRepository = movieRepository;
        this.genreRepository = genreRepository;
        this.categoryRepository = categoryRepository;
        this.restTemplate = restTemplate;
        this.movieRedisTemplate = movieRedisTemplate;
        this.movieCacheService = movieCacheService;

    }


    public void preCacheMovies() {
        try {
            List<Movie> movies = movieRepository.findAll();
            for (Movie movie : movies) {
                Hibernate.initialize(movie.getGenres());
                Hibernate.initialize(movie.getCategory());

                String cacheKey = "movie:" + movie.getId();
                movieRedisTemplate.opsForValue().set(cacheKey, movie, 1, TimeUnit.DAYS); // TTL de 1 día
                System.out.println("Saved to Redis: " + cacheKey + " -> " + movie);
            }
        } catch (Exception e) {
            System.err.println("Failed to precache movies in Redis: " + e.getMessage());
        }
    }


    @Cacheable("genres")
    public List<Genre> getGenres() {
        String url = API_URL + "/genre/movie/list?api_key=" + API_KEY;
        ResponseEntity<MovieResponse.GenreResponse> response = restTemplate.exchange(url, HttpMethod.GET, null, MovieResponse.GenreResponse.class);
        return Optional.ofNullable(response.getBody())
                .map(genreResponse -> genreResponse.getGenres().stream()
                        .map(genre -> new Genre(genre.getId(), genre.getName()))
                        .collect(Collectors.toList()))
                .orElse(Collections.emptyList());
    }

    @Transactional(readOnly = true)
    public List<Movie> getFeaturedMovies() {
        Pageable pageable = PageRequest.of(0, 50); // Obtén las 50 películas más populares
        List<Movie> allMovies = movieRepository.findAllWithUniqueGenres(pageable);
        Set<String> uniqueGenres = new HashSet<>(); // Para almacenar géneros únicos
        List<Movie> featuredMovies = new ArrayList<>();

        for (Movie movie : allMovies) {
            if (featuredMovies.size() >= 6) break; // Detener si ya tenemos 7 películas

            // Inicializa relaciones Lazy
            Hibernate.initialize(movie.getGenres());
            Hibernate.initialize(movie.getCategory());

            // Verifica si la película tiene un género único
            boolean hasUniqueGenre = movie.getGenres().stream()
                    .anyMatch(genre -> uniqueGenres.add(genre.getName())); // Agrega el género al Set

            if (hasUniqueGenre) {
                featuredMovies.add(movie);
            }
        }

        // Si no hay suficientes géneros únicos, completa con las más populares
        if (featuredMovies.size() < 7) {
            allMovies.sort(Comparator.comparingDouble(Movie::getPopularity).reversed());
            for (Movie movie : allMovies) {
                if (featuredMovies.size() >= 7) break;
                if (!featuredMovies.contains(movie)) {
                    featuredMovies.add(movie);
                }
            }
        }

        // Cacheo en Redis
        featuredMovies.forEach(movie -> {
            CompletableFuture.runAsync(() -> {
                String cacheKey = "movie:" + movie.getId();
                movieRedisTemplate.opsForValue().set(cacheKey, movie, 1, TimeUnit.DAYS);
            });
        });

        return featuredMovies;
    }


    @Transactional(readOnly = true)
    public Page<Movie> getPaginatedMovies(Pageable pageable) {
        Page<Movie> moviesPage = movieRepository.findAll(pageable);
        moviesPage.getContent().forEach(movie -> {
            Hibernate.initialize(movie.getGenres());
            Hibernate.initialize(movie.getCategory());
        });
        return moviesPage;
    }

    public Page<Movie> searchMovies(String title, List<String> genres, List<String> categories, LocalDate releaseDateFrom, LocalDate releaseDateTo, Double ratingFrom, Double ratingTo, Double popularityFrom, Double popularityTo, Pageable pageable) {
        title = title != null ? title.toLowerCase() : null;
        Sort sort = Sort.by(Sort.Order.desc("popularity"), Sort.Order.desc("rating"));
        pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);
        return movieRepository.searchMovies(title, genres, categories, releaseDateFrom, releaseDateTo, ratingFrom, ratingTo, popularityFrom, popularityTo, pageable);
    }

    public void deleteMovie(Long id) {
        movieRepository.deleteById(id);
    }


    public Movie saveMovie(Movie movie) {
        return movieRepository.save(movie);
    }


    public Page<Movie> getMoviesByCategory(String categoryName, Pageable pageable) {
        return movieRepository.findMoviesByCategory(categoryName, pageable);
    }

    public Movie updateMovie(Long id, Movie movie) {
        Movie existingMovie = movieRepository.findById(id).orElse(null);
        if (existingMovie != null) {
            existingMovie.setTitle(movie.getTitle());
            existingMovie.setDescription(movie.getDescription());
            existingMovie.setReleaseDate(movie.getReleaseDate());
            existingMovie.setCover(movie.getCover());
            existingMovie.setBackground(movie.getBackground());
            existingMovie.setDirector(movie.getDirector());
            existingMovie.setDuration(movie.getDuration());
            existingMovie.setRating(movie.getRating());
            existingMovie.setPopularity(movie.getPopularity());
            existingMovie.setCategory(movie.getCategory());
            existingMovie.setGenres(movie.getGenres());
            return movieRepository.save(existingMovie);
        }
        return null;
    }

    public Page<Movie> getBestMoviesByGenres(String genre, Pageable pageable) {
        return movieRepository.getBestMoviesByGenres(genre, pageable);
    }


}
