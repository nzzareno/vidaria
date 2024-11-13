package com.garmanaz.vidaria.entities;


import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Builder
@Entity
public class Category implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, name = "name")
    private String name;

    @OneToMany(mappedBy = "category")
    @JsonBackReference
    private List<Movie> movies;

    public Category(String name) {
        this.name = name;
    }
}
