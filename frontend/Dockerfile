# Placeholder Dockerfile for Frontend

FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Add a web server for serving static files later, e.g., nginx
