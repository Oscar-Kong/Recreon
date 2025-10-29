#!/bin/bash

echo "🚀 Setting up Recreon environment files..."

# Create backend/.env if it doesn't exist
if [ ! -f "backend/.env" ]; then
  echo "📝 Creating backend/.env..."
  cat > backend/.env << 'EOF'
# Recreon Backend Environment Variables
NODE_ENV=development
PORT=5001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/recreon?schema=public
JWT_SECRET=recreon-dev-secret-key-please-change-in-production-2024
REDIS_URL=redis://localhost:6379

# Cloudinary Configuration (optional)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
EOF
  echo "✅ Created backend/.env"
else
  echo "⏭️  backend/.env already exists, skipping..."
fi

# Create root .env if it doesn't exist
if [ ! -f ".env" ]; then
  echo "📝 Creating root .env for Docker..."
  cat > .env << 'EOF'
# Recreon Docker Environment Variables
JWT_SECRET=recreon-dev-secret-key-please-change-in-production-2024

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
EOF
  echo "✅ Created .env"
else
  echo "⏭️  .env already exists, skipping..."
fi

echo ""
echo "✨ Environment setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Review backend/.env and update if needed"
echo "   2. Run: docker-compose up -d"
echo "   3. Visit: http://localhost:5001/health"
echo ""

