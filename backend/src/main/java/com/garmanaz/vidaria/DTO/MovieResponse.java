package com.garmanaz.vidaria.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Schema(description = "Response object for movies")
public class MovieResponse {

    @Data
    @Schema(description = "Movie results containing pagination and a list of movies")
    public static class MovieResults {

        @Schema(description = "Current page number", example = "1")
        private long page;

        @Schema(description = "List of movie results")
        private List<Result> results;

        @JsonProperty("total_pages")
        @Schema(description = "Total number of pages available", example = "100")
        private long totalPages;

        @JsonProperty("total_results")
        @Schema(description = "Total number of results available", example = "1000")
        private long totalResults;
    }

    @Data
    @Schema(description = "Details of a single movie result")
    public static class Result {

        @Schema(description = "Indicates if the movie is for adults", example = "false")
        private boolean adult;

        @JsonProperty("backdrop_path")
        @Schema(description = "Path to the backdrop image", example = "/backdrop.jpg")
        private String backdropPath;

        @JsonProperty("genre_ids")
        @Schema(description = "List of genre IDs associated with the movie", example = "[18, 35]")
        private List<Long> genreIDS;

        @Schema(description = "Unique ID of the movie", example = "12345")
        private long id;

        @JsonProperty("original_language")
        @Schema(description = "Original language of the movie", example = "en")
        private String originalLanguage;

        @JsonProperty("original_title")
        @Schema(description = "Original title of the movie", example = "Original Movie Title")
        private String originalTitle;

        @Schema(description = "Overview or description of the movie", example = "A thrilling adventure...")
        private String overview;

        @JsonProperty("popularity")
        @Schema(description = "Popularity score of the movie", example = "123.45")
        private double popularity;

        @JsonProperty("poster_path")
        @Schema(description = "Path to the poster image", example = "/poster.jpg")
        private String posterPath;

        @JsonProperty("release_date")
        @Schema(description = "Release date of the movie", example = "2022-01-01")
        private LocalDate releaseDate;

        @Schema(description = "Title of the movie", example = "Movie Title")
        private String title;

        @Schema(description = "Indicates if the movie is a video", example = "false")
        private boolean video;

        @JsonProperty("vote_average")
        @Schema(description = "Average vote score for the movie", example = "8.5")
        private double voteAverage;

        @JsonProperty("vote_count")
        @Schema(description = "Total number of votes for the movie", example = "1500")
        private long voteCount;
    }

    @Data
    @Schema(description = "Details of a movie genre")
    public static class Genre {

        @Schema(description = "Genre ID", example = "18")
        private long id;

        @Schema(description = "Genre name", example = "Comedy")
        private String name;

        public Genre(long id, String name) {
            this.id = id;
            this.name = name;
        }
    }

    @Data
    @Schema(description = "Detailed information about a movie")
    public static class MovieDetails {

        @Schema(description = "Indicates if the movie is for adults", example = "false")
        private boolean adult;

        @JsonProperty("backdrop_path")
        @Schema(description = "Path to the backdrop image", example = "/backdrop.jpg")
        private String backdropPath;

        @JsonProperty("belongs_to_collection")
        @Schema(description = "Information about the collection the movie belongs to")
        private BelongsToCollection belongsToCollection;

        @Schema(description = "Budget of the movie in USD", example = "1000000")
        private long budget;

        @Schema(description = "List of genres associated with the movie")
        private List<Genre> genres;

        @Schema(description = "Homepage URL of the movie", example = "https://www.example.com")
        private String homepage;

        @Schema(description = "Unique ID of the movie", example = "12345")
        private long id;

        @JsonProperty("imdb_id")
        @Schema(description = "IMDB ID of the movie", example = "tt1234567")
        private String imdbID;

        @JsonProperty("origin_country")
        @Schema(description = "List of origin countries for the movie", example = "[\"US\"]")
        private List<String> originCountry;

        @JsonProperty("original_language")
        @Schema(description = "Original language of the movie", example = "en")
        private String originalLanguage;

        @JsonProperty("original_title")
        @Schema(description = "Original title of the movie", example = "Original Movie Title")
        private String originalTitle;

        @Schema(description = "Overview or description of the movie", example = "An epic story...")
        private String overview;

        @Schema(description = "Popularity score of the movie", example = "123.45")
        private Double popularity;

        @JsonProperty("poster_path")
        @Schema(description = "Path to the poster image", example = "/poster.jpg")
        private String posterPath;

        @JsonProperty("production_companies")
        @Schema(description = "List of production companies involved in the movie")
        private List<ProductionCompany> productionCompanies;

        @JsonProperty("production_countries")
        @Schema(description = "List of production countries for the movie")
        private List<ProductionCountry> productionCountries;

        @Schema(description = "Release date of the movie", example = "2022-01-01")
        private LocalDate releaseDate;

        @Schema(description = "Revenue generated by the movie in USD", example = "5000000")
        private long revenue;

        @Schema(description = "Runtime of the movie in minutes", example = "120")
        private Long runtime;

        @JsonProperty("spoken_languages")
        @Schema(description = "List of spoken languages in the movie")
        private List<SpokenLanguage> spokenLanguages;

        @Schema(description = "Current status of the movie", example = "Released")
        private String status;

        @Schema(description = "Tagline of the movie", example = "An epic journey")
        private String tagline;

        @Schema(description = "Title of the movie", example = "Movie Title")
        private String title;

        @Schema(description = "Indicates if the movie is a video", example = "false")
        private boolean video;

        @JsonProperty("vote_average")
        @Schema(description = "Average vote score for the movie", example = "8.5")
        private double voteAverage;

        @JsonProperty("vote_count")
        @Schema(description = "Total number of votes for the movie", example = "1500")
        private long voteCount;
    }

    @Data
    @Schema(description = "Movie videos response containing a list of video details")
    public static class MovieVideosResponse {

        @Schema(description = "Unique ID of the movie", example = "12345")
        private long id;

        @Schema(description = "List of videos related to the movie")
        private List<Video> results;

        @Data
        @Schema(description = "Details of a single video")
        public static class Video {

            @Schema(description = "Unique ID of the video", example = "abcd1234")
            private String id;

            @Schema(description = "ISO 639-1 code for the video", example = "en")
            private String iso_639_1;

            @Schema(description = "ISO 3166-1 code for the video", example = "US")
            private String iso_3166_1;

            @Schema(description = "Key for accessing the video", example = "xyz789")
            private String key;

            @Schema(description = "Name of the video", example = "Official Trailer")
            private String name;

            @Schema(description = "Site hosting the video", example = "YouTube")
            private String site;

            @Schema(description = "Resolution size of the video", example = "1080")
            private int size;

            @Schema(description = "Type of the video", example = "Trailer")
            private String type;
        }
    }

    @Data
    @Schema(description = "Details of a collection a movie belongs to")
    public static class BelongsToCollection {

        @Schema(description = "Collection ID", example = "1")
        private long id;

        @Schema(description = "Name of the collection", example = "The Collection")
        private String name;

        @JsonProperty("poster_path")
        @Schema(description = "Path to the collection's poster", example = "/poster.jpg")
        private String posterPath;

        @JsonProperty("backdrop_path")
        @Schema(description = "Path to the collection's backdrop", example = "/backdrop.jpg")
        private String backdropPath;
    }

    @Data
    @Schema(description = "Details of a production company")
    public static class ProductionCompany {

        @Schema(description = "Production company ID", example = "1")
        private long id;

        @JsonProperty("logo_path")
        @Schema(description = "Path to the logo of the production company", example = "/logo.jpg")
        private String logoPath;

        @Schema(description = "Name of the production company", example = "Warner Bros.")
        private String name;

        @JsonProperty("origin_country")
        @Schema(description = "Country where the production company is located", example = "US")
        private String originCountry;
    }

    @Data
    @Schema(description = "Details of a production country")
    public static class ProductionCountry {

        @JsonProperty("iso_3166_1")
        @Schema(description = "ISO 3166-1 code for the country", example = "US")
        private String iso3166_1;

        @Schema(description = "Name of the production country", example = "United States")
        private String name;
    }

    @Data
    @Schema(description = "Details of a spoken language")
    public static class SpokenLanguage {

        @JsonProperty("english_name")
        @Schema(description = "English name of the language", example = "English")
        private String englishName;

        @JsonProperty("iso_639_1")
        @Schema(description = "ISO 639-1 code for the language", example = "en")
        private String iso639_1;

        @Schema(description = "Name of the language", example = "English")
        private String name;
    }

    @Data
    @Schema(description = "Response containing a list of genres")
    public static class GenreResponse {

        @Schema(description = "List of genres")
        private List<Genre> genres;
    }
}
