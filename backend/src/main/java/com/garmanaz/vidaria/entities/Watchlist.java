package com.garmanaz.vidaria.entities;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Schema(description = "Entity representing a watchlist")
public class Watchlist implements Serializable {

    @Schema(description = "Unique identifier of the watchlist", example = "1")
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Schema(description = "User that added the movie or serie to the watchlist")
    @ManyToOne
    private AppUser user;

    @Schema(description = "Movie added to the watchlist")
    @ManyToOne
    private Movie movie;

    @Schema(description = "Serie added to the watchlist")
    @ManyToOne
    private Serie serie;

    @Schema(description = "Date and time when the movie or serie was added to the watchlist")
    private LocalDateTime addedAt;
}
