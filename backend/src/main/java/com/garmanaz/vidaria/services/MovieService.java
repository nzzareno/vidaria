package com.garmanaz.vidaria.services;

import com.garmanaz.vidaria.DTO.MovieResponse;
import com.garmanaz.vidaria.entities.Category;
import com.garmanaz.vidaria.entities.Genre;
import com.garmanaz.vidaria.entities.Movie;
import com.garmanaz.vidaria.repositories.CategoryRepository;
import com.garmanaz.vidaria.repositories.GenreRepository;
import com.garmanaz.vidaria.repositories.MovieRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.*;
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
@Transactional
public class MovieService {

    private static final String API_URL = "https://api.themoviedb.org/3";
    private final MovieRepository movieRepository;
    private final GenreRepository genreRepository;
    private final CategoryRepository categoryRepository;
    private final RestTemplate restTemplate;
    private final RedisTemplate<String, String> redisTemplate;
    private final MovieCacheService movieCacheService;

    @Value("${tmdb.api.key}")
    private String API_KEY;

    @Autowired
    public MovieService(MovieRepository movieRepository, GenreRepository genreRepository, CategoryRepository categoryRepository,
                        RestTemplate restTemplate, RedisTemplate<String, String> redisTemplate, MovieCacheService movieCacheService) {
        this.movieRepository = movieRepository;
        this.genreRepository = genreRepository;
        this.categoryRepository = categoryRepository;
        this.restTemplate = restTemplate;
        this.redisTemplate = redisTemplate;
        this.movieCacheService = movieCacheService;
    }

    @PostConstruct
    public void initialize() {
        syncGenres();
        syncCategories();
    }

    public void preCacheMoviesImages() {
        List<Movie> movies = movieRepository.findAll();
        for (Movie movie : movies) {
            String imageUrl = movie.getBackground();
            redisTemplate.opsForValue().set("movie:" + movie.getId() + ":image", imageUrl, 1, TimeUnit.DAYS);
        }
    }


    public void syncGenres() {
        try {
            List<Genre> genres = movieCacheService.getGenres();
            genreRepository.saveAll(genres);
        } catch (Exception e) {
            System.err.println("Error syncing genres: " + e.getMessage());
        }
    }

    public void syncCategories() {
        List<String> categoryNames = Arrays.asList("popular", "top_rated", "upcoming", "now_playing", "trending");
        categoryNames.forEach(name -> {
            try {
                if (categoryRepository.findByName(name) == null) {
                    categoryRepository.save(new Category(name));
                    System.out.println("Category saved: " + name);
                }
            } catch (Exception e) {
                System.err.println("Error saving category: " + e.getMessage());
            }
        });
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

    public void syncMovies() {
        syncGenres();
        saveAllMovies(1, 300);
    }

    private String getTrailer(Long movieId) {
        String url = API_URL + "/movie/" + movieId + "/videos?api_key=" + API_KEY;
        ResponseEntity<MovieResponse.MovieVideosResponse> response = restTemplate.exchange(url, HttpMethod.GET, null, MovieResponse.MovieVideosResponse.class);
        MovieResponse.MovieVideosResponse videoResponse = response.getBody();
        if (videoResponse != null && videoResponse.getResults() != null) {
            return videoResponse.getResults().stream().findFirst().map(MovieResponse.MovieVideosResponse.Video::getKey).orElse("");
        } else {
            return "";
        }
    }

    public void saveAllMovies(int startPage, int maxMoviesToSave) {
        List<Category> categories = categoryRepository.findAll();
        categories.forEach(category -> {
            System.out.println("Sincronizando películas para la categoría: " + category.getName());
            saveMoviesFromCategory(category, startPage, maxMoviesToSave);
        });
    }

    private void saveMoviesFromCategory(Category category, int startPage, int maxMoviesToSave) {
        int pageNumber = startPage;
        AtomicInteger moviesSaved = new AtomicInteger();

        while (moviesSaved.get() < maxMoviesToSave) {
            List<Movie> movies = fetchMovies(category, pageNumber);

            if (movies.isEmpty()) {
                System.out.println("No hay más películas para la categoría " + category.getName() + " en la página " + pageNumber);
                break;
            }

            for (Movie movie : movies) {
                if (movieRepository.findById(movie.getId()).isEmpty()) {
                    movieRepository.save(movie);
                    moviesSaved.incrementAndGet();
                    System.out.println("Película guardada: " + movie.getTitle());
                }

                if (moviesSaved.get() >= maxMoviesToSave) {
                    System.out.println("Se alcanzó el límite de películas guardadas para la categoría " + category.getName());
                    break;
                }
            }
            pageNumber++;
        }
    }

    public List<Movie> fetchMovies(Category category, int pageNumber) {
        String url = getCategoryUrl(category.getName(), pageNumber);

        try {
            ResponseEntity<MovieResponse.MovieResults> response = restTemplate.exchange(url, HttpMethod.GET, null, MovieResponse.MovieResults.class);
            return Optional.ofNullable(response.getBody())
                    .map(movieResults -> {
                        List<Long> movieIds = movieResults.getResults().stream().map(MovieResponse.Result::getId).collect(Collectors.toList());
                        Map<Long, Movie> movieDetailsMap = fetchMovieDetails(movieIds);
                        return movieResults.getResults().stream()
                                .map(tmdbMovie -> mapTmdbMovieToMovie(tmdbMovie, category, movieDetailsMap))
                                .filter(Objects::nonNull)
                                .collect(Collectors.toList());
                    }).orElse(Collections.emptyList());
        } catch (Exception e) {
            System.err.println("Error fetching movies: " + e.getMessage());
            return Collections.emptyList();
        }
    }

    private String getCategoryUrl(String categoryName, int pageNumber) {
        String endpoint = switch (categoryName) {
            case "popular" -> "/movie/popular";
            case "top_rated" -> "/movie/top_rated";
            case "upcoming" -> "/movie/upcoming";
            case "now_playing" -> "/movie/now_playing";
            case "trending" -> "/trending/movie/day";
            default -> throw new IllegalArgumentException("Unknown category: " + categoryName);
        };
        return API_URL + endpoint + "?api_key=" + API_KEY + "&page=" + pageNumber;
    }

    private Movie mapTmdbMovieToMovie(MovieResponse.Result tmdbMovie, Category category, Map<Long, Movie> movieDetailsMap) {
        Movie movie = new Movie();
        movie.setId(tmdbMovie.getId());
        movie.setTitle(tmdbMovie.getTitle());
        movie.setDescription(tmdbMovie.getOverview());
        movie.setReleaseDate(tmdbMovie.getReleaseDate());
        movie.setCover("https://image.tmdb.org/t/p/w500" + tmdbMovie.getPosterPath());
        movie.setBackground("https://image.tmdb.org/t/p/w500" + tmdbMovie.getBackdropPath());
        movie.setCategory(category);
        movie.setPopularity(tmdbMovie.getPopularity());
        movie.setGenres(tmdbMovie.getGenreIDS().stream().map(genreId -> genreRepository.findById(genreId).orElse(null)).filter(Objects::nonNull).collect(Collectors.toList()));
        movie.setDuration(movieDetailsMap.get(tmdbMovie.getId()).getDuration());
        movie.setDirector(movieDetailsMap.get(tmdbMovie.getId()).getDirector());
        movie.setTrailer("https://www.youtube.com/watch?v=" + getTrailer(tmdbMovie.getId()));

        Movie detailedMovie = movieDetailsMap.get(tmdbMovie.getId());
        if (detailedMovie != null) {
            if (detailedMovie.getDuration() != null && detailedMovie.getDuration() > 40) {
                if (detailedMovie.getRating() != null) {
                    movie.setRating(detailedMovie.getRating());
                }
                return movie;
            }
        }
        return null;
    }

    private Map<Long, Movie> fetchMovieDetails(List<Long> movieIds) {
        Map<Long, Movie> movieDetailsMap = new HashMap<>();
        for (Long movieId : movieIds) {
            Movie movie = movieCacheService.getMovie(movieId);
            if (movie != null) {
                movieDetailsMap.put(movieId, movie);
            }
        }
        return movieDetailsMap;
    }

    public Page<Movie> getPaginatedMovies(Pageable pageable) {
        long totalMovies = movieRepository.count();
        List<Movie> movies = movieRepository.findAll(pageable).getContent();
        return new PageImpl<>(movies, pageable, totalMovies);
    }

    public Page<Movie> searchMovies(String title, List<String> genres, List<String> categories, LocalDate releaseDateFrom, LocalDate releaseDateTo, Double ratingFrom, Double ratingTo, Double popularityFrom, Double popularityTo, Pageable pageable) {
        title = title != null ? title.toLowerCase() : null;
        Sort sort = Sort.by(Sort.Order.desc("popularity"), Sort.Order.desc("rating"));
        pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);
        return movieRepository.searchMovies(title, genres, categories, releaseDateFrom, releaseDateTo, ratingFrom, ratingTo, popularityFrom, popularityTo, pageable);
    }

    public void deleteMovie(Long id) {
        movieRepository.deleteById(id);
    }


    public Movie saveMovie(Movie movie) {
        return movieRepository.save(movie);
    }


    public Page<Movie> getMoviesByCategory(String categoryName, Pageable pageable) {
        return movieRepository.findMoviesByCategory(categoryName, pageable);
    }

    public Movie updateMovie(Long id, Movie movie) {
        Movie existingMovie = movieRepository.findById(id).orElse(null);
        if (existingMovie != null) {
            existingMovie.setTitle(movie.getTitle());
            existingMovie.setDescription(movie.getDescription());
            existingMovie.setReleaseDate(movie.getReleaseDate());
            existingMovie.setCover(movie.getCover());
            existingMovie.setBackground(movie.getBackground());
            existingMovie.setDirector(movie.getDirector());
            existingMovie.setDuration(movie.getDuration());
            existingMovie.setRating(movie.getRating());
            existingMovie.setPopularity(movie.getPopularity());
            existingMovie.setCategory(movie.getCategory());
            existingMovie.setGenres(movie.getGenres());
            return movieRepository.save(existingMovie);
        }
        return null;
    }

    public Page<Movie> getBestMoviesByGenres(String genre, Pageable pageable) {
        return movieRepository.getBestMoviesByGenres(genre, pageable);
    }

}
