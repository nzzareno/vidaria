package com.garmanaz.vidaria.services;

import com.garmanaz.vidaria.DTO.MovieResponse;
import com.garmanaz.vidaria.DTO.SerieResponse;
import com.garmanaz.vidaria.entities.*;
import com.garmanaz.vidaria.repositories.*;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class WatchlistService {

    private final WatchlistRepository watchlistRepository;
    private final UserRepository userRepository;
    private final MovieRepository movieRepository;
    private final SerieRepository serieRepository;
    private final RestTemplate restTemplate;
    private final CategoryRepository categoryRepository;

    @Autowired
    public WatchlistService(
            WatchlistRepository watchlistRepository,
            UserRepository userRepository,
            MovieRepository movieRepository,
            SerieRepository serieRepository,
            RestTemplate restTemplate,
            CategoryRepository categoryRepository
    ) {
        this.watchlistRepository = watchlistRepository;
        this.userRepository = userRepository;
        this.movieRepository = movieRepository;
        this.serieRepository = serieRepository;
        this.restTemplate = restTemplate;
        this.categoryRepository = categoryRepository;
    }


    public boolean isInWatchlist(Long userId, Long movieId, Long serieId) {
        if (movieId != null) {
            return watchlistRepository.existsByUserIdAndMovieId(userId, movieId);
        } else if (serieId != null) {
            return watchlistRepository.existsByUserIdAndSerieId(userId, serieId);
        }
        return false;
    }

    @Transactional
    public Watchlist addToWatchlist(Long userId, Long movieId, Long serieId) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Watchlist watchlist = new Watchlist();
        watchlist.setUser(user);
        watchlist.setAddedAt(LocalDateTime.now());

        if (movieId != null) {
            Movie movie = movieRepository.findById(movieId).orElseGet(() -> fetchAndSaveMovie(movieId));
            watchlist.setMovie(movie);
        } else if (serieId != null) {
            Serie serie = serieRepository.findById(serieId).orElseGet(() -> fetchAndSaveSerie(serieId));
            watchlist.setSerie(serie);
        }

        return watchlistRepository.save(watchlist);
    }

    public Movie fetchAndSaveMovie(Long movieId) {
        String url = "https://api.themoviedb.org/3/movie/" + movieId + "?api_key=b519a2cc32b8654d1e683c286b4e8f4e";
        MovieResponse.MovieDetails movieResponse = restTemplate.getForObject(url, MovieResponse.MovieDetails.class);
        if (movieResponse != null) {
            Movie movie = new Movie();
            movie.setId(movieResponse.getId());
            movie.setTitle(movieResponse.getTitle());
            movie.setDescription(movieResponse.getOverview());
            movie.setReleaseDate(movieResponse.getReleaseDate() != null ? movieResponse.getReleaseDate() : LocalDate.now());
            movie.setCover(movieResponse.getPosterPath());
            movie.setBackground(movieResponse.getBackdropPath());
            movie.setRating(movieResponse.getVoteAverage());
            movie.setPopularity(movieResponse.getPopularity());

            // Asignar categoría predeterminada si no tiene categoría
            Category defaultCategory = categoryRepository.findByName("Uncategorized");
            if (defaultCategory == null) {
                defaultCategory = new Category("Uncategorized");
                categoryRepository.save(defaultCategory);
            }
            movie.setCategory(defaultCategory);

            return movieRepository.save(movie);
        }
        throw new RuntimeException("Movie not found in external API");
    }

    public Serie fetchAndSaveSerie(Long serieId) {
        String url = "https://api.themoviedb.org/3/tv/" + serieId + "?api_key=b519a2cc32b8654d1e683c286b4e8f4e";
        SerieResponse.SerieDetails serieResponse = restTemplate.getForObject(url, SerieResponse.SerieDetails.class);
        if (serieResponse != null) {
            Serie serie = new Serie();
            serie.setId(serieResponse.getId());
            serie.setTitle(serieResponse.getName());
            serie.setDescription(serieResponse.getOverview());
            serie.setReleaseDate(serieResponse.getFirstAirDate() != null ? serieResponse.getFirstAirDate().toString() : LocalDate.now().toString());
            serie.setPoster(serieResponse.getPosterPath());
            serie.setBackdrop(serieResponse.getBackdropPath());
            serie.setRating(serieResponse.getVoteAverage());
            serie.setPopularity(serieResponse.getPopularity());
            serie.setNumberOfSeasons(serieResponse.getNumberOfSeasons());
            serie.setNumberOfEpisodes(serieResponse.getNumberOfEpisodes());

            return serieRepository.save(serie);
        }
        throw new RuntimeException("Serie not found in external API");
    }


    public List<Watchlist> getWatchlistForUser(Long userId) {
        return watchlistRepository.findByUserId(userId);
    }


    public void removeFromWatchlist(Long userId, Long movieId, Long serieId) {
        Optional<Watchlist> watchlistItem = watchlistRepository.findByUserIdAndMovieIdAndSerieId(userId, movieId, serieId);

        if (watchlistItem.isPresent()) {
            watchlistRepository.delete(watchlistItem.get());
        } else {
            throw new EntityNotFoundException("Item not found in watchlist");
        }
    }


    @Transactional
    public void deleteAllFromWatchlist(Long userId) {
        watchlistRepository.deleteAllByUserId(userId);
    }

}
