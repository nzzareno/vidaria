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
import org.springframework.data.domain.*;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
public class MovieService {

    private static final String API_URL = "https://api.themoviedb.org/3";
    private final MovieRepository movieRepository;
    private final GenreRepository genreRepository;
    private final CategoryRepository categoryRepository;
    private final RestTemplate restTemplate;


    @Value("${tmdb.api.key}")
    private String API_KEY;

    @Autowired
    public MovieService(MovieRepository movieRepository, GenreRepository genreRepository, CategoryRepository categoryRepository, RestTemplate restTemplate) {
        this.movieRepository = movieRepository;
        this.genreRepository = genreRepository;
        this.categoryRepository = categoryRepository;
        this.restTemplate = restTemplate;
    }

    @PostConstruct
    public void initialize() {
        syncGenres();
        syncCategories();
    }

    //SEARCHmOVIES


    // Sincronizar géneros desde la API de TMDb
    public void syncGenres() {
        try {
            List<Genre> genres = getGenres();
            genreRepository.saveAll(genres);
        } catch (Exception e) {
            System.err.println("Error syncing genres: " + e.getMessage());
        }
    }

    // Sincronizar categorías localmente
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

    // Obtener géneros desde TMDb
    public List<Genre> getGenres() {
        String url = API_URL + "/genre/movie/list?api_key=" + API_KEY;
        ResponseEntity<MovieResponse.GenreResponse> response = restTemplate.exchange(url, HttpMethod.GET, null, MovieResponse.GenreResponse.class);
        return Optional.ofNullable(response.getBody())
                .map(genreResponse -> genreResponse.getGenres().stream()
                        .map(genre -> new Genre(genre.getId(), genre.getName()))
                        .collect(Collectors.toList()))
                .orElse(Collections.emptyList());
    }

    public Movie getMovie(Long id) {
        String url = API_URL + "/movie/" + id + "?api_key=" + API_KEY;
        try {
            ResponseEntity<MovieResponse.MovieDetails> response = restTemplate.exchange(url, HttpMethod.GET, null, MovieResponse.MovieDetails.class);
            return Optional.ofNullable(response.getBody()).map(this::mapToMovie).orElse(null);
        } catch (Exception e) {
            System.err.println("Error getting movie: " + e.getMessage());
            return null; // Devuelve null para que no falle la transacción
        }
    }

    private Movie mapToMovie(MovieResponse.MovieDetails movieDetails) {
        Movie movie = new Movie();
        movie.setId(movieDetails.getId());
        movie.setTitle(movieDetails.getTitle());
        movie.setDescription(movieDetails.getOverview());
        movie.setReleaseDate(movieDetails.getReleaseDate());
        movie.setCover("https://image.tmdb.org/t/p/original/" + movieDetails.getPosterPath());
        movie.setBackground("https://image.tmdb.org/t/p/original" + movieDetails.getBackdropPath());
        movie.setRating(movieDetails.getVoteAverage());
        movie.setPopularity(movieDetails.getPopularity());
        movie.setDuration(movieDetails.getRuntime());
        movie.setDirector(movieDetails.getProductionCompanies().stream().map(MovieResponse.ProductionCompany::getName).collect(Collectors.joining(", ")));
        movie.setTrailer("https://www.youtube.com/watch?v=" + getTrailer(movieDetails.getId()));
        List<Genre> genres = movieDetails.getGenres().stream().map(g -> genreRepository.findById(g.getId()).orElse(null)).filter(Objects::nonNull).collect(Collectors.toList());
        movie.setGenres(genres);


        return movie;
    }

    public Page<Movie> getMovies(Pageable pageable) {
        long totalMovies = movieRepository.count();
        List<Movie> movies = movieRepository.findAll(pageable).getContent();
        return new PageImpl<>(movies, pageable, totalMovies);
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

    // Método syncMovies llamado desde el controlador
    public void syncMovies() {
        // Sincroniza todas las películas limitando a 10 por categoría
        saveAllMovies(1, 300);
    }

    public void saveAllMovies(int startPage, int maxMoviesToSave) {
        List<Category> categories = categoryRepository.findAll();
        categories.forEach(category -> {
            // Log antes de iniciar el proceso de sincronización para cada categoría
            System.out.println("Sincronizando películas para la categoría: " + category.getName());
            saveMoviesFromCategory(category, startPage, maxMoviesToSave);
        });
    }

    private void saveMoviesFromCategory(Category category, int startPage, int maxMoviesToSave) {
        int pageNumber = startPage;
        AtomicInteger moviesSaved = new AtomicInteger();

        while (moviesSaved.get() < maxMoviesToSave) {
            List<Movie> movies = fetchMovies(category, pageNumber);

            // Si no hay más películas disponibles, rompe el bucle
            if (movies.isEmpty()) {
                System.out.println("No hay más películas para la categoría " + category.getName() + " en la página " + pageNumber);
                break;
            }

            for (Movie movie : movies) {
                // Verifica si la película ya está en la base de datos
                if (movieRepository.findById(movie.getId()).isEmpty()) {
                    movieRepository.save(movie);
                    moviesSaved.incrementAndGet(); // Incrementa solo si se guarda una nueva película
                    System.out.println("Película guardada: " + movie.getTitle());
                }

                // Rompe el bucle si se alcanzó el límite de películas a guardar
                if (moviesSaved.get() >= maxMoviesToSave) {
                    System.out.println("Se alcanzó el límite de películas guardadas para la categoría " + category.getName());
                    break;
                }
            }

            // Incrementa el número de página para la siguiente solicitud
            pageNumber++;
        }
    }


    // Obtener películas por categoría desde la API de TMDb
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
            return Collections.emptyList(); // Devuelve una lista vacía para evitar marcar la transacción
        }
    }

    // Construir la URL de categoría basada en el nombre de la categoría
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

    // Mapear la respuesta de película de TMDb a la entidad Movie, solo incluyendo películas con duración mayor a 40 minutos
    private Movie mapTmdbMovieToMovie(MovieResponse.Result tmdbMovie, Category
            category, Map<Long, Movie> movieDetailsMap) {
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

        // Obtener detalles de la película para verificar duración y calificación
        Movie detailedMovie = movieDetailsMap.get(tmdbMovie.getId());
        if (detailedMovie != null) {
            // Solo guardamos películas con duración mayor a 40 minutos
            if (detailedMovie.getDuration() != null && detailedMovie.getDuration() > 40) {
                if (detailedMovie.getRating() != null) {
                    movie.setRating(detailedMovie.getRating());
                }
                return movie;
            }
        }
        return null;
    }


    // Obtener detalles de múltiples películas
    private Map<Long, Movie> fetchMovieDetails(List<Long> movieIds) {
        Map<Long, Movie> movieDetailsMap = new HashMap<>();
        for (Long movieId : movieIds) {
            Movie movie = getMovie(movieId);
            if (movie != null) {
                movieDetailsMap.put(movieId, movie);
            }
        }
        return movieDetailsMap;
    }

    // Método para paginar películas
    public Page<Movie> getPaginatedMovies(Pageable pageable) {
        long totalMovies = movieRepository.count();
        List<Movie> movies = movieRepository.findAll(pageable).getContent();
        return new PageImpl<>(movies, pageable, totalMovies);
    }


    // Crear el objeto Pageable con la ordenación adecuada
    public Page<Movie> searchMovies(String title,
                                    List<String> genres,
                                    List<String> categories,
                                    LocalDate releaseDateFrom,
                                    LocalDate releaseDateTo,
                                    Double ratingFrom,
                                    Double ratingTo,
                                    Double popularityFrom,
                                    Double popularityTo,
                                    Pageable pageable) {
        title = title != null ? title.toLowerCase() : null;

        Sort sort = Sort.by(Sort.Order.desc("popularity"), Sort.Order.desc("rating"));


        pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);


        return movieRepository.searchMovies(title, genres, categories, releaseDateFrom, releaseDateTo, ratingFrom, ratingTo, popularityFrom, popularityTo, pageable);
    }


    public void deleteMovie(Long id) {
        movieRepository.deleteById(id);
    }

    public Movie getMovieById(String idParam, String film) {
        Long id = idParam != null ? Long.parseLong(idParam) : Long.parseLong(film);
        return movieRepository.findById(id).orElse(null);
    }

    public Movie saveMovie(Movie movie) {
        return movieRepository.save(movie);
    }

    // GET TOP 5 MOVIE OF EACH GENRE
    public List<Movie> getTop5MoviesOfEachGenre() {
        List<Genre> genres = genreRepository.findAll();
        List<Movie> topMovies = new ArrayList<>();
        genres.forEach(genre -> {
            Page<Movie> movies = movieRepository.getBestMoviesByGenres(genre.getName(), PageRequest.of(0, 5));
            topMovies.addAll(movies.getContent());
        });
        return topMovies;
    }


    public Page<Movie> getMoviesByCategory(String categoryName, Pageable pageable) {
        return movieRepository.findMoviesByCategory(categoryName, pageable);
    }


    // updatemovie
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

    public Page<Movie> getBestMoviesByGenres(String genre) {
        System.out.println("Fetching best movies for genre: " + genre);
        return movieRepository.getBestMoviesByGenres(genre, PageRequest.of(0, 10));
    }

    public List<Movie> getMoviesByGenre(List<String> genre) {
        return movieRepository.findByGenresIn(genre);
    }
}



