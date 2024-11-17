package com.garmanaz.vidaria.services;

import com.garmanaz.vidaria.DTO.MovieResponse;
import com.garmanaz.vidaria.DTO.SerieResponse;
import com.garmanaz.vidaria.entities.AppUser;
import com.garmanaz.vidaria.entities.Movie;
import com.garmanaz.vidaria.entities.Serie;
import com.garmanaz.vidaria.entities.Watchlist;
import com.garmanaz.vidaria.repositories.MovieRepository;
import com.garmanaz.vidaria.repositories.SerieRepository;
import com.garmanaz.vidaria.repositories.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class WatchlistServiceTest {

    @Mock
    private WatchlistRepository watchlistRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private MovieRepository movieRepository;

    @Mock
    private SerieRepository serieRepository;

    @Mock
    private RestTemplate restTemplate;

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private WatchlistService watchlistService;


    private AppUser user;
    private Movie movie;
    private Serie serie;

    @BeforeEach
    public void setUp() {
        user = new AppUser();
        user.setId(1L);
        movie = new Movie();
        movie.setId(100L);
        serie = new Serie();
        serie.setId(200L);
    }


    @Test
    public void testIsInWatchlist_withMovieId() {
        when(watchlistRepository.existsByUserIdAndMovieId(user.getId(), movie.getId())).thenReturn(true);

        boolean result = watchlistService.isInWatchlist(user.getId(), movie.getId(), null);

        assertTrue(result);
        verify(watchlistRepository).existsByUserIdAndMovieId(user.getId(), movie.getId());
        verify(watchlistRepository, never()).existsByUserIdAndSerieId(anyLong(), anyLong());
    }

    @Test
    public void testIsInWatchlist_withSerieId() {
        when(watchlistRepository.existsByUserIdAndSerieId(user.getId(), serie.getId())).thenReturn(true);

        boolean result = watchlistService.isInWatchlist(user.getId(), null, serie.getId());

        assertTrue(result);
        verify(watchlistRepository).existsByUserIdAndSerieId(user.getId(), serie.getId());
        verify(watchlistRepository, never()).existsByUserIdAndMovieId(anyLong(), anyLong());
    }

    @Test
    public void testAddToWatchlist_withMovieId() {
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(movieRepository.findById(movie.getId())).thenReturn(Optional.of(movie));

        Watchlist watchlist = new Watchlist();
        watchlist.setUser(user);
        watchlist.setMovie(movie);

         when(watchlistRepository.save(any(Watchlist.class))).thenReturn(watchlist);

        Watchlist savedWatchlist = watchlistService.addToWatchlist(user.getId(), movie.getId(), null);

        assertNotNull(savedWatchlist);
        assertEquals(user, savedWatchlist.getUser());
        assertEquals(movie, savedWatchlist.getMovie());
        verify(watchlistRepository).save(any(Watchlist.class));
    }

    @Test
    public void testAddToWatchlist_withSerieId() {
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(serieRepository.findById(serie.getId())).thenReturn(Optional.of(serie));

        Watchlist watchlist = new Watchlist();
        watchlist.setUser(user);
        watchlist.setSerie(serie);

         when(watchlistRepository.save(any(Watchlist.class))).thenReturn(watchlist);

        Watchlist savedWatchlist = watchlistService.addToWatchlist(user.getId(), null, serie.getId());

        assertNotNull(savedWatchlist);
        assertEquals(user, savedWatchlist.getUser());
        assertEquals(serie, savedWatchlist.getSerie());
        verify(watchlistRepository).save(any(Watchlist.class));
    }

    @Test
    public void testFetchAndSaveMovie() {
        MovieResponse.MovieDetails movieDetails = new MovieResponse.MovieDetails();
        movieDetails.setId(movie.getId());
        movieDetails.setTitle("Test Movie");

        when(restTemplate.getForObject(anyString(), eq(MovieResponse.MovieDetails.class))).thenReturn(movieDetails);
        when(movieRepository.save(any(Movie.class))).thenReturn(movie);

        Movie fetchedMovie = watchlistService.fetchAndSaveMovie(movie.getId());

        assertNotNull(fetchedMovie);
        assertEquals(movie.getId(), fetchedMovie.getId());
        verify(movieRepository).save(any(Movie.class));
    }

    @Test
    public void testFetchAndSaveSerie() {
        SerieResponse.SerieDetails serieDetails = new SerieResponse.SerieDetails();
        serieDetails.setId(serie.getId());
        serieDetails.setName("Test Serie");

        when(restTemplate.getForObject(anyString(), eq(SerieResponse.SerieDetails.class))).thenReturn(serieDetails);
        when(serieRepository.save(any(Serie.class))).thenReturn(serie);

        Serie fetchedSerie = watchlistService.fetchAndSaveSerie(serie.getId());

        assertNotNull(fetchedSerie);
        assertEquals(serie.getId(), fetchedSerie.getId());
        verify(serieRepository).save(any(Serie.class));
    }

    @Test
    public void testGetWatchlistForUser() {
        List<Watchlist> watchlist = List.of(new Watchlist());
        when(watchlistRepository.findByUserId(user.getId())).thenReturn(watchlist);

        List<Watchlist> result = watchlistService.getWatchlistForUser(user.getId());

        assertEquals(watchlist.size(), result.size());
        verify(watchlistRepository).findByUserId(user.getId());
    }

    @Test
    public void testRemoveFromWatchlist_withMovieId() {
        Watchlist watchlistItem = new Watchlist();
        watchlistItem.setMovie(movie);
        when(watchlistRepository.findByUserIdAndMovieIdAndSerieId(user.getId(), movie.getId(), null)).thenReturn(Optional.of(watchlistItem));

        watchlistService.removeFromWatchlist(user.getId(), movie.getId(), null);

        verify(watchlistRepository).delete(watchlistItem);
    }

    @Test
    public void testRemoveFromWatchlist_withSerieId() {
        Watchlist watchlistItem = new Watchlist();
        watchlistItem.setSerie(serie);
        when(watchlistRepository.findByUserIdAndMovieIdAndSerieId(user.getId(), null, serie.getId())).thenReturn(Optional.of(watchlistItem));

        watchlistService.removeFromWatchlist(user.getId(), null, serie.getId());

        verify(watchlistRepository).delete(watchlistItem);
    }

    @Test
    public void testDeleteAllFromWatchlist() {
        watchlistService.deleteAllFromWatchlist(user.getId());

        verify(watchlistRepository).deleteAllByUserId(user.getId());
    }
}
