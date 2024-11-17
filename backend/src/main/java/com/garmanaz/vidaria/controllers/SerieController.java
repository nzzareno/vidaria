package com.garmanaz.vidaria.controllers;

import com.garmanaz.vidaria.entities.Serie;
import com.garmanaz.vidaria.services.SerieService;
import lombok.NonNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/series")
@CrossOrigin(origins = "http://localhost:5173")
public class SerieController {

    private final SerieService serieService;

    @Autowired
    public SerieController(SerieService serieService) {
        this.serieService = serieService;
        System.out.println("SerieController initialized with SerieService: " + serieService.getClass().getName());
    }

    @Transactional
    @GetMapping("/type/{type}")
    public ResponseEntity<?> getSeriesByType(@PathVariable @NonNull String type, @RequestParam(defaultValue = "1") int page) {
        try {
            List<Serie> series = serieService.fetchSeries(type, page);
            return ResponseEntity.ok(series);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Series by type not found", e);
        }
    }

    @GetMapping("/genre/{genre}")
    public ResponseEntity<List<Serie>> getSeriesByGenre(@PathVariable @NonNull String genre) {
        try {
            return ResponseEntity.ok(serieService.getSeriesByGenre(genre));
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Series by genre not found", e);
        }
    }

    @GetMapping("/check/{id}")
    public ResponseEntity<Boolean> checkIfSerieExists(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(serieService.existsById(id));
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Serie don't exists", e);
        }
    }

    @GetMapping("/search")
    public ResponseEntity<Page<Serie>> searchSerie(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) List<String> genres,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate releaseDateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate releaseDateTo,
            @RequestParam(required = false) Double ratingFrom,
            @RequestParam(required = false) Double ratingTo,
            @RequestParam(required = false) Double popularityFrom,
            @RequestParam(required = false) Double popularityTo,
            Pageable pageable) {
        try {
            Page<Serie> series = serieService.searchSeries(
                    title, genres, releaseDateFrom, releaseDateTo,
                    ratingFrom, ratingTo, popularityFrom, popularityTo, pageable);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON) // Asegura el tipo de contenido
                    .body(series);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Series not found", e);
        }
    }


    @GetMapping("/best/{genre}")
    public ResponseEntity<Page<Serie>> getBestSeriesByGenres(@PathVariable String genre, Pageable pageable) {
        try {
            Page<Serie> series = serieService.getBestSeriesByGenres(genre, pageable);
            return new ResponseEntity<>(series, HttpStatus.OK);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Best Series by Genre not found", e);
        }
    }

    @GetMapping
    public ResponseEntity<Page<Serie>> getSeries(Pageable pageable) {
        try {
            Page<Serie> series = serieService.getSeries(pageable);
            return new ResponseEntity<>(series, HttpStatus.OK);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Series not found", e);
        }
    }

    // getMostPopularAndTopRated
    @GetMapping("/most-popular")
    public ResponseEntity<Page<Serie>> getMostPopularAndTopRated(Pageable pageable) {
        try {
            Page<Serie> series = serieService.getMostPopularAndTopRated(pageable);
            return new ResponseEntity<>(series, HttpStatus.OK);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Popular Top Rated Series not found", e);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Serie> getSerieById(@PathVariable Long id) {
        System.out.println("Controller: getSerieById invoked with id: " + id);
        return ResponseEntity.ok(serieService.getSeriesById(id));
    }
}
