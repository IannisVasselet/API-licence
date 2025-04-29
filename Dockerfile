# Stage de build
FROM node:18-alpine AS build

WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances
RUN npm ci

# Copie du reste des fichiers
COPY . .

# Build de l'application
RUN npm run build

# Stage de production
FROM node:18-alpine AS production

WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances de production uniquement
RUN npm ci --only=production

# Copie des fichiers compilés depuis l'étape de build
COPY --from=build /app/dist ./dist

# Exposition du port
EXPOSE 3000

# Définition de l'utilisateur non-root
USER node

# Commande de démarrage
CMD ["node", "dist/index.js"] 