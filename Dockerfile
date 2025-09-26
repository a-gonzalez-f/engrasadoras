# Imagen base
FROM node:22

# Crear carpeta de la app
WORKDIR /usr/src/app

# Copiar package.json e instalar dependencias
COPY package*.json ./
RUN npm install --omit=dev

# Copiar el código
COPY . /appx

# Exponer el puerto de tu servidor
EXPOSE 3000

# Comando para arrancar
CMD ["npm", "start"]
