package com.garmanaz.vidaria.repositories;

import com.garmanaz.vidaria.entities.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;


public interface CategoryRepository extends JpaRepository<Category, Long> {

    @Query("SELECT c FROM Category c WHERE c.name = :name")
     Category findByName(String name);

    @Query("SELECT c FROM Category c WHERE c.name IN :names")
    List<Category> findByNames(List<String> names);


}
