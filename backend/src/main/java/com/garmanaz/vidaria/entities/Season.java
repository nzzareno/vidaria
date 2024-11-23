package com.garmanaz.vidaria.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

@Entity
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Entity representing a season")
public class Season implements Serializable {

    @Schema(description = "Unique identifier of the season", example = "1")
    @Id
    private Long id;
    @Schema(description = "Title of the season", example = "Season 1")
    @Column(name = "air_date")
    private String releaseDate;
    @Column(name = "episode_count")
    @Schema(description = "Number of episodes in the season", example = "10")
    private Long episodeCount;
    @Schema(description = "Name of the season")
    private String name;
    @Schema(description = "URL to the poster image of the season", example = "https://www.poster.com/poster.jpg")
    private String poster;
    @Schema(description = "Season number", example = "1")
    @Column(name = "season_number")
    private Long seasonNumber;

    @Schema(description = "Serie to which the season belongs")
    @ManyToOne(fetch = FetchType.LAZY)
    @JsonBackReference
    private Serie serie;
}
