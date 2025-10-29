# ========================================
# Recreon Backend Dockerfile
# ========================================
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    bash \
    postgresql-client \
    curl

# Copy package files first (better caching)
COPY package*.json ./

# Install dependencies
RUN npm install --production=false

# Copy Prisma schema
COPY prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Expose port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:5001/health || exit 1

# Create startup script with better error handling
RUN echo '#!/bin/bash\n\
set -e\n\
\n\
echo "🚀 Starting Recreon Backend..."\n\
echo ""\n\
\n\
# Wait for database with timeout\n\
echo "⏳ Waiting for database..."\n\
RETRIES=30\n\
until pg_isready -h database -p 5432 -U postgres > /dev/null 2>&1 || [ $RETRIES -eq 0 ]; do\n\
  echo "   Waiting for database, $((RETRIES--)) remaining attempts..."\n\
  sleep 1\n\
done\n\
\n\
if [ $RETRIES -eq 0 ]; then\n\
  echo "❌ Database connection timeout!"\n\
  exit 1\n\
fi\n\
\n\
echo "✅ Database is ready!"\n\
echo ""\n\
\n\
# Run migrations\n\
echo "🔄 Running Prisma migrations..."\n\
npx prisma migrate deploy || {\n\
  echo "⚠️  Migration failed, but continuing..."\n\
}\n\
echo ""\n\
\n\
# Generate Prisma client (in case it was not generated)\n\
echo "🔧 Generating Prisma client..."\n\
npx prisma generate\n\
echo ""\n\
\n\
# Seed database (optional, comment out if not needed)\n\
# echo "🌱 Seeding database..."\n\
# npm run prisma:seed || echo "⚠️  Seeding failed or already seeded"\n\
# echo ""\n\
\n\
# Start server\n\
echo "🎯 Starting server on port ${PORT:-5001}..."\n\
echo ""\n\
npm run dev\n\
' > /app/start.sh && chmod +x /app/start.sh

# Use bash to run the script
CMD ["/bin/bash", "/app/start.sh"]