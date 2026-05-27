# ──────────────────────────────────────────────
# Stage 1: Build TypeScript → JavaScript
# ──────────────────────────────────────────────
FROM node:23-alpine AS builder

WORKDIR /app

# Cài dependencies (tận dụng Docker layer cache)
COPY package*.json ./
RUN npm ci

# Sao chép toàn bộ source và build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ──────────────────────────────────────────────
# Stage 2: Production image (chỉ chứa dist)
# ──────────────────────────────────────────────
FROM node:23-alpine AS production

WORKDIR /app

# Chỉ cài production dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy built artifacts từ builder
COPY --from=builder /app/dist ./dist

# Thư mục uploads (file người dùng)
RUN mkdir -p uploads

# Chạy với user non-root để bảo mật
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 5000

CMD ["node", "dist/index.js"]

