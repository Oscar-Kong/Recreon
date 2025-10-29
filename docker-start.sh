#!/bin/bash

echo "🐳 Starting Recreon Docker Services..."
echo ""

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
  echo "⚠️  backend/.env not found!"
  echo "   Run ./setup-env.sh first"
  exit 1
fi

# Start services
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check service status
echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "✅ Services started successfully!"
echo ""
echo "🔗 Service URLs:"
echo "   Backend API:  http://localhost:5001"
echo "   Database:     localhost:5432"
echo "   Redis:        localhost:6379"
echo ""
echo "📝 Useful commands:"
echo "   View logs:     docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Restart:       docker-compose restart"
echo ""

