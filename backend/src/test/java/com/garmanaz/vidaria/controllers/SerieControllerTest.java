package com.garmanaz.vidaria.controllers;

import com.garmanaz.vidaria.entities.Genre;
import com.garmanaz.vidaria.entities.Serie;
import com.garmanaz.vidaria.services.SerieService;
import com.garmanaz.vidaria.utils.JWT.JwtTokenUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WithMockUser(username = "admin")
@WebMvcTest(SerieController.class)
public class SerieControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SerieService serieService;

    @MockBean
    private JwtTokenUtil jwtTokenUtil;

    @MockBean
    private RestTemplateBuilder restTemplateBuilder;

    @Test
    void getSerieByIdSimplifiedTest() throws Exception {
        Long id = 1L;
        Serie mockSerie = Serie.builder()
                .id(id)
                .title("Test Serie")
                .build();

        // Configura el mock
        when(serieService.getSeriesById(id)).thenReturn(mockSerie);

        // Realiza la solicitud y verifica
        mockMvc.perform(get("/series/{id}", id)
                        .contentType("application/json"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id))
                .andExpect(jsonPath("$.title").value("Test Serie"));

        // Verifica que el método getSeriesById fue invocado
        verify(serieService, times(1)).getSeriesById(id);
    }

    @Test
    public void getSeriesByGenreTest() throws Exception {
        List<Genre> genres = List.of(Genre.builder().id(1L).name("Drama").build());
        Genre genre = genres.getFirst();

        Serie mockSerie = Serie.builder()
                .id(1L)
                .title("Test Serie")
                .genreID(genres)
                .build();

        when(serieService.getSeriesByGenre(genre.getName())).thenReturn(List.of(mockSerie));

        mockMvc.perform(get("/series/genre/{genre}", genre.getName())
                        .contentType("application/json"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].title").value("Test Serie"));

        verify(serieService, times(1)).getSeriesByGenre(genre.getName());
    }


    @Test
    void checkIfSerieExistsTest() throws Exception {
        Long id = 1L;

        when(serieService.existsById(id)).thenReturn(true);

        mockMvc.perform(get("/series/check/{id}", id))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(true));

        verify(serieService, times(1)).existsById(id);
    }

    @Test
    void searchSerieTest() throws Exception {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Serie> seriesPage = new PageImpl<>(List.of(
                Serie.builder().id(1L).title("Serie 1").build(),
                Serie.builder().id(2L).title("Serie 2").build()
        ));

        // Ajusta todos los argumentos como matchers
        when(serieService.searchSeries(
                eq("Test"),       // Matcher para el título
                isNull(),         // Matcher para géneros
                isNull(),         // Matcher para releaseDateFrom
                isNull(),         // Matcher para releaseDateTo
                isNull(),         // Matcher para ratingFrom
                isNull(),         // Matcher para ratingTo
                isNull(),         // Matcher para popularityFrom
                isNull(),         // Matcher para popularityTo
                any(Pageable.class) // Matcher para pageable
        )).thenReturn(seriesPage);

        // Realiza la solicitud al endpoint
        mockMvc.perform(get("/series/search")
                        .param("title", "Test")
                        .param("page", "0")
                        .param("size", "10"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(1))
                .andExpect(jsonPath("$.content[0].title").value("Serie 1"))
                .andExpect(jsonPath("$.content[1].id").value(2))
                .andExpect(jsonPath("$.content[1].title").value("Serie 2"));

        // Verifica la llamada al servicio
        verify(serieService, times(1)).searchSeries(
                eq("Test"),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                eq(pageable)
        );
    }



    @Test
    void getBestSeriesByGenresTest() throws Exception {
        Pageable pageable = PageRequest.of(0, 10);
        String genre = "Action";
        Page<Serie> seriesPage = new PageImpl<>(List.of(
                Serie.builder().id(1L).title("Serie 1").build(),
                Serie.builder().id(2L).title("Serie 2").build()
        ));

        when(serieService.getBestSeriesByGenres(eq(genre), eq(pageable))).thenReturn(seriesPage);

        mockMvc.perform(get("/series/best/{genre}", genre)
                        .param("page", "0")
                        .param("size", "10"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].title").value("Serie 1"))
                .andExpect(jsonPath("$.content[1].title").value("Serie 2"));

        verify(serieService, times(1)).getBestSeriesByGenres(eq(genre), eq(pageable));
    }

    @Test
    void getSeriesTest() throws Exception {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Serie> seriesPage = new PageImpl<>(List.of(
                Serie.builder().id(1L).title("Serie 1").build(),
                Serie.builder().id(2L).title("Serie 2").build()
        ));

        when(serieService.getSeries(eq(pageable))).thenReturn(seriesPage);

        mockMvc.perform(get("/series")
                        .param("page", "0")
                        .param("size", "10"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].title").value("Serie 1"))
                .andExpect(jsonPath("$.content[1].title").value("Serie 2"));

        verify(serieService, times(1)).getSeries(eq(pageable));
    }

    @Test
    void getMostPopularAndTopRatedTest() throws Exception {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Serie> seriesPage = new PageImpl<>(List.of(
                Serie.builder().id(1L).title("Serie 1").build(),
                Serie.builder().id(2L).title("Serie 2").build()
        ));

        when(serieService.getMostPopularAndTopRated(eq(pageable))).thenReturn(seriesPage);

        mockMvc.perform(get("/series/most-popular")
                        .param("page", "0")
                        .param("size", "10"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].title").value("Serie 1"))
                .andExpect(jsonPath("$.content[1].title").value("Serie 2"));

        verify(serieService, times(1)).getMostPopularAndTopRated(eq(pageable));
    }
}