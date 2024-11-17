package com.garmanaz.vidaria;

import com.garmanaz.vidaria.services.MovieService;
import com.garmanaz.vidaria.services.SerieService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class ApplicationStartupRunner implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(ApplicationStartupRunner.class);

    private final SerieService serieService;
    private final MovieService movieService;

    @Autowired
    public ApplicationStartupRunner(SerieService serieService, MovieService movieService) {
        this.serieService = serieService;
        this.movieService = movieService;
    }

    @Override
    public void run(String... args) {
        if (serieService == null || movieService == null) {
            logger.error("SerieService or MovieService is not properly initialized!");
            return;
        }

        try {
            logger.info("Starting to precache series...");
            serieService.preCacheSeries();
            logger.info("Series precaching completed.");

            logger.info("Starting to precache movies...");
            movieService.preCacheMovies();
            logger.info("Movies precaching completed.");
        } catch (Exception e) {
            logger.error("Error during precaching process", e);
        }
    }
}
