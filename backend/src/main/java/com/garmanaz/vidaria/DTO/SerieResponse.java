package com.garmanaz.vidaria.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.garmanaz.vidaria.entities.Genre;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

@Data
@Schema(description = "Response object for series")
public class SerieResponse {

    @Schema(description = "Current page number", example = "1")
    private Long page;

    @Schema(description = "List of series results")
    private List<Result> results;

    @Schema(description = "Total number of pages", example = "10")
    private Long totalPages;

    @Schema(description = "Total number of results", example = "200")
    private Long totalResults;

    @Data
    @Schema(description = "Details of a single series result")
    public static class Result {

        @Schema(description = "Indicates if the series is for adults", example = "false")
        private Boolean adult;

        @JsonProperty("backdrop_path")
        @Schema(description = "Path to the backdrop image", example = "/path/to/backdrop.jpg")
        private String backdropPath;

        @JsonProperty("genre_ids")
        @Schema(description = "List of genre IDs associated with the series", example = "[18, 35]")
        private List<Long> genreIDS;

        @Schema(description = "Unique ID of the series", example = "123")
        private Long id;

        @JsonProperty("original_language")
        @Schema(description = "Original language of the series", example = "en")
        private String originalLanguage;

        @JsonProperty("original_name")
        @Schema(description = "Original name of the series", example = "Original Series Name")
        private String originalName;

        @Schema(description = "Overview or description of the series", example = "A thrilling series...")
        private String overview;

        @Schema(description = "Popularity score of the series", example = "123.45")
        private Double popularity;

        @JsonProperty("poster_path")
        @Schema(description = "Path to the poster image", example = "/path/to/poster.jpg")
        private String posterPath;

        @JsonProperty("first_air_date")
        @Schema(description = "First air date of the series", example = "2022-01-01")
        private LocalDate firstAirDate;

        @Schema(description = "Name of the series", example = "Series Name")
        private String name;

        @Schema(description = "Indicates if the series is a video", example = "false")
        private Boolean video;

        @JsonProperty("vote_average")
        @Schema(description = "Average vote score for the series", example = "8.5")
        private Double voteAverage;

        @JsonProperty("vote_count")
        @Schema(description = "Total number of votes for the series", example = "1000")
        private Long voteCount;
    }

    @Data
    @Schema(description = "Detailed information about a series")
    public static class SerieDetails {

        @Schema(description = "Indicates if the series is for adults", example = "false")
        private Boolean adult;

        @JsonProperty("backdrop_path")
        @Schema(description = "Path to the backdrop image", example = "/path/to/backdrop.jpg")
        private String backdropPath;

        @JsonProperty("created_by")
        @Schema(description = "List of creators of the series")
        private List<CreatedBy> createdBy;

        @JsonProperty("episode_run_time")
        @Schema(description = "List of episode runtimes in minutes", example = "[42, 50]")
        private List<Long> episodeRunTime;

        @JsonProperty("first_air_date")
        @Schema(description = "First air date of the series", example = "2022-01-01")
        private LocalDate firstAirDate;

        @Schema(description = "List of genres associated with the series")
        private List<Genre> genres;

        @Schema(description = "Homepage URL of the series", example = "https://example.com")
        private String homepage;

        @Schema(description = "Unique ID of the series", example = "123")
        private Long id;

        @Schema(description = "Indicates if the series is in production", example = "true")
        private Boolean inProduction;

        @Schema(description = "List of spoken languages", example = "[\"en\", \"es\"]")
        private List<String> languages;

        @Schema(description = "Last air date of the series", example = "2023-12-31")
        private LocalDate lastAirDate;

        @Schema(description = "Details of the last episode to air")
        private LastEpisodeToAir lastEpisodeToAir;

        @Schema(description = "Name of the series", example = "Series Name")
        private String name;

        @Schema(description = "Details of the next episode to air")
        private Object nextEpisodeToAir;

        @Schema(description = "List of networks associated with the series")
        private List<Network> networks;

        @JsonProperty("number_of_episodes")
        @Schema(description = "Total number of episodes in the series", example = "24")
        private Long numberOfEpisodes;

        @JsonProperty("number_of_seasons")
        @Schema(description = "Total number of seasons in the series", example = "2")
        private Long numberOfSeasons;

        @Schema(description = "List of countries where the series originated", example = "[\"US\"]")
        private List<String> originCountry;

        @Schema(description = "Original language of the series", example = "en")
        private String originalLanguage;

        @Schema(description = "Original name of the series", example = "Original Series Name")
        private String originalName;

        @Schema(description = "Overview or description of the series", example = "A thrilling series...")
        private String overview;

        @Schema(description = "Popularity score of the series", example = "123.45")
        private Double popularity;

        @JsonProperty("poster_path")
        @Schema(description = "Path to the poster image", example = "/path/to/poster.jpg")
        private String posterPath;

        @JsonProperty("production_companies")
        @Schema(description = "List of production companies associated with the series")
        private List<Network> productionCompanies;

        @JsonProperty("production_countries")
        @Schema(description = "List of production countries for the series")
        private List<ProductionCountry> productionCountries;

        @Schema(description = "List of seasons in the series")
        private List<Season> seasons;

        @JsonProperty("spoken_languages")
        @Schema(description = "List of spoken languages in the series")
        private List<SpokenLanguage> spokenLanguages;

        @Schema(description = "Current status of the series", example = "Running")
        private String status;

        @Schema(description = "Tagline of the series", example = "An epic adventure")
        private String tagline;

        @Schema(description = "Type of the series", example = "Drama")
        private String type;

        @JsonProperty("vote_average")
        @Schema(description = "Average vote score for the series", example = "8.5")
        private Double voteAverage;

        @Schema(description = "Total number of votes for the series", example = "1000")
        private Long voteCount;

        @Data
        @Schema(description = "Details of a creator of the series")
        public static class CreatedBy {
            @Schema(description = "Creator ID", example = "1")
            private Long id;

            @JsonProperty("credit_id")
            @Schema(description = "Credit ID of the creator", example = "12345")
            private String creditID;

            @Schema(description = "Name of the creator", example = "John Doe")
            private String name;

            @Schema(description = "Original name of the creator", example = "John Doe")
            private String originalName;

            @Schema(description = "Gender of the creator", example = "1")
            private Long gender;

            @Schema(description = "Profile path of the creator", example = "/path/to/profile.jpg")
            private String profilePath;
        }


        @Data
        @Schema(description = "Details of a genre response")
        public static class GenreResponse {
            private List<Genre> genres;

            @Data
            @AllArgsConstructor
            @NoArgsConstructor
            @Schema(description = "Details of a genre")
            public static class Genre {

                @Schema(description = "Genre ID", example = "1")
                private Long id;

                @Schema(description = "Name of the genre", example = "Drama")
                private String name;
            }
        }

        @Data
        @Schema(description = "Details of a genre")
        public static class Genre {

            @Schema(description = "Genre ID", example = "1")
            private Long id;

            @Schema(description = "Name of the genre", example = "Drama")
            private String name;
        }

        @Data
        @Schema(description = "Details of the last episode to air")
        public static class LastEpisodeToAir {
            @Schema(description = "ID of the episode", example = "1001")
            private Long id;

            @Schema(description = "Name of the episode", example = "Finale")
            private String name;

            @Schema(description = "Overview of the episode", example = "An epic conclusion...")
            private String overview;

            @Schema(description = "Vote average for the episode", example = "9.0")
            private Double voteAverage;

            @Schema(description = "Vote count for the episode", example = "500")
            private Long voteCount;

            @Schema(description = "Air date of the episode", example = "2023-12-31")
            private LocalDate airDate;

            @Schema(description = "Episode number", example = "10")
            private Long episodeNumber;

            @Schema(description = "Episode type", example = "Finale")
            private String episodeType;

            @Schema(description = "Production code for the episode", example = "S1E10")
            private String productionCode;

            @Schema(description = "Runtime of the episode in minutes", example = "45")
            private Long runtime;

            @Schema(description = "Season number of the episode", example = "1")
            private Long seasonNumber;

            @Schema(description = "Show ID", example = "123")
            private Long showID;

            @Schema(description = "Path to the still image", example = "/path/to/still.jpg")
            private String stillPath;
        }

        @Data
        @Schema(description = "Details of a network")
        public static class Network {
            @Schema(description = "Network ID", example = "1")
            private Long id;

            @Schema(description = "Logo path of the network", example = "/path/to/logo.jpg")
            private String logoPath;

            @Schema(description = "Name of the network", example = "Netflix")
            private String name;

            @Schema(description = "Country of origin", example = "US")
            private String originCountry;
        }

        @Data
        @Schema(description = "Details of a production country")
        public static class ProductionCountry {
            @Schema(description = "ISO code of the country", example = "US")
            private String iso3166_1;

            @Schema(description = "Name of the country", example = "United States")
            private String name;
        }

        @Data
        @Schema(description = "Details of a spoken language")
        public static class SpokenLanguage {
            @Schema(description = "Name of the language", example = "English")
            private String name;

            @Schema(description = "ISO 639-1 code", example = "en")
            private String iso639_1;

            @Schema(description = "English name of the language", example = "English")
            private String englishName;
        }

        @Data
        @Schema(description = "Details of a season")
        public static class Season {
            @JsonProperty("air_date")
            @Schema(description = "Air date of the season", example = "2022-01-01")
            private LocalDate airDate;

            @JsonProperty("episode_count")
            @Schema(description = "Number of episodes in the season", example = "10")
            private Long episodeCount;

            @Schema(description = "Season ID", example = "100")
            private Long id;

            @Schema(description = "Season name", example = "Season 1")
            private String name;

            @Schema(description = "Overview of the season", example = "The beginning of the story...")
            private String overview;

            @JsonProperty("poster_path")
            @Schema(description = "Path to the season poster", example = "/path/to/poster.jpg")
            private String posterPath;

            @JsonProperty("season_number")
            @Schema(description = "Season number", example = "1")
            private Long seasonNumber;

            @JsonProperty("vote_average")
            @Schema(description = "Vote average for the season", example = "8.5")
            private Long voteAverage;
        }

        @Data
        @Schema(description = "Details of a series trailer result")
        public static class SerieTrailerResult {
            @Schema(description = "ISO 639-1 code", example = "en")
            private String iso639_1;

            @Schema(description = "ISO 3166-1 code", example = "US")
            private String iso3166_1;

            @Schema(description = "Name of the trailer", example = "Official Trailer")
            private String name;

            @Schema(description = "Key for accessing the trailer", example = "abcd1234")
            private String key;

            @Schema(description = "Site hosting the trailer", example = "YouTube")
            private String site;

            @Schema(description = "Resolution size of the trailer", example = "1080")
            private Long size;

            @Schema(description = "Type of the trailer", example = "Teaser")
            private String type;

            @Schema(description = "Indicates if the trailer is official", example = "true")
            private Boolean official;

            @Schema(description = "Publish date of the trailer", example = "2022-01-01T12:00:00Z")
            private OffsetDateTime publishedAt;

            @Schema(description = "Trailer ID", example = "xyz123")
            private String id;
        }

        @Data
        @Schema(description = "Details of a series trailer")
        public static class SerieTrailer {
            @Schema(description = "Unique ID of the trailer", example = "12345")
            private Long id;

            @Schema(description = "List of trailer results")
            private List<SerieTrailerResult> results;
        }
    }
}
