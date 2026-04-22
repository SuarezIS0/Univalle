FROM node:20-alpine

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar el resto del código
COPY . .

# Build de Next.js
RUN npm run build

# Exponer el puerto
EXPOSE 3000

# Iniciar la aplicación
CMD ["npm", "start"]
