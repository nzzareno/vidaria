package com.garmanaz.vidaria;

import com.garmanaz.vidaria.services.MovieService;
import com.garmanaz.vidaria.services.SerieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class ApplicationStartupRunner implements CommandLineRunner {

    private final SerieService serieService;
    private final MovieService movieService;

    @Autowired
    public ApplicationStartupRunner(SerieService serieService, MovieService movieService) {
        this.serieService = serieService;
        this.movieService = movieService;
    }

    @Override
    public void run(String... args) {
        try {
            serieService.preCacheSeriesImages();
            movieService.preCacheMoviesImages();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
