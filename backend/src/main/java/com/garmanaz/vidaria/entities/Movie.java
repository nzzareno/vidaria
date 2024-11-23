package com.garmanaz.vidaria.entities;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import lombok.*;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Builder
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Entity representing a movie")
public class Movie implements Serializable {

    @Id
    @Schema(description = "Unique identifier of the movie", example = "1")
    private Long id;

    @Schema(description = "Title of the movie", example = "The Shawshank Redemption")
    @Column(length = 1000)
    private String title;

    @Schema(description = "Description of the movie", example = "Two imprisoned escaping from prison")
    @Column(length = 1000)
    private String description;

    @Schema(description = "Release date of the movie", example = "1994-10-14")
    @Column(name = "release_date")
    private LocalDate releaseDate;

    @Schema(description = "URL to the cover image of the movie", example = "https://www.cover.com/cover.jpg")
    @Column(length = 1000)
    private String cover;

    @Schema(description = "URL to the background image of the movie", example = "https://www.background.com/background.jpg")
    @Column(length = 1000)
    private String background;

    @Schema(description = "Director of the movie", example = "Frank Darabont")
    @Column(length = 1000)
    private String director;

    @Schema(description = "Duration of the movie in minutes", example = "142")
    @Min(0)
    private Long duration;

    @Schema(description = "Rating of the movie", example = "9.3")
    @DecimalMin(value = "0.0", inclusive = true)
    @DecimalMax(value = "10.0", inclusive = true)
    private Double rating;

    @Schema(description = "Popularity of the movie", example = "9.3")
    @DecimalMin(value = "0.0", inclusive = true)
    private Double popularity;

    @Schema(description = "Category of the movie")
    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    @JsonManagedReference
    private Category category;


    @Schema(description = "Genres of the movie")
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "movie_genre", joinColumns = @JoinColumn(name = "movie_id"), inverseJoinColumns = @JoinColumn(name = "genre_id"))
    @JsonManagedReference
    private List<Genre> genres = new ArrayList<>();

    @Schema(description = "Trailer of the movie", example = "https://www.youtube.com/watch?v=6hB3S9bIaco")
    private String trailer;

    public Movie(Long movieId, Object o, Object o1) {
    }
}