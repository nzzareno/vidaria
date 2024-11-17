package com.garmanaz.vidaria.repositories;

import com.garmanaz.vidaria.entities.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
public class WatchlistRepositoryTest {

    @Autowired
    private WatchlistRepository watchlistRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private SerieRepository serieRepository;

    private AppUser user;
    private Movie movie;
    private Serie serie;

    @BeforeEach
    public void setUp() {
        user = new AppUser();
        user.setUsername("testuser");
        user.setPassword("password");
        user = userRepository.save(user);

        Category category = new Category();
        category.setName("Popular");
        categoryRepository.save(category);

        movie = new Movie();
        movie.setId(1L); // Asigna manualmente el ID
        movie.setTitle("Test Movie");
        movie.setCategory(category);
        movie = movieRepository.save(movie);

        serie = new Serie();
        serie.setId(1L); // Asigna manualmente el ID
        serie.setTitle("Test Series");
        serie = serieRepository.save(serie);


        Watchlist watchlist = new Watchlist();
        watchlist.setUser(user);
        watchlist.setMovie(movie);
        watchlistRepository.save(watchlist);
    }

    @Test
    public void testFindByUserId() {
        List<Watchlist> watchlistEntries = watchlistRepository.findByUserId(user.getId());
        assertEquals(1, watchlistEntries.size());
        assertEquals(movie.getId(), watchlistEntries.get(0).getMovie().getId());
    }

    @Test
    public void testExistsByUserIdAndMovieId() {
        assertTrue(watchlistRepository.existsByUserIdAndMovieId(user.getId(), movie.getId()));
        assertFalse(watchlistRepository.existsByUserIdAndMovieId(user.getId(), 999L));
    }

    @Test
    public void testExistsByUserIdAndSerieId() {
        assertFalse(watchlistRepository.existsByUserIdAndSerieId(user.getId(), serie.getId()));
        Watchlist serieWatchlist = new Watchlist();
        serieWatchlist.setUser(user);
        serieWatchlist.setSerie(serie);
        watchlistRepository.save(serieWatchlist);
        assertTrue(watchlistRepository.existsByUserIdAndSerieId(user.getId(), serie.getId()));
    }


    @Test
    public void testFindByUserIdAndMovieIdAndSerieId() {
        Optional<Watchlist> result = watchlistRepository.findByUserIdAndMovieIdAndSerieId(user.getId(), movie.getId(), null);
        assertTrue(result.isPresent());
        assertEquals(movie.getId(), result.get().getMovie().getId());
        assertNull(result.get().getSerie());
    }

    @Test
    public void testDeleteAllByUserId() {
        watchlistRepository.deleteAllByUserId(user.getId());
        assertTrue(watchlistRepository.findByUserId(user.getId()).isEmpty());
    }
}
