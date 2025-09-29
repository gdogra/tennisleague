# Multi-stage Dockerfile for static React app

# 1) Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci || npm install
COPY . .
RUN npm run build

# 2) Runtime stage using Nginx
FROM node:18-alpine AS runner
WORKDIR /app
RUN npm i -g serve
COPY --from=builder /app/dist ./dist

# Render sets PORT; default to 3000 for local runs
ENV PORT=3000
EXPOSE 3000
CMD ["sh", "-c", "serve -s dist -l ${PORT:-3000}"]
