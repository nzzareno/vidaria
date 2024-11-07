package com.garmanaz.vidaria.controllers;

import com.garmanaz.vidaria.DTO.WatchlistRequest;
import com.garmanaz.vidaria.entities.Watchlist;
import com.garmanaz.vidaria.services.WatchlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/watchlist")
public class WatchlistController {

    private final WatchlistService watchlistService;

    @Autowired
    public WatchlistController(WatchlistService watchlistService) {
        this.watchlistService = watchlistService;
    }

    @GetMapping("/check")
    public ResponseEntity<Map<String, Boolean>> checkIfInWatchlist(
            @RequestParam Long userId,
            @RequestParam(required = false) Long movieId,
            @RequestParam(required = false) Long serieId) {
        boolean exists = watchlistService.isInWatchlist(userId, movieId, serieId);
        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", exists);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/add")
    public ResponseEntity<?> addToWatchlist(@RequestBody WatchlistRequest request) {
        try {
            Watchlist item = watchlistService.addToWatchlist(request.getUserId(), request.getMovieId(), request.getSerieId());
            return ResponseEntity.ok(item);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error adding to watchlist: " + e.getMessage());
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<Watchlist>> getWatchlist(@PathVariable Long userId) {
        List<Watchlist> watchlist = watchlistService.getWatchlistForUser(userId);
        if (watchlist.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(watchlist);
    }

    @DeleteMapping
    public ResponseEntity<Map<String, String>> deleteFromWatchlist(
            @RequestParam Long userId,
            @RequestParam(required = false) Long movieId,
            @RequestParam(required = false) Long serieId) {
        try {
            watchlistService.removeFromWatchlist(userId, movieId, serieId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Item removed from watchlist");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Error deleting from watchlist: " + e.getMessage()));
        }
    }

    // remove all watchlist and dont use a service
    @DeleteMapping("/clear/{userId}")
    public ResponseEntity<Map<String, String>> clearWatchlist(@PathVariable Long userId) {
        try {
            watchlistService.deleteAllFromWatchlist(userId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Watchlist cleared");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Error clearing watchlist: " + e.getMessage()));
        }
    }


}
