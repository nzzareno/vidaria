package com.garmanaz.vidaria.controllers;

import com.garmanaz.vidaria.entities.Movie;
import com.garmanaz.vidaria.services.MovieCacheService;
import com.garmanaz.vidaria.services.MovieService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/movies")
@Tag(name = "Movies", description = "Endpoints for fetching movies")
public class MovieController {

    private static final Logger logger = LoggerFactory.getLogger(MovieController.class);

    private final MovieService movieService;
    private final MovieCacheService movieCacheService;

    public MovieController(MovieService movieService, MovieCacheService movieCacheService) {
        this.movieService = movieService;
        this.movieCacheService = movieCacheService;
    }

    @Operation(summary = "Get movies by category",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Movies fetched successfully"),
                    @ApiResponse(responseCode = "400", description = "Invalid category name"),
                    @ApiResponse(responseCode = "404", description = "Movies not found")
            })
    @GetMapping("/category/{categoryName}")
    public ResponseEntity<Page<Movie>> getMoviesByCategory(
            @Parameter(description = "Name of the category", example = "Action") @PathVariable String categoryName,
            @PageableDefault(size = 20) Pageable pageable) {
        if (categoryName == null || categoryName.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        try {
            return ResponseEntity.ok(movieService.getMoviesByCategory(categoryName, pageable));
        } catch (Exception e) {
            logger.error("Error fetching movies by category: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @Operation(summary = "Search movies",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Movies fetched successfully"),
                    @ApiResponse(responseCode = "400", description = "Invalid search parameters"),
                    @ApiResponse(responseCode = "500", description = "Internal server error")
            })
    @GetMapping("/search")
    public ResponseEntity<Page<Movie>> searchMovies(
            @Parameter(description = "Title of the movie", example = "Inception") @RequestParam(required = false) String title,
            @Parameter(description = "List of genres to filter") @RequestParam(required = false) List<String> genres,
            @Parameter(description = "List of categories to filter") @RequestParam(required = false) List<String> categories,
            @Parameter(description = "Filter movies released after this date") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate releaseDateFrom,
            @Parameter(description = "Filter movies released before this date") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate releaseDateTo,
            @Parameter(description = "Minimum rating") @RequestParam(required = false) Double ratingFrom,
            @Parameter(description = "Maximum rating") @RequestParam(required = false) Double ratingTo,
            @Parameter(description = "Minimum popularity score") @RequestParam(required = false) Double popularityFrom,
            @Parameter(description = "Maximum popularity score") @RequestParam(required = false) Double popularityTo,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        try {
            Page<Movie> movies = movieService.searchMovies(title, genres, categories, releaseDateFrom, releaseDateTo,
                    ratingFrom, ratingTo, popularityFrom, popularityTo, pageable);
            return ResponseEntity.ok(movies);
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid parameters for searchMovies: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Error fetching movies: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(summary = "Get featured movies",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Featured movies fetched successfully"),
                    @ApiResponse(responseCode = "500", description = "Internal server error")
            })
    @GetMapping("/featured")
    public ResponseEntity<List<Movie>> getFeaturedMovies() {
        try {
            List<Movie> featuredMovies = movieService.getFeaturedMovies();
            return ResponseEntity.ok(featuredMovies);
        } catch (Exception e) {
            logger.error("Error fetching featured movies: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(summary = "Get best movies by genre",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Best movies fetched successfully"),
                    @ApiResponse(responseCode = "400", description = "Invalid genre"),
                    @ApiResponse(responseCode = "404", description = "Movies not found")
            })
    @GetMapping("/best/{genre}")
    public ResponseEntity<Page<Movie>> getBestMoviesByGenres(
            @Parameter(description = "Genre to filter by", example = "Drama") @PathVariable String genre,
            @PageableDefault(size = 20) Pageable pageable) {
        if (genre == null || genre.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        try {
            return ResponseEntity.ok(movieService.getBestMoviesByGenres(genre, pageable));
        } catch (Exception e) {
            logger.error("Error fetching best movies by genre: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @Operation(summary = "Get all movies",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Movies fetched successfully"),
                    @ApiResponse(responseCode = "404", description = "Movies not found")
            })
    @GetMapping
    public ResponseEntity<Page<Movie>> getMovies(Pageable pageable) {
        try {
            return ResponseEntity.ok(movieService.getPaginatedMovies(pageable));
        } catch (Exception e) {
            logger.error("Error fetching all movies: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @Operation(summary = "Get movie by ID",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Movie fetched successfully"),
                    @ApiResponse(responseCode = "404", description = "Movie not found")
            })
    @GetMapping("/{id}")
    public ResponseEntity<Movie> getMovieById(
            @Parameter(description = "ID of the movie to fetch", example = "1") @PathVariable Long id) {
        try {
            Movie movie = movieCacheService.getMovie(id);
            return ResponseEntity.ok(movie);
        } catch (Exception e) {
            logger.error("Error fetching movie by ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @Operation(summary = "Delete movie by ID",
            responses = {
                    @ApiResponse(responseCode = "204", description = "Movie deleted successfully"),
                    @ApiResponse(responseCode = "404", description = "Movie not found")
            })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMovie(
            @Parameter(description = "ID of the movie to delete", example = "1") @PathVariable Long id) {
        try {
            movieService.deleteMovie(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("Error deleting movie with ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}
