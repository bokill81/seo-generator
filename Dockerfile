# Build du frontend
FROM node:18-alpine as frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
ENV REACT_APP_API_URL=/api
RUN chmod +x node_modules/.bin/react-scripts
RUN npm run build

# Backend + servir le frontend
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install --production
COPY backend/ ./
COPY --from=frontend-build /app/frontend/build ./public

EXPOSE 3001
CMD ["node", "server.js"]