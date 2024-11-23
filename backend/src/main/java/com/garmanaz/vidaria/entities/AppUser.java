package com.garmanaz.vidaria.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.io.Serializable;
import java.util.Date;

@Entity
@Builder(toBuilder = true)
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "app_user")
@Schema(description = "Entity representing an app user")
public class AppUser implements Serializable {

    @Schema(description = "Unique identifier of the user", example = "1")
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Schema(description = "Username of the user", example = "john_doe")
    @NotNull
    @Column(unique = true)
    private String username;

    @Schema(description = "Email of the user", example = "garmanaz@gmail.com")
    @Email // Valida que el email tenga un formato correcto
    @Column(unique = true)
    private String email;

    @Schema(description = "Password of the user", example = "password")
    @NonNull
    private String password;

    @Schema(description = "Role of the user", example = "USER")
    @Enumerated(EnumType.STRING)
    private Role role;

    @Schema(description = "Reset token for password recovery")
    private String resetToken;

    @Schema(description = "Expiration date of the reset token")
    private Date resetTokenExpiration;


}
