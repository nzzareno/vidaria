package com.garmanaz.vidaria.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Builder
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class Season {

    @Id
    private Long id;
    @Column(name = "air_date")
    private String releaseDate;
    @Column(name = "episode_count")
    private Long episodeCount;
    private String name;
    private String poster;
    @Column(name = "season_number")
    private Long seasonNumber;
    @ManyToOne(fetch = FetchType.LAZY)
    @JsonBackReference
    private Serie serie;
}
