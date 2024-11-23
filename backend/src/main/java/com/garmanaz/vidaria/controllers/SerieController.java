package com.garmanaz.vidaria.controllers;

import com.garmanaz.vidaria.entities.Serie;
import com.garmanaz.vidaria.services.SerieService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.NonNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/series")
@CrossOrigin(origins = "http://localhost:5173")
@Tag(name = "Series", description = "Endpoints for fetching series")
public class SerieController {

    private static final Logger logger = LoggerFactory.getLogger(SerieController.class);
    private final SerieService serieService;

    @Autowired
    public SerieController(SerieService serieService) {
        this.serieService = serieService;
        logger.info("SerieController initialized with SerieService: {}", serieService.getClass().getName());
    }

    @Operation(summary = "Get series by type",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Series fetched successfully"),
                    @ApiResponse(responseCode = "404", description = "Series not found")
            })
    @GetMapping("/type/{type}")
    public ResponseEntity<?> getSeriesByType(
            @Parameter(description = "Type of the series to filter", example = "popular") @PathVariable @NonNull String type,
            @Parameter(description = "Maximum number of pages to retrieve", example = "3") @RequestParam(defaultValue = "3") int maxPages) {
        try {
            List<Serie> series = serieService.fetchSeries(type, maxPages);
            return ResponseEntity.ok(series);
        } catch (Exception e) {
            logger.error("Error fetching series by type '{}': {}", type, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Series by type not found");
        }
    }

    @Operation(summary = "Get series by genre",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Series fetched successfully"),
                    @ApiResponse(responseCode = "404", description = "Series not found")
            })
    @GetMapping("/genre/{genre}")
    public ResponseEntity<List<Serie>> getSeriesByGenre(
            @Parameter(description = "Genre to filter by", example = "Drama") @PathVariable @NonNull String genre) {
        try {
            return ResponseEntity.ok(serieService.getSeriesByGenre(genre));
        } catch (Exception e) {
            logger.error("Error fetching series by genre '{}': {}", genre, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @Operation(summary = "Check if series exists",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Series existence checked"),
                    @ApiResponse(responseCode = "404", description = "Series not found")
            })
    @GetMapping("/check/{id}")
    public ResponseEntity<Boolean> checkIfSerieExists(
            @Parameter(description = "ID of the series to check", example = "1") @PathVariable Long id) {
        try {
            return ResponseEntity.ok(serieService.existsById(id));
        } catch (Exception e) {
            logger.error("Error checking if series exists with ID '{}': {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(false);
        }
    }

    @Operation(summary = "Search series",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Series fetched successfully"),
                    @ApiResponse(responseCode = "404", description = "Series not found")
            })
    @GetMapping("/search")
    public ResponseEntity<Page<Serie>> searchSerie(
            @Parameter(description = "Title of the series") @RequestParam(required = false) String title,
            @Parameter(description = "Genres to filter by") @RequestParam(required = false) List<String> genres,
            @Parameter(description = "Filter series released after this date") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate releaseDateFrom,
            @Parameter(description = "Filter series released before this date") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate releaseDateTo,
            @Parameter(description = "Minimum rating") @RequestParam(required = false) Double ratingFrom,
            @Parameter(description = "Maximum rating") @RequestParam(required = false) Double ratingTo,
            @Parameter(description = "Minimum popularity score") @RequestParam(required = false) Double popularityFrom,
            @Parameter(description = "Maximum popularity score") @RequestParam(required = false) Double popularityTo,
            Pageable pageable) {
        try {
            Page<Serie> series = serieService.searchSeries(
                    title, genres, releaseDateFrom, releaseDateTo,
                    ratingFrom, ratingTo, popularityFrom, popularityTo, pageable);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(series);
        } catch (Exception e) {
            logger.error("Error searching series: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @Operation(summary = "Get best series by genre",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Best series fetched successfully"),
                    @ApiResponse(responseCode = "404", description = "Series not found")
            })
    @GetMapping("/best/{genre}")
    public ResponseEntity<Page<Serie>> getBestSeriesByGenres(
            @Parameter(description = "Genre to filter by", example = "Comedy") @PathVariable String genre,
            Pageable pageable) {
        try {
            Page<Serie> series = serieService.getBestSeriesByGenres(genre, pageable);
            return ResponseEntity.ok(series);
        } catch (Exception e) {
            logger.error("Error fetching best series by genre '{}': {}", genre, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @Operation(summary = "Get all series",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Series fetched successfully"),
                    @ApiResponse(responseCode = "404", description = "Series not found")
            })
    @GetMapping
    public ResponseEntity<Page<Serie>> getSeries(Pageable pageable) {
        try {
            Page<Serie> series = serieService.getSeries(pageable);
            return ResponseEntity.ok(series);
        } catch (Exception e) {
            logger.error("Error fetching series: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @Operation(summary = "Get most popular and top-rated series",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Most popular and top-rated series fetched successfully"),
                    @ApiResponse(responseCode = "404", description = "Series not found")
            })
    @GetMapping("/most-popular")
    public ResponseEntity<Page<Serie>> getMostPopularAndTopRated(Pageable pageable) {
        try {
            Page<Serie> series = serieService.getMostPopularAndTopRated(pageable);
            return ResponseEntity.ok(series);
        } catch (Exception e) {
            logger.error("Error fetching most popular and top-rated series: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @Operation(summary = "Get series by ID",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Series fetched successfully"),
                    @ApiResponse(responseCode = "404", description = "Series not found")
            })
    @GetMapping("/{id}")
    public ResponseEntity<Serie> getSerieById(
            @Parameter(description = "ID of the series to fetch", example = "1") @PathVariable Long id) {
        logger.info("Controller: getSerieById invoked with id: {}", id);
        try {
            return ResponseEntity.ok(serieService.getSeriesById(id));
        } catch (Exception e) {
            logger.error("Error fetching series by ID '{}': {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @Operation(summary = "Delete series by ID",
            responses = {
                    @ApiResponse(responseCode = "204", description = "Series deleted successfully"),
                    @ApiResponse(responseCode = "404", description = "Series not found")
            })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSerie(
            @Parameter(description = "ID of the series to delete", example = "1") @PathVariable Long id) {
        try {
            serieService.deleteSerie(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("Error deleting series with ID '{}': {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}
