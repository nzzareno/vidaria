package com.garmanaz.vidaria.repositories;

import com.garmanaz.vidaria.entities.Watchlist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WatchlistRepository extends JpaRepository<Watchlist, Long> {

    List<Watchlist> findByUserId(Long userId);

    boolean existsByUserIdAndMovieId(Long userId, Long movieId);

    boolean existsByUserIdAndSerieId(Long userId, Long serieId);

    Optional<Watchlist> findByUserIdAndMovieIdAndSerieId(Long userId, Long movieId, Long serieId);

    void deleteAllByUserId(Long userId);
}
