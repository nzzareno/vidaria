package com.garmanaz.vidaria.repositories;

import com.garmanaz.vidaria.entities.Category;
import com.garmanaz.vidaria.entities.Genre;
import com.garmanaz.vidaria.entities.Serie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

@DataJpaTest
@ActiveProfiles("test")
public class SerieRepositoryTest {

    @Autowired
    private SerieRepository serieRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private GenreRepository genreRepository;


    @BeforeEach
    public void setUp() {
        Category category = new Category("Popular");
        categoryRepository.save(category);
        Genre action = new Genre(1L, "Action");
        Genre comedy = new Genre(2L, "Comedy");
        genreRepository.save(action);
        genreRepository.save(comedy);
        Serie seinfeld = Serie.builder()
                .id(1L)
                .title("Seinfeld")
                .description("A show about nothing")
                .genreID(List.of(comedy))
                .creator("Larry David")
                .releaseDate("1989-07-05")
                .poster("https://www.imdb.com/title/tt0098904/mediaviewer/rm4283152384/")
                .backdrop("https://www.imdb.com/title/tt0098904/mediaviewer/rm4283152384/")
                .rating(8.8)
                .popularity(100.0)
                .numberOfSeasons(9L)
                .numberOfEpisodes(180L)
                .trailer("https://www.youtube.com/watch?v=ZS0d6CF4bD4")
                .build();

        Serie lost = Serie.builder()
                .id(2L)
                .title("Lost")
                .description("A plane crashes on a mysterious island")
                .genreID(List.of(action))
                .creator("J.J. Abrams")
                .releaseDate("2004-09-22")
                .poster("https://www.imdb.com/title/tt0411008/mediaviewer/rm4283152384/")
                .backdrop("https://www.imdb.com/title/tt0411008/mediaviewer/rm4283152384/")
                .rating(8.3)
                .popularity(90.0)
                .numberOfSeasons(6L)
                .numberOfEpisodes(121L)
                .trailer("https://www.youtube.com/watch?v=KTu8iDynwNc")
                .build();

        serieRepository.saveAll(List.of(seinfeld, lost));
    }

    @Test
    public void testGetBestSeriesByGenres() {
        List<Serie> series = serieRepository.getBestSeriesByGenres("action", Pageable.unpaged()).getContent();
        assertEquals(2, series.size());
        assertEquals("Seinfeld", series.get(0).getTitle());
        assertEquals("Lost", series.get(1).getTitle());
    }

    @Test
    public void testGetMostPopularAndTopRated() {
        List<Serie> series = serieRepository.getMostPopularAndTopRated(Pageable.unpaged()).getContent();
        assertEquals(2, series.size());
        assertEquals("Seinfeld", series.get(0).getTitle());
        assertEquals("Lost", series.get(1).getTitle());
    }

    @Test
    public void testSearchSeries() {
        List<Serie> series = serieRepository.searchSeries("Seinfeld", List.of("comedy"), null, null, null, null, null, null, Pageable.unpaged()).getContent();
        assertEquals(1, series.size());
        assertEquals("Seinfeld", series.get(0).getTitle());
    }
}
