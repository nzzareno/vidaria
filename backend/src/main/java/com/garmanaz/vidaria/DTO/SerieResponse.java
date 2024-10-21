package com.garmanaz.vidaria.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

@Data
public class SerieResponse {

    private Long page;
    private List<Result> results;
    private Long totalPages;
    private Long totalResults;

    @Data
    public static class Result {
        private Boolean adult;
        private String backdropPath;
        private List<Long> genreIDS;
        private Long id;
        private String originalLanguage;
        private String originalName;
        private String overview;
        private Double popularity;
        private String posterPath;
        private LocalDate firstAirDate;
        private String name;
        private Boolean video;
        private Double voteAverage;
        private Long voteCount;
    }

    @Data
    public static class SerieDetails {
        private Boolean adult;

        @JsonProperty("backdrop_path")
        private String backdropPath;

        @JsonProperty("created_by")
        private List<CreatedBy> createdBy;

        @JsonProperty("episode_run_time")
        private List<Long> episodeRunTime;

        @JsonProperty("first_air_date")
        private LocalDate firstAirDate;
        private List<Genre> genres;
        private String homepage;
        private Long id;
        private Boolean inProduction;
        private List<String> languages;
        private LocalDate lastAirDate;
        private LastEpisodeToAir lastEpisodeToAir;
        private String name;
        private Object nextEpisodeToAir;
        private List<Network> networks;

        @JsonProperty("number_of_episodes")
        private Long numberOfEpisodes;

        @JsonProperty("number_of_seasons")
        private Long numberOfSeasons;
        private List<String> originCountry;
        private String originalLanguage;
        private String originalName;
        private String overview;
        private Double popularity;

        @JsonProperty("poster_path")
        private String posterPath;

        @JsonProperty("production_companies")
        private List<Network> productionCompanies;

        @JsonProperty("production_countries")
        private List<ProductionCountry> productionCountries;
        private List<Season> seasons;

        @JsonProperty("spoken_languages")
        private List<SpokenLanguage> spokenLanguages;
        private String status;
        private String tagline;
        private String type;

        @JsonProperty("vote_average")
        private Double voteAverage;
        private Long voteCount;

        @Data
        public static class CreatedBy {
            private Long id;

            @JsonProperty("credit_id")
            private String creditID;
            private String name;
            private String originalName;
            private Long gender;
            private String profilePath;
        }

        @Data
        public static class GenreResponse {
            private List<Genre> genres;
        }

        @Data
        public static class Genre {
            private Long id;
            private String name;
        }

        @Data
        public static class LastEpisodeToAir {
            private Long id;
            private String name;
            private String overview;
            private Double voteAverage;
            private Long voteCount;
            private LocalDate airDate;
            private Long episodeNumber;
            private String episodeType;
            private String productionCode;
            private Long runtime;
            private Long seasonNumber;
            private Long showID;
            private String stillPath;
        }

        @Data
        public static class Network {
            private Long id;
            private String logoPath;
            private String name;
            private String originCountry;
        }

        @Data
        public static class ProductionCountry {
            private String iso3166_1;
            private String name;
        }

        @Data
        public static class Season {

            @JsonProperty("air_date")
            private LocalDate airDate;

            @JsonProperty("episode_count")
            private Long episodeCount;
            private Long id;
            private String name;
            private String overview;

            @JsonProperty("poster_path")
            private String posterPath;

            @JsonProperty("season_number")
            private Long seasonNumber;

            @JsonProperty("vote_average")
            private Long voteAverage;
        }

        @Data
        public static class SpokenLanguage {
            private String englishName;
            private String iso639_1;
            private String name;
        }

        @Data
        public static class SerieTrailerResult {
            private String iso639_1;
            private String iso3166_1;
            private String name;
            private String key;
            private String site;
            private Long size;
            private String type;
            private Boolean official;
            private OffsetDateTime publishedAt;
            private String id;
        }

        @Data
        public static class SerieTrailer {
            private Long id;
            private List<SerieTrailerResult> results;
        }

    }
}

