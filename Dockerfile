# Build du frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
# Installation avec plus de droits
RUN npm ci --only=production || npm install
COPY frontend/ ./
ENV REACT_APP_API_URL=/api
# Alternative: utiliser npx pour éviter les problèmes de permissions
RUN npx react-scripts build

# Backend + servir le frontend
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install --production
COPY backend/ ./
COPY --from=frontend-build /app/frontend/build ./public

EXPOSE 3001
CMD ["node", "server.js"]
