package com.garmanaz.vidaria.utils;

import com.garmanaz.vidaria.entities.Movie;
import com.garmanaz.vidaria.entities.Serie;
import org.springframework.cache.CacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.JdkSerializationRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;


@Configuration
public class RedisConfig {
    @Bean
    public CacheManager cacheManager(RedisConnectionFactory redisConnectionFactory) {
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(100))
                .serializeValuesWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(new JdkSerializationRedisSerializer())
                );

        return RedisCacheManager.builder(redisConnectionFactory)
                .cacheDefaults(config)
                .build();
    }

    @Bean
    public RedisTemplate<String, Serie> serieRedisTemplate(RedisConnectionFactory redisConnectionFactory) {
        RedisTemplate<String, Serie> template = new RedisTemplate<>();
        template.setConnectionFactory(redisConnectionFactory);
        template.setKeySerializer(new StringRedisSerializer());

        // Usar el serializador nativo de Java
        template.setValueSerializer(new org.springframework.data.redis.serializer.JdkSerializationRedisSerializer());
        return template;
    }

    @Bean
    public RedisTemplate<String, Movie> movieRedisTemplate(RedisConnectionFactory redisConnectionFactory) {
        RedisTemplate<String, Movie> template = new RedisTemplate<>();
        template.setConnectionFactory(redisConnectionFactory);
        template.setKeySerializer(new StringRedisSerializer());

        // Usar el mismo serializador nativo de Java que las series
        template.setValueSerializer(new org.springframework.data.redis.serializer.JdkSerializationRedisSerializer());
        return template;
    }
}
