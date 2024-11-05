package com.garmanaz.vidaria.services;

import com.garmanaz.vidaria.DTO.SerieResponse;
import com.garmanaz.vidaria.entities.Genre;
import com.garmanaz.vidaria.entities.Season;
import com.garmanaz.vidaria.entities.Serie;
import com.garmanaz.vidaria.repositories.GenreRepository;
import com.garmanaz.vidaria.repositories.SeasonRepository;
import com.garmanaz.vidaria.repositories.SerieRepository;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
public class SerieService {

    private static final String API_URL = "https://api.themoviedb.org/3/tv/";
    private static final Logger logger = LoggerFactory.getLogger(SerieService.class);
    private final GenreRepository genreRepository;
    private final RestTemplate restTemplate;
    private final SerieRepository serieRepository;
    private final SeasonRepository seasonRepository;
    @Value("${tmdb.api.key}")
    private String API_KEY;

    @Autowired
    public SerieService(SerieRepository serieRepository, GenreRepository genreRepository, SeasonRepository seasonRepository, RestTemplate restTemplate) {
        this.serieRepository = serieRepository;
        this.genreRepository = genreRepository;
        this.seasonRepository = seasonRepository;
        this.restTemplate = restTemplate;
    }

    public void syncGenres() {
        List<Genre> genres = getGenres();
        for (Genre genre : genres) {
            genreRepository.findById(genre.getId()).orElseGet(() -> genreRepository.save(genre));
        }
    }

    public Page<Serie> getBestSeriesByGenres(String genre, Pageable pageable) {
        return serieRepository.getBestSeriesByGenres(genre, pageable);
    }

    @Transactional
    public void saveAllSeries(int page, int totalSeries) {
        syncGenres();
        AtomicInteger savedSeriesCount = new AtomicInteger();
        int pageIndex = page;

        logger.info("Iniciando sincronización de series. Página inicial: {}, Total de series a guardar: {}", page, totalSeries);

        // Mientras no hayamos alcanzado el número de series a guardar
        while (savedSeriesCount.get() < totalSeries) {
            List<Serie> seriesToSave = new ArrayList<>();

            // Obtener series de las distintas categorías por página
            seriesToSave.addAll(fetchSeries("popular", pageIndex));
            seriesToSave.addAll(fetchSeries("top_rated", pageIndex));
            seriesToSave.addAll(fetchSeries("airing_today", pageIndex));
            seriesToSave.addAll(fetchSeries("on_the_air", pageIndex));

            logger.info("Se obtuvieron {} series de la página {}.", seriesToSave.size(), pageIndex);

            for (Serie serie : seriesToSave) {
                serieRepository.findById(serie.getId()).ifPresentOrElse(existingSerie -> {
                    // Actualizar serie existente
                    existingSerie.setSeasons(serie.getSeasons());
                    serieRepository.save(existingSerie);
                    savedSeriesCount.getAndIncrement();  // Incrementa el contador al actualizar
                    logger.info("Serie actualizada: {} (ID: {}). Total series guardadas: {}", serie.getTitle(), serie.getId(), savedSeriesCount.get());
                }, () -> {
                    // Guardar nueva serie
                    serieRepository.save(serie);
                    for (Season season : serie.getSeasons()) {
                        season.setSerie(serie);
                        seasonRepository.save(season);
                    }
                    savedSeriesCount.getAndIncrement();  // Incrementa cuando se guarda una nueva serie
                    logger.info("Serie guardada: {} (ID: {}). Total series guardadas: {}", serie.getTitle(), serie.getId(), savedSeriesCount.get());
                });

                // Verifica si ya se alcanzó el límite de series a guardar
                if (savedSeriesCount.get() >= totalSeries) {
                    logger.info("Se alcanzó el límite de series guardadas: {}", savedSeriesCount.get());
                    break;
                }
            }

            // Incrementar el número de página para la siguiente solicitud
            pageIndex++;
        }

        logger.info("Sincronización de series completada. Total de series guardadas: {}", savedSeriesCount.get());
    }


    //getMostPopularAndTopRated
    public Page<Serie> getMostPopularAndTopRated(Pageable pageable) {
        return serieRepository.getMostPopularAndTopRated(pageable);
    }

    public List<Genre> getGenres() {
        String url = "https://api.themoviedb.org/3/genre/tv/list?api_key=" + API_KEY;
        ResponseEntity<SerieResponse.SerieDetails.GenreResponse> response = restTemplate.getForEntity(url, SerieResponse.SerieDetails.GenreResponse.class);
        SerieResponse.SerieDetails.GenreResponse genreResponse = response.getBody();
        return (genreResponse != null) ? genreResponse.getGenres().stream().map(genre -> new Genre(genre.getId(), genre.getName())).toList() : Collections.emptyList();
    }

    public Serie getSerieDetails(Long id) {
        String url = API_URL + id + "?api_key=" + API_KEY;
        ResponseEntity<SerieResponse.SerieDetails> response = restTemplate.getForEntity(url, SerieResponse.SerieDetails.class);
        SerieResponse.SerieDetails serieDetails = response.getBody();
        return (serieDetails != null) ? mapToSeries(serieDetails) : null;
    }

    private Serie mapToSeriesFromResult(SerieResponse.Result result) {
        if (result == null || result.getId() == null) {
            return null;
        }

        Serie serie = getSerieDetails(result.getId());
        if (serie != null) {
            serie.setTitle(result.getName());
            serie.setDescription(result.getOverview());
            serie.setTrailer(getTrailer(result.getId()));
            if (serie.getTrailer() == null) {
                return null;  // Si no hay trailer, retorna null para omitir esta serie
            }
            // Puedes mapear otros campos del Result al objeto Serie si es necesario.
        }
        return serie;
    }

    public String getTrailer(Long id) {
        String url = API_URL + id + "/videos?api_key=" + API_KEY;
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

    public List<Serie> fetchSeries(String type, int page) {
        String url = gettingCategories(type, page);
        ResponseEntity<SerieResponse> response = restTemplate.getForEntity(url, SerieResponse.class);
        SerieResponse serieResponse = response.getBody();
        if (serieResponse != null && serieResponse.getResults() != null) {
            return serieResponse.getResults().stream().map(this::mapToSeriesFromResult).filter(Objects::nonNull).toList();
        }
        return Collections.emptyList();
    }

    private String gettingCategories(String category, int pageNumber) {
        String endpoint = switch (category) {
            case "popular" -> "popular";
            case "airing_today" -> "airing_today";
            case "on_the_air" -> "on_the_air";
            case "top_rated" -> "top_rated";
            default -> throw new IllegalArgumentException("Invalid category: " + category);
        };
        return "https://api.themoviedb.org/3/tv/" + endpoint + "?api_key=" + API_KEY + "&page=" + pageNumber;
    }

    public List<Serie> getSeriesByGenre(String genre) {
        String url = "https://api.themoviedb.org/3/discover/tv?api_key=" + API_KEY + "&with_genres=" + genre;
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

    // check if exists serie in db
    public boolean existsById(Long id) {
        return serieRepository.existsById(id);
    }


    public Page<Serie> getSeries(Pageable pageable) {
        return serieRepository.findAll(pageable);
    }

    public Serie getSeriesById(Long id) {
        if (serieRepository.findById(id).isPresent()) {
            return serieRepository.findById(id).get();
        } else {
            throw new RuntimeException("Serie not found");
        }

    }

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
        } else {
            return null;
        }

    }
}
