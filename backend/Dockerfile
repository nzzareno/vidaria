# Usar una imagen base de Amazon Corretto 21
FROM eclipse-temurin:21

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar el archivo JAR generado al contenedor
COPY target/vidaria-0.0.1-SNAPSHOT.jar /app/vidaria.jar


# Exponer el puerto en el que correrá Spring Boot
EXPOSE 8081

# Comando para ejecutar la aplicación
ENTRYPOINT ["java", "-jar", "/app/vidaria.jar"]
