# Imagen base de Node.js
FROM node:22

# Configurar el directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el código fuente
COPY . .

# Construir el proyecto
RUN npm run build

# Instalar un servidor web para servir el frontend (por ejemplo, `serve`)
RUN npm install -g serve

# Exponer el puerto 5173
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["serve", "-s", "dist", "-l", "5173"]
