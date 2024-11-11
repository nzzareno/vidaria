package com.garmanaz.vidaria.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.*;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Entity
@Builder
@Getter
@Setter
@ToString
@AllArgsConstructor
@Table(name = "app_user")
@NoArgsConstructor
public class AppUser implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NonNull
    @Column(unique = true)
    private String username;


    @Column(unique = true)
    private String email;

    @NonNull
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;


}
