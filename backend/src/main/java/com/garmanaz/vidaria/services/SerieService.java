package com.garmanaz.vidaria.services;

import com.garmanaz.vidaria.DTO.SerieResponse;
import com.garmanaz.vidaria.entities.Genre;
import com.garmanaz.vidaria.entities.Season;
import com.garmanaz.vidaria.entities.Serie;
import com.garmanaz.vidaria.repositories.GenreRepository;
import com.garmanaz.vidaria.repositories.SerieRepository;
import lombok.Setter;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@Transactional
public class SerieService {
    private static final String API_URL = "https://api.themoviedb.org/3";
    private final GenreRepository genreRepository;
    private final RestTemplate restTemplate;
    private final SerieRepository serieRepository;
    private final RedisTemplate<String, Serie> redisTemplate;

    @Autowired
    public SerieService(GenreRepository genreRepository, RestTemplate restTemplate, SerieRepository serieRepository, RedisTemplate<String, Serie> redisTemplate) {
        this.genreRepository = genreRepository;
        this.restTemplate = restTemplate;
        this.serieRepository = serieRepository;
        this.redisTemplate = redisTemplate;
    }


    @Setter
    @Value("${tmdb.api.key}")
    private String API_KEY;

    @Setter
    @Value("${tmdb.api.url}")
    private String apiUrl;


    public void preCacheSeries() {
        try {
            List<Serie> series = serieRepository.findAll();
            for (Serie serie : series) {
                String cacheKey = "serie:" + serie.getId();
                redisTemplate.opsForValue().set(cacheKey, serie, 1, TimeUnit.DAYS); // Guarda el objeto completo
                System.out.println("Saved to Redis: " + cacheKey + " -> " + serie);
            }
        } catch (Exception e) {
            System.err.println("Failed to precache series in Redis: " + e.getMessage());

        }
    }

    @Cacheable(value = "genres")
    public List<Genre> getGenres() {
        String url = apiUrl + "/genre/tv/list?api_key=" + API_KEY;
        ResponseEntity<SerieResponse.SerieDetails.GenreResponse> response = restTemplate.getForEntity(url, SerieResponse.SerieDetails.GenreResponse.class);
        SerieResponse.SerieDetails.GenreResponse genreResponse = response.getBody();

        return (genreResponse != null)
                ? genreResponse.getGenres().stream()
                .map(genre -> new Genre(genre.getId(), genre.getName()))
                .toList()
                : Collections.emptyList();
    }

    @Transactional(readOnly = true)
    public Serie getSerieDetails(Long id) {
        String cacheKey = "serie:" + id;
        Serie serie = redisTemplate.opsForValue().get(cacheKey); // Obtén el objeto desde Redis

        if (serie == null) { // Si no está en Redis, búscalo en la base de datos o API
            serie = serieRepository.findById(id).orElseGet(() -> mapToSeries(fetchSerieFromApi(id)));
            if (serie != null) {
                Hibernate.initialize(serie.getGenreID());
                Hibernate.initialize(serie.getSeasons());
                redisTemplate.opsForValue().set(cacheKey, serie, 1, TimeUnit.DAYS); // Cachea el objeto completo
                System.out.println("Cached in Redis: " + cacheKey);
            }
        } else {
            System.out.println("Loaded from Redis: " + cacheKey);
        }

        return serie;
    }

    private SerieResponse.SerieDetails fetchSerieFromApi(Long id) {
        String url = API_URL + "/tv/" + id + "?api_key=" + API_KEY;

        ResponseEntity<SerieResponse.SerieDetails> response = restTemplate.getForEntity(url, SerieResponse.SerieDetails.class);
        return response.getBody();
    }

    public Page<Serie> getMostPopularAndTopRated(Pageable pageable) {
        return serieRepository.getMostPopularAndTopRated(pageable);
    }

    public Page<Serie> getBestSeriesByGenres(String genre, Pageable pageable) {
        return serieRepository.getBestSeriesByGenres(genre, pageable);
    }

    @Transactional
    public Serie mapToSeriesFromResult(SerieResponse.Result result) {
        if (result == null || result.getId() == null) {
            return null;
        }

        Serie serie = getSerieDetails(result.getId());
        if (serie != null) {
            serie.setTitle(result.getName());
            serie.setDescription(result.getOverview());
            serie.setTrailer(getTrailer(result.getId()));
            serie.setPopularity(result.getPopularity());
        }
        return serie;
    }

    public String getTrailer(Long id) {
        String url = API_URL + "/tv/" + id + "/videos?api_key=" + API_KEY;
        ResponseEntity<SerieResponse.SerieDetails.SerieTrailer> response = restTemplate.getForEntity(url, SerieResponse.SerieDetails.SerieTrailer.class);
        SerieResponse.SerieDetails.SerieTrailer serieTrailer = response.getBody();
        if (serieTrailer != null && !serieTrailer.getResults().isEmpty()) {
            for (SerieResponse.SerieDetails.SerieTrailerResult result : serieTrailer.getResults()) {
                if ("Trailer".equals(result.getType())) {
                    return "https://www.youtube.com/watch?v=" + result.getKey();
                }
            }
        }
        return null;
    }

    private Serie mapToSeries(SerieResponse.SerieDetails serieDetails) {
        Serie serie = Serie.builder()
                .id(serieDetails.getId())
                .title(serieDetails.getName())
                .description(serieDetails.getOverview())
                .genreID(serieDetails.getGenres().stream()
                        .map(genre -> genreRepository.findById(genre.getId()).orElseGet(() -> genreRepository.save(new Genre(genre.getId(), genre.getName()))))
                        .collect(Collectors.toList()))
                .creator(serieDetails.getCreatedBy() != null && !serieDetails.getCreatedBy().isEmpty() ? serieDetails.getCreatedBy().stream().findFirst().map(SerieResponse.SerieDetails.CreatedBy::getName).orElse("Unknown") : "Unknown")
                .releaseDate(serieDetails.getFirstAirDate() != null ? serieDetails.getFirstAirDate().toString() : null)
                .poster("https://image.tmdb.org/t/p/w500" + serieDetails.getPosterPath())
                .backdrop("https://image.tmdb.org/t/p/w500" + serieDetails.getBackdropPath())
                .rating(serieDetails.getVoteAverage())
                .popularity(serieDetails.getPopularity())
                .numberOfSeasons(serieDetails.getNumberOfSeasons())
                .numberOfEpisodes(serieDetails.getNumberOfEpisodes())
                .trailer(getTrailer(serieDetails.getId()))
                .status(serieDetails.getStatus())
                .build();

        if (serieDetails.getSeasons() != null) {
            List<Season> seasons = serieDetails.getSeasons().stream().map(season -> Season.builder()
                    .id(season.getId())
                    .releaseDate(season.getAirDate() != null ? season.getAirDate().toString() : null)
                    .episodeCount(season.getEpisodeCount())
                    .name(season.getName())
                    .poster("https://image.tmdb.org/t/p/w500" + season.getPosterPath())
                    .seasonNumber(season.getSeasonNumber())
                    .serie(serie)
                    .build()).collect(Collectors.toList());
            serie.setSeasons(seasons);
        }

        return serie;
    }

    public List<Serie> getSeriesByGenre(String genre) {
        String url = API_URL + "/discover/tv?api_key=" + API_KEY + "&with_genres=" + genre;
        ResponseEntity<SerieResponse> response = restTemplate.getForEntity(url, SerieResponse.class);
        SerieResponse serieResponse = response.getBody();
        if (serieResponse != null && serieResponse.getResults() != null) {
            return serieResponse.getResults().stream().map(this::mapToSeriesFromResult).filter(Objects::nonNull).toList();
        }
        return Collections.emptyList();
    }

    public Page<Serie> searchSeries(String title, List<String> genres, LocalDate releaseDateFrom, LocalDate releaseDateTo, Double ratingFrom, Double ratingTo, Double popularityFrom, Double popularityTo, Pageable pageable) {
        return serieRepository.searchSeries(title, genres, releaseDateFrom, releaseDateTo, ratingFrom, ratingTo, popularityFrom, popularityTo, pageable);
    }

    public boolean existsById(Long id) {
        return serieRepository.existsById(id);
    }

    public Page<Serie> getSeries(Pageable pageable) {
        return serieRepository.findAll(pageable);
    }

    public Serie getSeriesById(Long id) {
        System.out.println("SerieService.getSeriesById invoked");
        return serieRepository.findById(id).orElseThrow(() -> new RuntimeException("Serie not found"));
    }

    @Transactional
    public List<Serie> fetchSeries(String type, int maxPages) {
        List<Serie> allSeries = new ArrayList<>();
        for (int page = 1; page <= maxPages; page++) {
            String url = gettingCategories(type, page);
            ResponseEntity<SerieResponse> response = restTemplate.getForEntity(url, SerieResponse.class);
            SerieResponse serieResponse = response.getBody();

            if (serieResponse != null && serieResponse.getResults() != null) {
                List<Serie> series = serieResponse.getResults().stream()
                        .map(this::mapToSeriesFromResult)
                        .filter(Objects::nonNull)
                        .toList();
                allSeries.addAll(series);
            }
        }

        // Inicializa todas las colecciones perezosas antes de retornarlas
        allSeries.forEach(serie -> {
            if (serie.getGenreID() != null) {
                Hibernate.initialize(serie.getGenreID());
            }
            if (serie.getSeasons() != null) {
                Hibernate.initialize(serie.getSeasons());
            }
        });

        return allSeries;
    }


    @Transactional
    public String gettingCategories(String category, int pageNumber) {
        String endpoint = switch (category) {
            case "popular" -> "popular";
            case "airing_today" -> "airing_today";
            case "on_the_air" -> "on_the_air";
            case "top_rated" -> "top_rated";
            default -> throw new IllegalArgumentException("Invalid category: " + category);
        };
        return API_URL + "/tv/" + endpoint + "?api_key=" + API_KEY + "&page=" + pageNumber;
    }

    public void deleteSerie(Long id) {
        serieRepository.deleteById(id);
    }
}
