package com.garmanaz.vidaria.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;


@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Genre implements Serializable {

    @Id
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @JsonBackReference
    @ManyToMany(mappedBy = "genres")
    private List<Movie> movies = new ArrayList<>();

    @JsonBackReference
    @ManyToMany(mappedBy = "genreID")
    @JsonIgnore
    private List<Serie> series = new ArrayList<>();

    public Genre(long id, String name) {
        this.id = id;
        this.name = name;
    }


}