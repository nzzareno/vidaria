package com.garmanaz.vidaria.controllers;

import com.garmanaz.vidaria.entities.Movie;
import com.garmanaz.vidaria.repositories.MovieRepository;
import com.garmanaz.vidaria.services.MovieService;
import com.garmanaz.vidaria.utils.GlobalExceptionHandler;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/movies")
public class MovieController {

    private final MovieService movieService;
    private final MovieRepository movieRepository;

    public MovieController(MovieService movieService, MovieRepository movieRepository) {
        this.movieService = movieService;
        this.movieRepository = movieRepository;
    }

    @GetMapping("/sync")
    @Transactional
    public ResponseEntity<String> syncMovies() {
        try {
            // Asegúrate de que esta llamada esté dentro de la transacción
            movieService.syncMovies();
            return ResponseEntity.ok("Movies synchronized successfully!");
        } catch (Exception e) {
            System.err.println("Error synchronizing movies: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error synchronizing movies: " + e.getMessage());
        }
    }

    @GetMapping("/category/{categoryName}")
    public ResponseEntity<Page<Movie>> getMoviesByCategory(
            @PathVariable String categoryName,
            @PageableDefault(size = 20) Pageable pageable) {
        try {
            return ResponseEntity.ok(movieService.getMoviesByCategory(categoryName, pageable));
        } catch (Exception e) {
            System.err.println("Error fetching movies by category: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
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
        // Usa un Set para asegurar que no haya géneros duplicados
        Set<String> uniqueGenres = new HashSet<>(Arrays.asList(
                "action",
                "adventure",
                "animation",
                "horror",
                "mystery",
                "romance",
                "comedy",
                "crime",
                "documentary",
                "drama",
                "family",
                "fantasy",
                "history",
                "science fiction",
                "tv movie",
                "thriller",
                "war",
                "western"
        ));

        // Lista para las películas destacadas
        List<Movie> featuredMovies = new ArrayList<>();
        // Para realizar un seguimiento de los IDs de las películas agregadas
        Set<Long> addedMovieIds = new HashSet<>();

        for (String genre : uniqueGenres) {
            try {
                // Obtiene las mejores películas por género
                Page<Movie> bestMoviesByGenres = movieService.getBestMoviesByGenres(genre);

                // Verifica si hay películas en la lista
                if (!bestMoviesByGenres.isEmpty()) {
                    // Solo toma la primera película y se asegura de que no haya sido agregada antes
                    Movie firstMovie = bestMoviesByGenres.getContent().get(0);
                    if (!addedMovieIds.contains(firstMovie.getId())) {
                        featuredMovies.add(firstMovie); // Agregar la película
                        addedMovieIds.add(firstMovie.getId()); // Marcar la película como agregada
                    }
                }
            } catch (Exception e) {
                throw new RuntimeException("Error fetching featured movies: " + GlobalExceptionHandler.handleException(e).getBody());
            }
        }

        return ResponseEntity.ok(featuredMovies);
    }






    // GET BEST MOVIES BY GENRES
    @GetMapping("/best/{genre}")
    public ResponseEntity<Page<Movie>> getBestMoviesByGenres(@PathVariable String genre) {
        try {
            return ResponseEntity.ok(movieService.getBestMoviesByGenres(genre));
        } catch (Exception e) {
            throw new RuntimeException("Error fetching best movies: " + GlobalExceptionHandler.handleException(e).getBody());
        }
    }


    @GetMapping
    public ResponseEntity<Page<Movie>> getMovies(Pageable pageable) {
        try {
            return ResponseEntity.ok(movieService.getMovies(pageable));
        } catch (Exception e) {
            throw new RuntimeException("Error fetching movies: " + GlobalExceptionHandler.handleException(e).getBody());
        }
    }


    @GetMapping("/paginated")
    public ResponseEntity<Page<Movie>> getPaginatedMovies(Pageable pageable) {
        try {
            return ResponseEntity.ok(movieService.getPaginatedMovies(pageable));
        } catch (Exception e) {
            throw new RuntimeException("Error fetching movies: " + GlobalExceptionHandler.handleException(e).getBody());
        }
    }

    @GetMapping("/{film}")
    public ResponseEntity<Movie> getMovieById(@RequestParam(required = false) String idParam, @PathVariable String film) {
        try {
            return ResponseEntity.ok(movieService.getMovieById(idParam, film));
        } catch (Exception e) {
            throw new EntityNotFoundException("Error fetching movie: " + GlobalExceptionHandler.handleException(e).getBody());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteMovie(@PathVariable Long id) {
        try {
            movieService.deleteMovie(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            throw new RuntimeException("Error deleting movie: " + GlobalExceptionHandler.handleException(e).getBody());
        }
    }

    @PostMapping
    public ResponseEntity<Movie> addMovie(@Valid @RequestBody Movie movie) {
        try {
            return ResponseEntity.ok(movieService.saveMovie(movie));
        } catch (Exception e) {
            throw new RuntimeException("Error adding movie: " + GlobalExceptionHandler.handleException(e).getBody());
        }
    }

    @PatchMapping("/{id}")
    ResponseEntity<Movie> updateMovie(@PathVariable Long id, @RequestBody Movie movie) {
        try {
            return ResponseEntity.ok(movieService.updateMovie(id, movie));
        } catch (Exception e) {
            throw new RuntimeException("Error updating movie: " + GlobalExceptionHandler.handleException(e).getBody());
        }
    }
}
