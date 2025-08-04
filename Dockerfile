# Build du frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend

# Copier package.json et package-lock.json
COPY frontend/package*.json ./

# Installer les dépendances avec npm ci pour plus de stabilité
RUN npm ci || npm install

# Copier le reste du code
COPY frontend/ ./

# Variables d'environnement
ENV REACT_APP_API_URL=/api
ENV CI=true

# Build avec node directement pour éviter les problèmes de permissions
RUN node node_modules/react-scripts/bin/react-scripts.js build

# Backend + servir le frontend
FROM node:18-alpine
WORKDIR /app

# Installer les dépendances du backend
COPY backend/package*.json ./
RUN npm ci --only=production || npm install --production

# Copier le code du backend
COPY backend/ ./

# Copier le build du frontend
COPY --from=frontend-build /app/frontend/build ./public

# Exposer le port
EXPOSE 3001

# Démarrer l'application
CMD ["node", "server.js"]
