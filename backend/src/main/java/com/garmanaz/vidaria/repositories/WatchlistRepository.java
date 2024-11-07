package com.garmanaz.vidaria.repositories;

import com.garmanaz.vidaria.entities.Watchlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface WatchlistRepository extends JpaRepository<Watchlist, Long> {

    List<Watchlist> findByUserId(Long userId);

    //deleteByUserIdAndMovieIdAndSerieId
    void deleteByUserIdAndMovieIdAndSerieId(Long userId, Long movieId, Long serieId);


    boolean existsByUserIdAndMovieId(Long userId, Long movieId);

    boolean existsByUserIdAndSerieId(Long userId, Long serieId);


    @Query("SELECT w FROM Watchlist w WHERE w.user.id = :userId AND w.movie.id = :movieId")
    void deleteByUserIdAndMovieId(Long userId, Long movieId);

    @Query("SELECT w FROM Watchlist w WHERE w.user.id = :userId AND w.serie.id = :serieId")
    void deleteByUserIdAndSerieId(Long userId, Long serieId);

    //findByUserIdAndMovieIdAndSerieId
    Optional<Watchlist> findByUserIdAndMovieIdAndSerieId(Long userId, Long movieId, Long serieId);

    void deleteByUserId(Long userId);

    void deleteAllByUserId(Long userId);

}
