# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache python3 make g++ bash postgresql-client

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy Prisma schema
COPY prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

EXPOSE 5001

# Create a startup script
RUN echo '#!/bin/sh\n\
  echo "Waiting for database..."\n\
  while ! pg_isready -h database -p 5432 -U postgres; do\n\
  sleep 1\n\
  done\n\
  echo "Database is ready!"\n\
  echo "Running Prisma migrations..."\n\
  npx prisma migrate deploy\n\
  echo "Starting server..."\n\
  npm run dev' > /app/start.sh && chmod +x /app/start.sh

CMD ["/app/start.sh"]