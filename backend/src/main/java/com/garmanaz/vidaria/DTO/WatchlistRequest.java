package com.garmanaz.vidaria.DTO;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Request object for adding an item to the watchlist")
public class WatchlistRequest {

    @Schema(description = "ID of the user adding the item", example = "1")
    private Long userId;    // ID del usuario que agrega el elemento

    @Schema(description = "ID of the movie to add (if the item is a movie)", example = "10")
    private Long movieId;   // ID de la película a agregar (si es una película)

    @Schema(description = "ID of the series to add (if the item is a series)", example = "15")
    private Long serieId;   // ID de la serie a agregar (si es una serie)
}
