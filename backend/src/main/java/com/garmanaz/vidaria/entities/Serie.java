package com.garmanaz.vidaria.entities;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;


@Entity
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Entity representing a serie")
public class Serie implements Serializable {

    @Id
    @Schema(description = "Unique identifier of the serie", example = "1")
    private Long id;

    @Schema(description = "Title of the serie", example = "Breaking Bad")
    @Column(length = 3000)
    private String title;

    @Schema(description = "Description of the serie", example = "A high school chemistry teacher turned meth producer")
    @Column(length = 3000)
    private String description;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "serie_genre",
            joinColumns = @JoinColumn(name = "serie_id"),
            inverseJoinColumns = @JoinColumn(name = "genre_id"))
    @JsonProperty("genre_id")
    @JsonManagedReference
    @Schema(description = "Genres of the serie", example = "[1, 2]")
    private List<Genre> genreID;

    @Column(length = 3000)
    @Schema(description = "Creator of the serie", example = "Vince Gilligan")
    private String creator;

    @Schema(description = "Release date of the serie", example = "2008-01-20")
    @Column(name = "release_date")
    @JsonProperty("release_date")
    private String releaseDate;

    @Schema(description = "URL to the poster image of the serie", example = "https://www.poster.com/poster.jpg")
    @Column(length = 3000)
    private String poster;

    @Column(length = 3000)
    @Schema(description = "URL to the backdrop image of the serie", example = "https://www.backdrop.com/backdrop.jpg")
    private String backdrop;
    @Schema(description = "Rating of the serie", example = "9.5")
    private Double rating;
    @Schema(description = "Popularity of the serie", example = "0.98")
    private Double popularity;
    @Schema(description = "Number of seasons of the serie", example = "5")
    @Column(name = "number_of_seasons")
    private Long numberOfSeasons;
    @Schema(description = "Number of episodes of the serie", example = "62")
    @Column(name = "number_of_episodes")
    private Long numberOfEpisodes;

    @Schema(description = "Seasons of the serie")
    @OneToMany(mappedBy = "serie", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<Season> seasons;


    @Schema(description = "Trailer of the serie", example = "https://www.youtube.com/watch?v=HhesaQXLuRY")
    @Column(length = 3000)
    private String trailer;

    @Schema(description = "Status of the serie", example = "Ended")
    private String status;

    public Serie(Long serieId, Object o, Object o1) {
    }

    public Serie(long l, String testSerie) {
    }
}

