# Imagen base de Node.js
FROM node:22

# Configuración del directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer el puerto 5000
EXPOSE 5000

# Comando para iniciar el backend
CMD ["node", "server.js"]
