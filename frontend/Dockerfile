# Usar una imagen base de Node.js para desarrollo
FROM node:20.17.0 as dev

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar solo package.json y package-lock.json (si lo tienes) para aprovechar la cache de Docker
COPY package*.json ./

# Eliminar cache de npm para evitar posibles problemas de dependencias
RUN npm cache clean --force

# Instalar dependencias
RUN npm install

# Copiar el resto del código fuente
COPY . .

# Exponer el puerto de desarrollo (3000 para React con Vite)
EXPOSE 3000

# Comando por defecto para el entorno de desarrollo
CMD ["npm", "run", "dev"]
