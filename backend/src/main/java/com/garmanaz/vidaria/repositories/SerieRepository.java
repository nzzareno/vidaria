package com.garmanaz.vidaria.repositories;

import com.garmanaz.vidaria.entities.Serie;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SerieRepository extends JpaRepository<Serie, Long>, JpaSpecificationExecutor<Serie> {

    // query for get best series for genre
    @Query("SELECT s FROM Serie s LEFT JOIN s.genreID g WHERE LOWER(g.name) = LOWER(:genre) ORDER BY s.rating DESC")
    Page<Serie> getBestSeriesByGenres(@Param("genre") String genre, Pageable pageable);


    @Query("SELECT s FROM Serie s ORDER BY s.popularity DESC, s.rating DESC")
    Page<Serie> getMostPopularAndTopRated(Pageable pageable);


    @Query("SELECT s FROM Serie s LEFT JOIN s.genreID g " +
            "WHERE (:title IS NULL OR LOWER(s.title) LIKE CONCAT('%', LOWER(:title), '%')) " +
            "AND (:genres IS NULL OR LOWER(g.name) IN (:genres)) " +
            "AND (:releaseDateFrom IS NULL OR s.releaseDate >= :releaseDateFrom) " +
            "AND (:releaseDateTo IS NULL OR s.releaseDate <= :releaseDateTo) " +
            "AND (:ratingFrom IS NULL OR s.rating >= :ratingFrom) " +
            "AND (:ratingTo IS NULL OR s.rating <= :ratingTo) " +
            "AND (:popularityFrom IS NULL OR s.popularity >= :popularityFrom) " +
            "AND (:popularityTo IS NULL OR s.popularity <= :popularityTo) " +
            "ORDER BY s.popularity DESC")
    Page<Serie> searchSeries(@Param("title") String title,
                             @Param("genres") List<String> genres,
                             @Param("releaseDateFrom") LocalDate releaseDateFrom,
                             @Param("releaseDateTo") LocalDate releaseDateTo,
                             @Param("ratingFrom") Double ratingFrom,
                             @Param("ratingTo") Double ratingTo,
                             @Param("popularityFrom") Double popularityFrom,
                             @Param("popularityTo") Double popularityTo,
                             Pageable pageable);


}
