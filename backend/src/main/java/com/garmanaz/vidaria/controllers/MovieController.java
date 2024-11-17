package com.garmanaz.vidaria.controllers;

import com.garmanaz.vidaria.entities.Movie;
import com.garmanaz.vidaria.services.MovieCacheService;
import com.garmanaz.vidaria.services.MovieService;
import com.garmanaz.vidaria.utils.GlobalExceptionHandler;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/movies")
public class MovieController {

    private final MovieService movieService;
    private final MovieCacheService movieCacheService;

    public MovieController(MovieService movieService, MovieCacheService movieCacheService) {
        this.movieService = movieService;
        this.movieCacheService = movieCacheService;
    }

    @GetMapping("/category/{categoryName}")
    public ResponseEntity<Page<Movie>> getMoviesByCategory(
            @PathVariable String categoryName,
            @PageableDefault(size = 20) Pageable pageable) {
        try {
            return ResponseEntity.ok(movieService.getMoviesByCategory(categoryName, pageable));
        } catch (Exception e) {
            System.err.println("Error fetching movies by category: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/search")
    public ResponseEntity<Page<Movie>> searchMovies(
            @RequestParam(required = false, value = "title") String title,
            @RequestParam(required = false, value = "genres") List<String> genres,
            @RequestParam(required = false, value = "categories") List<String> categories,
            @RequestParam(required = false, value = "releaseDateFrom") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate releaseDateFrom,
            @RequestParam(required = false, value = "releaseDateTo") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate releaseDateTo,
            @RequestParam(required = false, value = "ratingFrom") Double ratingFrom,
            @RequestParam(required = false, value = "ratingTo") Double ratingTo,
            @RequestParam(required = false, value = "popularityFrom") Double popularityFrom,
            @RequestParam(required = false, value = "popularityTo") Double popularityTo,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        try {
            Page<Movie> movies = movieService.searchMovies(title, genres, categories, releaseDateFrom, releaseDateTo,
                    ratingFrom, ratingTo, popularityFrom, popularityTo, pageable);
            return new ResponseEntity<>(movies, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            throw new RuntimeException("Error fetching movies: " + GlobalExceptionHandler.handleException(e).getBody());
        }
    }


    @GetMapping("/featured")
    public ResponseEntity<List<Movie>> getFeaturedMovies() {
        try {
            List<Movie> featuredMovies = movieService.getFeaturedMovies();
            return ResponseEntity.ok(featuredMovies);
        } catch (Exception e) {
            System.err.println("Error fetching featured movies: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/best/{genre}")
    public ResponseEntity<Page<Movie>> getBestMoviesByGenres(
            @PathVariable String genre,
            @PageableDefault(size = 20) Pageable pageable) {
        try {
            return ResponseEntity.ok(movieService.getBestMoviesByGenres(genre, pageable));
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Best Movies by Genre not found", e);
        }
    }

    @GetMapping
    public ResponseEntity<Page<Movie>> getMovies(Pageable pageable) {
        try {
            return ResponseEntity.ok(movieService.getPaginatedMovies(pageable));
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Movies not found", e);
        }
    }

    @GetMapping("/paginated")
    public ResponseEntity<Page<Movie>> getPaginatedMovies(Pageable pageable) {
        try {
            return ResponseEntity.ok(movieService.getPaginatedMovies(pageable));
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Paginated Movies not found", e);
        }
    }

    @GetMapping("/{film}")
    public ResponseEntity<Movie> getMovieById(@RequestParam(required = false) String idParam, @PathVariable String film) {
        try {
            Movie movie = movieCacheService.getMovie(Long.parseLong(film));
            return ResponseEntity.ok(movie);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Movie with that ID not found", e);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteMovie(@PathVariable Long id) {
        try {
            movieService.deleteMovie(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Movie for delete not found", e);
        }
    }

}
