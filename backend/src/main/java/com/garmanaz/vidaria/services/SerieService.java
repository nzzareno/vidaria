package com.garmanaz.vidaria.services;

import com.garmanaz.vidaria.DTO.SerieResponse;
import com.garmanaz.vidaria.entities.Genre;
import com.garmanaz.vidaria.entities.Season;
import com.garmanaz.vidaria.entities.Serie;
import com.garmanaz.vidaria.repositories.GenreRepository;
import com.garmanaz.vidaria.repositories.SeasonRepository;
import com.garmanaz.vidaria.repositories.SerieRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
public class SerieService {

    private static final String API_URL = "https://api.themoviedb.org/3";
    private static final Logger logger = LoggerFactory.getLogger(SerieService.class);
    private final GenreRepository genreRepository;
    private final RestTemplate restTemplate;
    private final SerieRepository serieRepository;
    private final SeasonRepository seasonRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final SerieService self;

    @Value("${tmdb.api.key}")
    private String API_KEY;

    @Autowired
    public SerieService(SerieRepository serieRepository, GenreRepository genreRepository, SeasonRepository seasonRepository, RestTemplate restTemplate, @Lazy SerieService self, RedisTemplate<String, String> redisTemplate) {
        this.serieRepository = serieRepository;
        this.genreRepository = genreRepository;
        this.seasonRepository = seasonRepository;
        this.restTemplate = restTemplate;
        this.redisTemplate = redisTemplate;
        this.self = self;

    }

    public void preCacheSeriesImages() {
        List<Serie> series = serieRepository.findAll();
        for (Serie serie : series) {
            String imageUrl = serie.getBackdrop(); // Precarga el poster o backdrop de la serie
            redisTemplate.opsForValue().set("serie:" + serie.getId() + ":image", imageUrl, 1, TimeUnit.DAYS);
        }
    }


    public void syncGenres() {
        List<Genre> genres = self.getGenres();
        for (Genre genre : genres) {
            genreRepository.findById(genre.getId()).orElseGet(() -> genreRepository.save(genre));
        }
    }

    @CacheEvict(value = "series", allEntries = true)
    @Transactional
    public void saveAllSeries(int page, int totalSeries) {
        syncGenres();
        AtomicInteger savedSeriesCount = new AtomicInteger();
        int pageIndex = page;

        logger.info("Iniciando sincronización de series. Página inicial: {}, Total de series a guardar: {}", page, totalSeries);

        while (savedSeriesCount.get() < totalSeries) {
            List<Serie> seriesToSave = new ArrayList<>();
            seriesToSave.addAll(fetchSeries("popular", pageIndex));
            seriesToSave.addAll(fetchSeries("top_rated", pageIndex));
            seriesToSave.addAll(fetchSeries("airing_today", pageIndex));
            seriesToSave.addAll(fetchSeries("on_the_air", pageIndex));

            logger.info("Se obtuvieron {} series de la página {}.", seriesToSave.size(), pageIndex);

            for (Serie serie : seriesToSave) {
                serieRepository.findById(serie.getId()).ifPresentOrElse(existingSerie -> {
                    existingSerie.setSeasons(serie.getSeasons());
                    serieRepository.save(existingSerie);
                    savedSeriesCount.getAndIncrement();
                    logger.info("Serie actualizada: {} (ID: {}). Total series guardadas: {}", serie.getTitle(), serie.getId(), savedSeriesCount.get());
                }, () -> {
                    serieRepository.save(serie);
                    for (Season season : serie.getSeasons()) {
                        season.setSerie(serie);
                        seasonRepository.save(season);
                    }
                    savedSeriesCount.getAndIncrement();
                    logger.info("Serie guardada: {} (ID: {}). Total series guardadas: {}", serie.getTitle(), serie.getId(), savedSeriesCount.get());
                });

                if (savedSeriesCount.get() >= totalSeries) {
                    logger.info("Se alcanzó el límite de series guardadas: {}", savedSeriesCount.get());
                    break;
                }
            }
            pageIndex++;
        }
        logger.info("Sincronización de series completada. Total de series guardadas: {}", savedSeriesCount.get());
    }

    @Cacheable(value = "genres")
    public List<Genre> getGenres() {
        String url = API_URL + "/genre/tv/list?api_key=" + API_KEY;
        ResponseEntity<SerieResponse.SerieDetails.GenreResponse> response = restTemplate.getForEntity(url, SerieResponse.SerieDetails.GenreResponse.class);
        SerieResponse.SerieDetails.GenreResponse genreResponse = response.getBody();
        return (genreResponse != null) ? genreResponse.getGenres().stream().map(genre -> new Genre(genre.getId(), genre.getName())).toList() : Collections.emptyList();
    }

    @Cacheable(value = "series", key = "#id")
    @Transactional
    public Serie getSerieDetails(Long id) {
        String cacheKey = "serie:" + id + ":image";
        String cachedImageUrl = redisTemplate.opsForValue().get(cacheKey);

        Serie serie;
        if (cachedImageUrl != null) {
            serie = serieRepository.findById(id).orElseGet(() -> mapToSeries(fetchSerieFromApi(id)));
            serie.setPoster(cachedImageUrl);
        } else {
            serie = mapToSeries(fetchSerieFromApi(id));
            redisTemplate.opsForValue().set(cacheKey, serie.getPoster(), 1, TimeUnit.DAYS);
        }
        return serie;
    }

    private SerieResponse.SerieDetails fetchSerieFromApi(Long id) {
        String url = API_URL + "/tv/" + id + "?api_key=" + API_KEY;

        ResponseEntity<SerieResponse.SerieDetails> response = restTemplate.getForEntity(url, SerieResponse.SerieDetails.class);
        System.out.println("Response from external API: " + response.getBody());
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

        Serie serie = self.getSerieDetails(result.getId());
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

    @Transactional
    public List<Serie> fetchSeries(String type, int page) {
        String url = gettingCategories(type, page);
        ResponseEntity<SerieResponse> response = restTemplate.getForEntity(url, SerieResponse.class);
        SerieResponse serieResponse = response.getBody();

        if (serieResponse != null && serieResponse.getResults() != null) {
            List<Serie> series = serieResponse.getResults().stream()
                    .map(this::mapToSeriesFromResult)
                    .filter(Objects::nonNull)
                    .toList();

            // Forzar la inicialización de genreID para cada serie
            series.forEach(serie -> serie.getGenreID().size());

            return series;
        }

        return Collections.emptyList();
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
        return serieRepository.findById(id).orElseThrow(() -> new RuntimeException("Serie not found"));
    }

    @CacheEvict(value = "series", key = "#id")
    public void deleteSerie(Long id) {
        serieRepository.deleteById(id);
    }

    public Serie saveSerie(Serie serie) {
        return serieRepository.save(serie);
    }

    public Serie updateSerie(Serie serie) {
        Serie existingSerie = serieRepository.findById(serie.getId()).orElse(null);

        if (existingSerie != null) {
            existingSerie.setTitle(serie.getTitle());
            existingSerie.setDescription(serie.getDescription());
            existingSerie.setGenreID(serie.getGenreID());
            existingSerie.setCreator(serie.getCreator());
            existingSerie.setReleaseDate(serie.getReleaseDate());
            existingSerie.setPoster(serie.getPoster());
            existingSerie.setBackdrop(serie.getBackdrop());
            existingSerie.setRating(serie.getRating());
            existingSerie.setPopularity(serie.getPopularity());
            existingSerie.setNumberOfSeasons(serie.getNumberOfSeasons());
            existingSerie.setNumberOfEpisodes(serie.getNumberOfEpisodes());
            existingSerie.setTrailer(serie.getTrailer());
            existingSerie.setStatus(serie.getStatus());
            return serieRepository.save(existingSerie);
        }
        return null;
    }
}
