package com.garmanaz.vidaria.utils;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.module.paramnames.ParameterNamesModule;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;

public class RedisSerializerUtil {

    public static <T> Jackson2JsonRedisSerializer<T> createJacksonSerializer(Class<T> type) {
        // Configurar el ObjectMapper
        ObjectMapper objectMapper = new ObjectMapper()
                .registerModule(new JavaTimeModule()) // Manejo de tipos de fecha y hora
                .registerModule(new ParameterNamesModule()) // Soporte para parámetros de constructor
                .disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS); // Fechas en formato ISO

        // Crear el serializador pasando el ObjectMapper configurado
        Jackson2JsonRedisSerializer<T> serializer = new Jackson2JsonRedisSerializer<>(type);
        serializer.setObjectMapper(objectMapper); // Este método sigue siendo válido y funciona bien en la mayoría de versiones

        return serializer;
    }
}
