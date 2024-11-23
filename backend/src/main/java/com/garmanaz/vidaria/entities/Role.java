package com.garmanaz.vidaria.entities;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Enum representing the role of a user", example = "USER")
public enum Role {
    USER,
    MODERATOR,
    ADMIN
}
