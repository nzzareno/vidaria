package com.garmanaz.vidaria.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.util.*;


@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Entity representing a genre")
public class Genre implements Serializable {

    @Id
    @Schema(description = "Unique identifier of the genre", example = "1")
    private Long id;

    @Column(nullable = false, unique = true)
    @Schema(description = "Name of the genre", example = "Action")
    private String name;

    @JsonBackReference
    @ManyToMany(mappedBy = "genres", fetch = FetchType.LAZY)
    @Schema(description = "Movies that belong to the genre")
    private List<Movie> movies = new ArrayList<>();

    @Schema(description = "Series that belong to the genre")
    @JsonBackReference
    @ManyToMany(mappedBy = "genreID", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Serie> series = new ArrayList<>();


    public Genre(long id, String name) {
        this.id = id;
        this.name = name;
    }


}