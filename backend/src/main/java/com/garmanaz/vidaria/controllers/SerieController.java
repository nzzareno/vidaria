package com.garmanaz.vidaria.controllers;

import com.garmanaz.vidaria.entities.Serie;
import com.garmanaz.vidaria.services.SerieService;
import lombok.NonNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.bind.DefaultValue;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

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
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<?> getSeriesByType(@PathVariable @NonNull String type, @RequestParam(defaultValue = "1") int page) {
        try {
            List<Serie> series = serieService.fetchSeries(type, page);
            return ResponseEntity.ok(series);
        } catch (Exception e) {
            throw new RuntimeException("Error fetching series by type: " + e.getMessage());
        }
    }

    @GetMapping("/genre/{genre}")
    public ResponseEntity<List<Serie>> getSeriesByGenre(@PathVariable @NonNull String genre) {
        try {
            return ResponseEntity.ok(serieService.getSeriesByGenre(genre));
        } catch (Exception e) {
            throw new RuntimeException("Error fetching series by genre: " + e.getMessage());
        }
    }

    //check if exists in db
    @GetMapping("/check/{id}")
    public ResponseEntity<Boolean> checkIfSerieExists(@PathVariable Long id) {
        return ResponseEntity.ok(serieService.existsById(id));
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
            Page<Serie> series = serieService.searchSeries(title, genres, releaseDateFrom, releaseDateTo, ratingFrom, ratingTo, popularityFrom, popularityTo, pageable);
            return new ResponseEntity<>(series, HttpStatus.OK);
        } catch (Exception e) {
            throw new RuntimeException("Error searching series: " + e.getMessage());
        }
    }


    @GetMapping("/best/{genre}")
    public ResponseEntity<Page<Serie>> getBestSeriesByGenres(@PathVariable String genre, Pageable pageable) {
        try {
            Page<Serie> series = serieService.getBestSeriesByGenres(genre, pageable);
            return new ResponseEntity<>(series, HttpStatus.OK);
        } catch (Exception e) {
            throw new RuntimeException("Error fetching best series by genre: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<Page<Serie>> getSeries(Pageable pageable) {
        try {
            Page<Serie> series = serieService.getSeries(pageable);
            return new ResponseEntity<>(series, HttpStatus.OK);
        } catch (Exception e) {
            throw new RuntimeException("Error fetching series: " + e.getMessage());
        }
    }

    // getMostPopularAndTopRated
    @GetMapping("/most-popular")
    public ResponseEntity<Page<Serie>> getMostPopularAndTopRated(Pageable pageable) {
        try {
            Page<Serie> series = serieService.getMostPopularAndTopRated(pageable);
            return new ResponseEntity<>(series, HttpStatus.OK);
        } catch (Exception e) {
            throw new RuntimeException("Error fetching most popular and top rated series: " + e.getMessage());
        }
    }

    @GetMapping("/{serie}")
    public ResponseEntity<Serie> getSerieById(@PathVariable Long serie) {
        return ResponseEntity.ok(serieService.getSeriesById(serie));
    }

    @GetMapping("/sync")
    @Transactional
    public ResponseEntity<String> syncSeries(@RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "20") int totalSeries) {
        try {
            serieService.saveAllSeries(page, totalSeries);
            return ResponseEntity.ok("Series synchronized successfully!");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error occurred while synchronizing series: " + e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<Serie> saveSeries(@RequestBody Serie series) {
        Serie savedSeries = serieService.saveSerie(series);
        return ResponseEntity.ok(savedSeries);
    }



}
