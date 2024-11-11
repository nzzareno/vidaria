package com.garmanaz.vidaria.services;

import com.garmanaz.vidaria.DTO.MovieResponse;
import com.garmanaz.vidaria.entities.Genre;
import com.garmanaz.vidaria.entities.Movie;
import com.garmanaz.vidaria.repositories.GenreRepository;
import com.garmanaz.vidaria.repositories.MovieRepository;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MovieCacheService {

    private final MovieRepository movieRepository;
    private final GenreRepository genreRepository;
    private final RestTemplate restTemplate;
    private static final String API_URL = "https://api.themoviedb.org/3";
    private final String API_KEY;

    @Autowired
    public MovieCacheService(MovieRepository movieRepository, GenreRepository genreRepository, RestTemplate restTemplate,
                             @Value("${tmdb.api.key}") String apiKey) {
        this.movieRepository = movieRepository;
        this.genreRepository = genreRepository;
        this.restTemplate = restTemplate;
        this.API_KEY = apiKey;
    }

    @Cacheable(value = "movies", key = "#id")
    @Transactional(readOnly = true)
    public Movie getMovie(Long id) {
        Movie movie = movieRepository.findById(id).orElse(null);
        if (movie != null) {
            Hibernate.initialize(movie.getGenres()); // Inicializa la relación de géneros
            Hibernate.initialize(movie.getCategory()); // Inicializa la relación de categoría si es lazy
        }
        return movie;
    }

    @Cacheable("genres")
    public List<Genre> getGenres() {
        String url = API_URL + "/genre/movie/list?api_key=" + API_KEY;
        ResponseEntity<MovieResponse.GenreResponse> response = restTemplate.exchange(url, HttpMethod.GET, null, MovieResponse.GenreResponse.class);
        return Optional.ofNullable(response.getBody())
                .map(genreResponse -> genreResponse.getGenres().stream()
                        .map(genre -> new Genre(genre.getId(), genre.getName()))
                        .collect(Collectors.toList()))
                .orElse(Collections.emptyList());
    }
}
