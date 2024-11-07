package com.garmanaz.vidaria.entities;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;


@Entity
@Builder
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class Serie {

    @Id
    private Long id;
    @Column(length = 3000)
    private String title;
    @Column(length = 3000)
    private String description;

    @ManyToMany
    @JoinTable(name = "serie_genre",
            joinColumns = @JoinColumn(name = "serie_id"),
            inverseJoinColumns = @JoinColumn(name = "genre_id"))
    @JsonProperty("genre_id")
    @JsonManagedReference
    private List<Genre> genreID;

    @Column(length = 3000)
    private String creator;
    @Column(name = "release_date")
    @JsonProperty("release_date")
    private String releaseDate;
    @Column(length = 3000)
    private String poster;

    @Column(length = 3000)
    private String backdrop;
    private Double rating;
    private Double popularity;
    @Column(name = "number_of_seasons")
    private Long numberOfSeasons;
    @Column(name = "number_of_episodes")
    private Long numberOfEpisodes;

    @OneToMany(mappedBy = "serie", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<Season> seasons;


    @Column(length = 3000)
    private String trailer;
    private String status;

    public Serie(Long serieId, Object o, Object o1) {
    }
}

