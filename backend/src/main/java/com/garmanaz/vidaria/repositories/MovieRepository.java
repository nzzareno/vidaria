package com.garmanaz.vidaria.repositories;

import com.garmanaz.vidaria.entities.Movie;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Long> {


    @Query("SELECT m FROM Movie m LEFT JOIN m.genres g LEFT JOIN m.category c " +
            "WHERE (:title IS NULL OR LOWER(m.title) LIKE %:title%) " +
            "AND (:genres IS NULL OR LOWER(g.name) IN :genres) " +
            "AND (:categories IS NULL OR LOWER(c.name) IN :categories) " +
            "AND (:releaseDateFrom IS NULL OR m.releaseDate >= :releaseDateFrom) " +
            "AND (:releaseDateTo IS NULL OR m.releaseDate <= :releaseDateTo) " +
            "AND (:ratingFrom IS NULL OR m.rating >= :ratingFrom) " +
            "AND (:ratingTo IS NULL OR m.rating <= :ratingTo) " +
            "AND (:popularityFrom IS NULL OR m.popularity >= :popularityFrom) " +
            "AND (:popularityTo IS NULL OR m.popularity <= :popularityTo) " +
            "ORDER BY m.rating DESC")
    Page<Movie> searchMovies(String title, List<String> genres, List<String> categories,
                             LocalDate releaseDateFrom, LocalDate releaseDateTo,
                             Double ratingFrom, Double ratingTo,
                             Double popularityFrom, Double popularityTo,
                             Pageable pageable);


    @Query("SELECT m FROM Movie m LEFT JOIN m.category c WHERE LOWER(c.name) = LOWER(:categoryName)")
    Page<Movie> findMoviesByCategory(@Param("categoryName") String categoryName, Pageable pageable);


    // query for findMovieByTitleAndGenres
    @Query("SELECT m FROM Movie m LEFT JOIN m.genres g WHERE LOWER(m.title) LIKE %:title% AND LOWER(g.name) IN :genres")
    Page<Movie> findMovieByTitleAndGenres(String title, List<String> genres, Pageable pageable);


    //GET BEST MOVIES BY GENRES QUERY MAYUS AND MINUS!
    @Query("SELECT m FROM Movie m LEFT JOIN m.genres g WHERE LOWER(g.name) = LOWER(:genre) ORDER BY m.rating DESC")
    Page<Movie> getBestMoviesByGenres(@Param("genre") String genre, Pageable pageable);


    @Query("SELECT m FROM Movie m LEFT JOIN m.genres g WHERE LOWER(g.name) IN :genres ORDER BY m.rating DESC")
    List<Movie> findByGenresIn(List<String> genres);
}

