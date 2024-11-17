package com.garmanaz.vidaria.services;

import com.garmanaz.vidaria.DTO.SerieResponse;
import com.garmanaz.vidaria.entities.Genre;
import com.garmanaz.vidaria.entities.Serie;
import com.garmanaz.vidaria.repositories.SerieRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@Import(SerieService.class)
@EnableCaching
public class SerieServiceTest {

    @Mock
    private SerieRepository serieRepository;

    @Mock
    private RestTemplate res;

    @Mock
    private RedisTemplate<String, Serie> redisTemplate;

    @Mock
    private ValueOperations<String, Serie> valueOperations;

    @Mock
    private CacheManager cacheManager;

    @InjectMocks
    private SerieService serieService;

    @Value("${tmdb.api.key}")
    private String apiKey;

    @Value("${tmdb.api.url}")
    private String apiUrl;

    private Pageable pageable;

    @BeforeEach
    public void setUp() {

        lenient().when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        serieService.setAPI_KEY(apiKey);
        serieService.setApiUrl(apiUrl);
        pageable = PageRequest.of(0, 10);
    }


    @Test
    public void testGetGenres() {
        // Configura la respuesta simulada de la API
        SerieResponse.SerieDetails.GenreResponse genreResponse = new SerieResponse.SerieDetails.GenreResponse();
        SerieResponse.SerieDetails.GenreResponse.Genre genre1 = new SerieResponse.SerieDetails.GenreResponse.Genre();
        genre1.setId(1L);
        genre1.setName("Action");
        SerieResponse.SerieDetails.GenreResponse.Genre genre2 = new SerieResponse.SerieDetails.GenreResponse.Genre();
        genre2.setId(2L);
        genre2.setName("Drama");
        genreResponse.setGenres(List.of(genre1, genre2));

        // URL completa con la API_KEY y el endpoint de géneros
        String url = apiUrl + "/genre/tv/list?api_key=" + apiKey;

        // Configuración de la respuesta simulada en RestTemplate
        when(res.getForEntity(url, SerieResponse.SerieDetails.GenreResponse.class))
                .thenReturn(ResponseEntity.ok(genreResponse));

        // Llama al método getGenres y verifica el resultado
        List<Genre> genres = serieService.getGenres();

        // Validación de resultados
        assertEquals(2, genres.size());
        assertEquals("Action", genres.get(0).getName());
        assertEquals("Drama", genres.get(1).getName());

        // Verificación de la llamada en RestTemplate
        verify(res, times(1)).getForEntity(url, SerieResponse.SerieDetails.GenreResponse.class);
    }

    @Test
    public void testGetSerieDetails_FoundInCache() {
        Long id = 1L;
        String cacheKey = "serie:" + id;

        Serie cachedSerie = Serie.builder().id(id).poster("cached_image_url").build();

        // Configura el mock para devolver el objeto desde Redis
        when(valueOperations.get(cacheKey)).thenReturn(cachedSerie);

        // Llama al método
        Serie result = serieService.getSerieDetails(id);

        // Verificaciones
        assertNotNull(result);
        assertEquals(cachedSerie, result);
        verify(valueOperations, times(1)).get(cacheKey);
        verify(serieRepository, never()).findById(anyLong());
        verify(valueOperations, never()).set(anyString(), any(Serie.class), anyLong(), any(TimeUnit.class));
    }

    @Test
    public void testGetSerieDetails_FoundInDatabase() {
        Long id = 1L;
        String cacheKey = "serie:" + id;

        Serie dbSerie = Serie.builder().id(id).poster("db_image_url").build();

        // Configura el mock para devolver null desde Redis
        when(valueOperations.get(cacheKey)).thenReturn(null);
        // Configura el mock para devolver el objeto desde la base de datos
        when(serieRepository.findById(id)).thenReturn(Optional.of(dbSerie));

        // Llama al método
        Serie result = serieService.getSerieDetails(id);

        // Verificaciones
        assertNotNull(result);
        assertEquals(dbSerie, result);
        verify(valueOperations, times(1)).get(cacheKey);
        verify(serieRepository, times(1)).findById(id);
        verify(valueOperations, times(1)).set(eq(cacheKey), eq(dbSerie), eq(1L), eq(TimeUnit.DAYS));
    }

    @Test
    public void testSearchSeries_WithAllParameters() {

        String title = "Example Title";
        List<String> genres = List.of("Drama", "Action");
        LocalDate releaseDateFrom = LocalDate.of(2020, 1, 1);
        LocalDate releaseDateTo = LocalDate.of(2022, 12, 31);
        Double ratingFrom = 7.0;
        Double ratingTo = 9.0;
        Double popularityFrom = 50.0;
        Double popularityTo = 100.0;


        Serie serie1 = new Serie();
        serie1.setId(1L);
        serie1.setTitle("Example Title 1");
        serie1.setRating(8.5);

        Serie serie2 = new Serie();
        serie2.setId(2L);
        serie2.setTitle("Example Title 2");
        serie2.setRating(8.0);


        Page<Serie> expectedPage = new PageImpl<>(List.of(serie1, serie2), pageable, 2);


        when(serieRepository.searchSeries(title, genres, releaseDateFrom, releaseDateTo, ratingFrom, ratingTo, popularityFrom, popularityTo, pageable))
                .thenReturn(expectedPage);


        Page<Serie> resultPage = serieService.searchSeries(title, genres, releaseDateFrom, releaseDateTo, ratingFrom, ratingTo, popularityFrom, popularityTo, pageable);


        assertEquals(2, resultPage.getTotalElements());
        assertEquals("Example Title 1", resultPage.getContent().get(0).getTitle());
        assertEquals("Example Title 2", resultPage.getContent().get(1).getTitle());


        verify(serieRepository, times(1)).searchSeries(title, genres, releaseDateFrom, releaseDateTo, ratingFrom, ratingTo, popularityFrom, popularityTo, pageable);
    }
}
