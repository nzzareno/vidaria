# Vidaria

Vidaria is an innovative web application designed for movie and series lovers. With Vidaria, you can explore detailed descriptions, read reviews, discover similar content, find streaming platforms, and stay up-to-date with the latest releases—all while enjoying a seamless and visually appealing experience.

Vidaria es una aplicación web innovadora diseñada para los amantes del cine y las series. Con Vidaria, puedes explorar descripciones detalladas, leer reseñas, descubrir contenido similar, encontrar plataformas de streaming donde mirar, y mantenerte al día con los últimos estrenos. Todo esto mientras disfrutas de una experiencia fluida y visualmente atractiva.

## Key Features / Características Principales

- ✨ **Movie and Series Exploration / Exploración de Películas y Series**: Find detailed information about your favorite content / Encuentra información detallada sobre tus contenidos favoritos.
- 🌟 **Reviews and Ratings / Reseñas y Valoraciones**: Check user opinions and share yours / Consulta opiniones de otros usuarios y comparte las tuyas.
- 📊 **Similar Content / Contenido Similar**: Discover recommendations based on your preferences / Descubre recomendaciones basadas en lo que te gusta.
- 🎥 **Streaming Platforms / Plataformas de Streaming**: Find where to watch your content / Accede a información sobre dónde ver el contenido.
- ⏳ **Real-Time Notifications / Notificaciones en Tiempo Real**: Receive instant updates with WebSockets / Recibe actualizaciones instantáneas mediante WebSockets.
- 🔒 **Security / Seguridad**: Authentication with JWT and Spring Security / Autenticación mediante JWT con Spring Security.

## Technologies Used / Tecnologías Utilizadas

- **Backend**: Spring Boot, Spring Data JPA, Spring Security, JWT, WebSockets.
- **Frontend**: React.js, TailwindCSS, Framer Motion, React Spinners, React Icons.
- **Database / Base de Datos**: PostgreSQL.
- **Cache**: Redis.
- **Containers / Contenedores**: Docker.

---

## Prerequisites / Requisitos Previos

To run Vidaria locally, make sure you have the following installed / Para ejecutar Vidaria localmente, necesitas tener instalados:

- **Java 21**
- **Maven**
- **Node.js** and **npm** (or Yarn) for the frontend / y **npm** (o Yarn) para el frontend.
- **Docker** for containers / para contenedores.

---

## Setup and Run / Configuración y Ejecución

### Clone the Repository / Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/vidaria.git
cd vidaria
```

### Using Docker / Usando Docker

The easiest way to run Vidaria is with Docker Compose / La forma más sencilla de ejecutar Vidaria es mediante Docker Compose:

1. Make sure Docker is running / Asegúrate de que Docker esté en funcionamiento.
2. Run the following command / Ejecuta el siguiente comando:
   ```bash
   docker-compose up --build
   ```
3. Access the following URLs once the services are running / Accede a las siguientes URL una vez que los servicios estén en ejecución:
   - **Backend**: [http://localhost:8081](http://localhost:8081)
   - **Frontend**: [http://localhost:3000](http://localhost:3000)

### Manual Execution / Ejecución Manual

#### Backend (Spring Boot)

1. Go to the `backend` folder / Dirígete a la carpeta `backend`:
   ```bash
   cd backend
   ```
2. Build the project / Compila el proyecto:
   ```bash
   mvn clean package
   ```
3. Run the application / Ejecuta la aplicación:
   ```bash
   java -jar target/vidaria-0.0.1-SNAPSHOT.jar
   ```

#### Frontend (React.js)

1. Go to the `frontend` folder / Dirígete a la carpeta `frontend`:
   ```bash
   cd frontend
   ```
2. Install dependencies / Instala las dependencias:
   ```bash
   npm install
   ```
3. Start the development server / Ejecuta el servidor de desarrollo:
   ```bash
   npm start
   ```
4. Open your browser at / Abre tu navegador en [http://localhost:3000](http://localhost:3000).

---

## Environment Variables / Variables de Entorno

Make sure to configure the following environment variables / Asegúrate de configurar las siguientes variables de entorno:

### Backend

- `SPRING_DATASOURCE_URL`: PostgreSQL connection URL / URL de conexión a PostgreSQL.
- `SPRING_DATASOURCE_USERNAME`: Database user / Usuario de la base de datos.
- `SPRING_DATASOURCE_PASSWORD`: Database password / Contraseña de la base de datos.
- `SPRING_REDIS_HOST`: Redis server host / Host del servidor Redis.
- `SPRING_REDIS_PORT`: Redis server port / Puerto del servidor Redis.

### Frontend

- `REACT_APP_API_URL`: Backend URL (e.g., `http://localhost:8081`) / URL del backend (por ejemplo, `http://localhost:8081`).

---

## Deployment on Railway / Despliegue en Railway

1. **Connect your repository to Railway** / Conecta tu repositorio a Railway.
2. Railway will automatically detect services if you include `Dockerfile` and `docker-compose.yml` files / Railway detectará automáticamente los servicios si incluyes los archivos `Dockerfile` y `docker-compose.yml`.
3. Configure the necessary environment variables on Railway / Configura las variables de entorno necesarias en Railway para que coincidan con las definidas arriba.

---

## Contributions / Contribuciones

If you want to contribute to the project, submit a pull request or open an issue in the repository / Si deseas contribuir al proyecto, envía un pull request o abre un issue en el repositorio.

---

## License / Licencia

Vidaria is licensed under the MIT License. See the `LICENSE` file for more details / Vidaria está licenciada bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.

