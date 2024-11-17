package com.garmanaz.vidaria.repositories.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@Configuration
@EnableJpaRepositories(basePackages = "com.garmanaz.vidaria.repositories")
public class JpaRepositoryConfig {
}
