# ──────────────────────────────────────────────
# Stage 1: Build React/Vite app
# ──────────────────────────────────────────────
FROM node:23-alpine AS builder

WORKDIR /app

# Build-time args cho Vite env variables
ARG VITE_API_URL=http://localhost:5000
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ──────────────────────────────────────────────
# Stage 2: Serve với Nginx (ultra-lightweight)
# ──────────────────────────────────────────────
FROM nginx:1.27-alpine AS production

# Xóa config mặc định của nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copy Nginx config tuỳ chỉnh
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy static files từ builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
