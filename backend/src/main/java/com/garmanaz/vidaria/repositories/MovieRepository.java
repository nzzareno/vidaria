package com.garmanaz.vidaria.repositories;

import com.garmanaz.vidaria.entities.Movie;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Long> {

    // Método para buscar una película con carga ansiosa de genres y category
    @EntityGraph(attributePaths = {"genres", "category"})
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
    Page<Movie> searchMovies(
            @Param("title") String title,
            @Param("genres") List<String> genres,
            @Param("categories") List<String> categories,
            @Param("releaseDateFrom") LocalDate releaseDateFrom,
            @Param("releaseDateTo") LocalDate releaseDateTo,
            @Param("ratingFrom") Double ratingFrom,
            @Param("ratingTo") Double ratingTo,
            @Param("popularityFrom") Double popularityFrom,
            @Param("popularityTo") Double popularityTo,
            Pageable pageable
    );

    // Método para buscar películas por categoría con carga ansiosa
    @EntityGraph(attributePaths = {"genres", "category"})
    @Query("SELECT m FROM Movie m LEFT JOIN m.category c WHERE LOWER(c.name) = LOWER(:categoryName)")
    Page<Movie> findMoviesByCategory(@Param("categoryName") String categoryName, Pageable pageable);

    // Método para buscar películas por título y géneros con carga ansiosa
    @EntityGraph(attributePaths = {"genres", "category"})
    @Query("SELECT m FROM Movie m LEFT JOIN m.genres g WHERE LOWER(m.title) LIKE %:title% AND LOWER(g.name) IN :genres")
    Page<Movie> findMovieByTitleAndGenres(@Param("title") String title, @Param("genres") List<String> genres, Pageable pageable);

    // Obtener las mejores películas por género con carga ansiosa
    @EntityGraph(attributePaths = {"genres", "category"})
    @Query("SELECT m FROM Movie m LEFT JOIN m.genres g WHERE LOWER(g.name) = LOWER(:genre) ORDER BY m.rating DESC")
    Page<Movie> getBestMoviesByGenres(@Param("genre") String genre, Pageable pageable);

    // Buscar películas por lista de géneros con carga ansiosa
    @EntityGraph(attributePaths = {"genres", "category"})
    @Query("SELECT m FROM Movie m LEFT JOIN m.genres g WHERE LOWER(g.name) IN :genres ORDER BY m.rating DESC")
    List<Movie> findByGenresIn(@Param("genres") List<String> genres);
}
