package com.garmanaz.vidaria.DTO;

import lombok.Data;

@Data
public class WatchlistRequest {
    private Long userId;    // ID del usuario que agrega el elemento
    private Long movieId;   // ID de la película a agregar (si es una película)
    private Long serieId;   // ID de la serie a agregar (si es una serie)
}