package com.garmanaz.vidaria.repositories;

import com.garmanaz.vidaria.entities.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import javax.swing.text.html.Option;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<AppUser, Long> {

    @Query("SELECT u FROM AppUser u WHERE u.username = ?1")
    Optional<AppUser> findByUsername(String username);

    @Query("SELECT u FROM AppUser u WHERE u.resetToken = :token AND u.resetTokenExpiration > CURRENT_TIMESTAMP")
    Optional<AppUser> findByResetToken(@Param("token") String token);

    @Query("SELECT u FROM AppUser u WHERE u.email = ?1")
    Optional<AppUser> findByEmail(String email);
}
