package com.garmanaz.vidaria.repositories;

import com.garmanaz.vidaria.entities.Category;
import com.garmanaz.vidaria.entities.Genre;
import com.garmanaz.vidaria.entities.Movie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.ActiveProfiles;
import java.time.LocalDate;
import java.util.List;
import static org.junit.jupiter.api.Assertions.assertEquals;

@DataJpaTest
@ActiveProfiles("test")
public class MovieRepositoryTest {

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private GenreRepository genreRepository;


    @BeforeEach
    public void setUp() {

        Category popularCat = new Category();
        popularCat.setName("Popular");
        categoryRepository.save(popularCat);

        Genre drama = Genre.builder().id(1L).name("drama").build();
        Genre romance = Genre.builder().id(2L).name("romance").build();
        Genre action = Genre.builder().id(3L).name("action").build();
        genreRepository.saveAll(List.of(drama, romance, action));

        Movie titanic = Movie.builder()
                .id(1L)
                .title("Titanic")
                .releaseDate(LocalDate.of(1997, 12, 19))
                .description("A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the luxurious, ill-fated R.M.S. Titanic.")
                .rating(7.8)
                .genres(List.of(drama, romance))
                .popularity(8.5)
                .duration(195L)
                .director("James Cameron")
                .category(popularCat)
                .build();

        Movie inception = Movie.builder()
                .id(2L)
                .title("Inception")
                .releaseDate(LocalDate.of(2010, 7, 16))
                .description("A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.")
                .rating(8.8)
                .genres(List.of(action, drama))
                .popularity(9.0)
                .duration(148L)
                .director("Christopher Nolan")
                .category(popularCat)
                .build();

        // Guarda las películas
        movieRepository.saveAll(List.of(titanic, inception));
    }

    @Test
    public void testSearchMovies() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Movie> movies = movieRepository.searchMovies(null, null, null, null, null, null, null, null, null, pageable);
        assertEquals(2, movies.getTotalElements());
    }

    @Test
    public void testFindMoviesByCategory() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Movie> movies = movieRepository.findMoviesByCategory("Popular", pageable);
        assertEquals(2, movies.getTotalElements());
    }

    @Test
    public void testFindMovieByTitleAndGenres() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Movie> movies = movieRepository.findMovieByTitleAndGenres("titanic", List.of("drama", "romance"), pageable);
        assertEquals(1, movies.getTotalElements());
    }

    @Test
    public void testGetBestMoviesByGenres() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Movie> movies = movieRepository.getBestMoviesByGenres("Drama", pageable);
        assertEquals(2, movies.getTotalElements());
    }

}
