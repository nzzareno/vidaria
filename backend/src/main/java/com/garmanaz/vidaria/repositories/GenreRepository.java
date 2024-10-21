package com.garmanaz.vidaria.repositories;

import com.garmanaz.vidaria.entities.Genre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GenreRepository extends JpaRepository<Genre, Long>, JpaSpecificationExecutor<Genre> {
    Optional<Genre> findById(long id);

    @Query("SELECT g FROM Genre g WHERE g.name = :name")
    Optional<Genre> findByName(String name);

    // get list of genres by name
    @Query("SELECT g FROM Genre g WHERE g.name IN :names")
    List<Genre> findByNames(List<String> names);
}
