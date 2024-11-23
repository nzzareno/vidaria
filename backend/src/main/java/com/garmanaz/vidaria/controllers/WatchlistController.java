package com.garmanaz.vidaria.controllers;

import com.garmanaz.vidaria.DTO.WatchlistRequest;
import com.garmanaz.vidaria.entities.Watchlist;
import com.garmanaz.vidaria.services.WatchlistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/watchlist")
@Tag(name = "Watchlist", description = "Endpoints for managing watchlist")
public class WatchlistController {

    private static final Logger logger = LoggerFactory.getLogger(WatchlistController.class);
    private final WatchlistService watchlistService;

    @Autowired
    public WatchlistController(WatchlistService watchlistService) {
        this.watchlistService = watchlistService;
        logger.info("WatchlistController initialized");
    }

    @Operation(summary = "Check if item is in watchlist",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Item found in watchlist"),
                    @ApiResponse(responseCode = "400", description = "Invalid request")
            })
    @GetMapping("/check")
    public ResponseEntity<Map<String, Boolean>> checkIfInWatchlist(
            @Parameter(description = "User ID", example = "1") @RequestParam Long userId,
            @Parameter(description = "Movie ID to check", example = "10") @RequestParam(required = false) Long movieId,
            @Parameter(description = "Series ID to check", example = "15") @RequestParam(required = false) Long serieId) {
        try {
            logger.info("Checking if item is in watchlist: userId={}, movieId={}, serieId={}", userId, movieId, serieId);
            boolean exists = watchlistService.isInWatchlist(userId, movieId, serieId);
            Map<String, Boolean> response = new HashMap<>();
            response.put("exists", exists);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error checking if item is in watchlist: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("exists", false));
        }
    }

    @Operation(summary = "Add item to watchlist",
            responses = {
                    @ApiResponse(responseCode = "201", description = "Item added to watchlist"),
                    @ApiResponse(responseCode = "400", description = "Invalid request")
            })
    @PostMapping("/add")
    public ResponseEntity<?> addToWatchlist(
            @Parameter(description = "Request object containing user ID, movie ID, and series ID") @RequestBody WatchlistRequest request) {
        try {
            logger.info("Adding item to watchlist: {}", request);
            Watchlist item = watchlistService.addToWatchlist(request.getUserId(), request.getMovieId(), request.getSerieId());
            return ResponseEntity.status(HttpStatus.CREATED).body(item);
        } catch (Exception e) {
            logger.error("Error adding to watchlist: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Error adding to watchlist: " + e.getMessage()));
        }
    }

    @Operation(summary = "Get watchlist for user",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Watchlist fetched successfully"),
                    @ApiResponse(responseCode = "204", description = "No content in watchlist"),
                    @ApiResponse(responseCode = "400", description = "Invalid request")
            })
    @GetMapping("/{userId}")
    public ResponseEntity<?> getWatchlist(
            @Parameter(description = "User ID to fetch watchlist for", example = "1") @PathVariable Long userId) {
        try {
            logger.info("Fetching watchlist for userId={}", userId);
            List<Watchlist> watchlist = watchlistService.getWatchlistForUser(userId);
            if (watchlist.isEmpty()) {
                logger.info("Watchlist is empty for userId={}", userId);
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.ok(watchlist);
        } catch (Exception e) {
            logger.error("Error fetching watchlist for userId={}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Error fetching watchlist: " + e.getMessage()));
        }
    }

    @Operation(summary = "Delete item from watchlist",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Item removed from watchlist"),
                    @ApiResponse(responseCode = "400", description = "Invalid request")
            })
    @DeleteMapping
    public ResponseEntity<Map<String, String>> deleteFromWatchlist(
            @Parameter(description = "User ID", example = "1") @RequestParam Long userId,
            @Parameter(description = "Movie ID to remove", example = "10") @RequestParam(required = false) Long movieId,
            @Parameter(description = "Series ID to remove", example = "15") @RequestParam(required = false) Long serieId) {
        try {
            logger.info("Deleting item from watchlist: userId={}, movieId={}, serieId={}", userId, movieId, serieId);
            watchlistService.removeFromWatchlist(userId, movieId, serieId);
            return ResponseEntity.ok(Map.of("message", "Item removed from watchlist"));
        } catch (Exception e) {
            logger.error("Error deleting from watchlist: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Error deleting from watchlist: " + e.getMessage()));
        }
    }

    @Operation(summary = "Clear watchlist",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Watchlist cleared"),
                    @ApiResponse(responseCode = "400", description = "Invalid request")
            })
    @DeleteMapping("/clear/{userId}")
    public ResponseEntity<Map<String, String>> clearWatchlist(
            @Parameter(description = "User ID to clear watchlist for", example = "1") @PathVariable Long userId) {
        try {
            logger.info("Clearing watchlist for userId={}", userId);
            watchlistService.deleteAllFromWatchlist(userId);
            return ResponseEntity.ok(Map.of("message", "Watchlist cleared"));
        } catch (Exception e) {
            logger.error("Error clearing watchlist for userId={}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Error clearing watchlist: " + e.getMessage()));
        }
    }
}
