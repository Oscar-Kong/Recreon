# 🐳 Recreon Docker Setup Guide

This guide will help you set up and run the Recreon backend using Docker.

## 📋 Prerequisites

- **Docker Desktop** installed ([Download here](https://www.docker.com/products/docker-desktop))
- **Node.js** (for React Native frontend development)

## 🚀 Quick Start

### 1. Start All Services

```bash
docker-compose up -d
```

This will start:
- ✅ PostgreSQL database (port 5432)
- ✅ Redis cache (port 6379)
- ✅ Backend API server (port 5001)

### 2. Check Service Status

```bash
docker-compose ps
```

You should see:
```
NAME                IMAGE               STATUS
recreon-backend     backend             Up
recreon-db          postgres:16-alpine  Up (healthy)
recreon-redis       redis:7-alpine      Up
```

### 3. View Logs

```bash
# All services
docker-compose logs -f

# Just backend
docker-compose logs -f backend

# Just database
docker-compose logs -f database
```

### 4. Test the API

Open your browser or use curl:

```bash
# Health check
curl http://localhost:5001/health

# API test
curl http://localhost:5001/api/test
```

## 🛠️ Common Commands

### Start Services

```bash
# Start in background
docker-compose up -d

# Start with logs visible
docker-compose up

# Start specific service
docker-compose up -d database
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes database data)
docker-compose down -v

# Stop specific service
docker-compose stop backend
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Rebuild After Code Changes

```bash
# Rebuild and restart backend
docker-compose up -d --build backend

# Rebuild everything
docker-compose up -d --build
```

## 🗄️ Database Management

### Run Prisma Migrations

```bash
# Inside Docker container
docker-compose exec backend npx prisma migrate deploy

# Or locally (if you have Node.js installed)
cd backend
npx prisma migrate dev
```

### Access Database Directly

```bash
# Connect to PostgreSQL
docker-compose exec database psql -U postgres -d recreon

# Common SQL commands:
# \dt              - List all tables
# \d users         - Describe users table
# SELECT * FROM "User"; - Query users
# \q               - Quit
```

### View Database with Prisma Studio

```bash
# Option 1: Run from host (recommended)
cd backend
npx prisma studio

# Option 2: Run in Docker
docker-compose exec backend npx prisma studio
```

Then open http://localhost:5555

### Seed Database with Test Data

```bash
docker-compose exec backend npm run prisma:seed
```

## 🔧 Environment Variables

### Backend Environment Variables

Edit `backend/.env`:

```env
NODE_ENV=development
PORT=5001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/recreon?schema=public
JWT_SECRET=your-secret-key
REDIS_URL=redis://localhost:6379
```

### Docker Environment Variables

Edit root `.env` file for Docker-specific overrides:

```env
JWT_SECRET=your-production-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## 🐛 Troubleshooting

### Problem: Port Already in Use

```bash
# Check what's using the port
lsof -i :5001
lsof -i :5432

# Kill the process or change the port in docker-compose.yml
```

### Problem: Database Connection Failed

```bash
# Check database health
docker-compose ps database

# View database logs
docker-compose logs database

# Restart database
docker-compose restart database
```

### Problem: Backend Not Starting

```bash
# View backend logs
docker-compose logs backend

# Check if database is ready
docker-compose exec backend pg_isready -h database -U postgres

# Rebuild backend
docker-compose up -d --build backend
```

### Problem: Changes Not Reflecting

```bash
# For code changes, rebuild:
docker-compose up -d --build backend

# For schema changes, run migrations:
docker-compose exec backend npx prisma migrate dev
docker-compose exec backend npx prisma generate
```

### Problem: Volume Permissions

```bash
# Reset volumes (⚠️ deletes all data)
docker-compose down -v
docker-compose up -d
```

## 📱 Connecting React Native Frontend

### Update Your Frontend API Configuration

In `src/config/api.js` or `src/constants/API.js`:

```javascript
// For iOS Simulator
const API_URL = 'http://localhost:5001';

// For Android Emulator
const API_URL = 'http://10.0.2.2:5001';

// For Physical Device (use your computer's IP)
const API_URL = 'http://192.168.1.XXX:5001';
```

### Find Your Local IP (for Physical Device)

```bash
# macOS
ipconfig getifaddr en0

# Windows
ipconfig

# Linux
hostname -I
```

## 🔄 Development Workflow

### Typical Daily Workflow

```bash
# 1. Start services in the morning
docker-compose up -d

# 2. Make code changes (they auto-reload in development)

# 3. If you change Prisma schema:
docker-compose exec backend npx prisma migrate dev

# 4. View logs when debugging
docker-compose logs -f backend

# 5. Restart if needed
docker-compose restart backend

# 6. Stop services at end of day
docker-compose down
```

## 📊 Monitoring

### Check Service Health

```bash
# Backend health
curl http://localhost:5001/health

# Database health
docker-compose exec database pg_isready -U postgres

# Redis health
docker-compose exec redis redis-cli ping
```

### View Resource Usage

```bash
docker stats
```

## 🧹 Cleanup

### Remove All Recreon Containers and Volumes

```bash
# Stop and remove everything (⚠️ deletes all data)
docker-compose down -v

# Remove images too
docker-compose down -v --rmi all
```

### Remove Unused Docker Resources

```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Remove everything unused
docker system prune -a
```

## 🚢 Production Deployment

For production:

1. Change `NODE_ENV=production` in docker-compose.yml
2. Use a strong `JWT_SECRET`
3. Use managed PostgreSQL (not Docker)
4. Add proper CORS origins
5. Enable SSL/HTTPS
6. Use Docker secrets for sensitive data
7. Set up proper logging and monitoring

## 📝 Notes

- **Database data** persists in Docker volumes
- **Hot reload** is enabled for backend code changes
- **Prisma Client** is regenerated automatically on container start
- **Redis** is optional but recommended for caching

## 🆘 Need Help?

Check logs first:
```bash
docker-compose logs -f
```

Common issues:
- Port conflicts → Check if ports 5001, 5432, 6379 are available
- Database errors → Try `docker-compose restart database`
- Backend errors → Try `docker-compose up -d --build backend`
- Prisma errors → Try `docker-compose exec backend npx prisma generate`

---

Happy coding! 🎾🏀⚽

