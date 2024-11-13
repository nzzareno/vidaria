package com.garmanaz.vidaria.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;


public class MovieResponse {

    @Data
    public static class MovieResults {

        private long page;

        private List<Result> results;

        @JsonProperty("total_pages")
        private long totalPages;

        @JsonProperty("total_results")
        private long totalResults;
    }


    @Data
    public static class Result {
        private boolean adult;

        @JsonProperty("backdrop_path")
        private String backdropPath;
        @JsonProperty("genre_ids")
        private List<Long> genreIDS;
        private long id;
        @JsonProperty("original_language")
        private String originalLanguage;
        @JsonProperty("original_title")
        private String originalTitle;
        private String overview;

        @JsonProperty("popularity")
        private double popularity;
        @JsonProperty("poster_path")
        private String posterPath;
        @JsonProperty("release_date")
        private LocalDate releaseDate;
        private String title;
        private boolean video;
        @JsonProperty("vote_average")
        private double voteAverage;
        @JsonProperty("vote_count")
        private long voteCount;
    }

    @Data
    public static class Genre {
        private long id;
        private String name;

        public Genre(long l, String comedy) {
        }
    }

    @Data
    public static class MovieDetails {
        private boolean adult;
        @JsonProperty("backdrop_path")
        private String backdropPath;
        @JsonProperty("belongs_to_collection")
        private BelongsToCollection belongsToCollection;
        private long budget;
        private List<Genre> genres;
        private String homepage;
        private long id;
        @JsonProperty("imdb_id")
        private String imdbID;
        @JsonProperty("origin_country")
        private List<String> originCountry;
        @JsonProperty("original_language")
        private String originalLanguage;
        @JsonProperty("original_title")
        private String originalTitle;
        private String overview;
        private Double popularity;
        @JsonProperty("poster_path")
        private String posterPath;
        @JsonProperty("production_companies")
        private List<ProductionCompany> productionCompanies;
        @JsonProperty("production_countries")
        private List<ProductionCountry> productionCountries;
        private LocalDate releaseDate;
        private long revenue;
        private Long runtime;
        @JsonProperty("spoken_languages")
        private List<SpokenLanguage> spokenLanguages;
        private String status;
        private String tagline;
        private String title;
        private boolean video;
        @JsonProperty("vote_average")
        private double voteAverage;
        @JsonProperty("vote_count")
        private long voteCount;


    }

    @Data
    public static class MovieVideosResponse {

        private long id;
        private List<Video> results;

        @Data
        public static class Video {
            private String id;
            private String iso_639_1;
            private String iso_3166_1;
            private String key;
            private String name;
            private String site;
            private int size;
            private String type;
        }
    }

    @Data
    public static class BelongsToCollection {
        private long id;
        private String name;
        @JsonProperty("poster_path")
        private String posterPath;
        @JsonProperty("backdrop_path")
        private String backdropPath;
    }

    @Data
    public static class ProductionCompany {
        private long id;
        @JsonProperty("logo_path")
        private String logoPath;
        private String name;
        @JsonProperty("origin_country")
        private String originCountry;
    }

    @Data
    public static class ProductionCountry {
        @JsonProperty("iso_3166_1")
        private String iso3166_1;
        private String name;
    }

    @Data
    public static class SpokenLanguage {
        @JsonProperty("english_name")
        private String englishName;
        @JsonProperty("iso_639_1")
        private String iso639_1;
        private String name;
    }

    @Data
    public static class GenreResponse {

        private List<Genre> genres;


    }
}