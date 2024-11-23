package com.garmanaz.vidaria.entities;


import com.fasterxml.jackson.annotation.JsonBackReference;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@ToString(exclude = "movies")
@Schema(description = "Entity representing a category")
public class Category implements Serializable {

    @Schema(description = "Unique identifier of the category", example = "1")
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Schema(description = "Name of the category", example = "Action")
    @Column(nullable = false, unique = true, name = "name")
    private String name;

    @Schema(description = "Movies that belong to the category")
    @OneToMany(mappedBy = "category")
    @JsonBackReference
    private List<Movie> movies;

    public Category(String name) {
        this.name = name;
    }
}
