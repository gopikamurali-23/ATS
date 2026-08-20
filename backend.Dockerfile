FROM node:20-alpine

WORKDIR /app

# Copy package descriptors first to cache dependencies
COPY backend/package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy Prisma schema and generate client
COPY backend/prisma ./prisma
RUN npx prisma generate

# Copy application source code
COPY backend/src ./src

# Expose port (defaults to 8080 in container, mapping to environment variable)
EXPOSE 8080

CMD ["node", "src/app.js"]
