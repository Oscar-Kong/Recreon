# 🚀 Recreon Quick Start with Docker

## Step 1: Setup Environment

Run the setup script:

```bash
./setup-env.sh
```

Or manually create `backend/.env`:

```env
NODE_ENV=development
PORT=5001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/recreon?schema=public
JWT_SECRET=recreon-dev-secret-key-please-change-in-production-2024
REDIS_URL=redis://localhost:6379
```

## Step 2: Start Docker Services

```bash
docker-compose up -d
```

This starts:
- PostgreSQL database (port 5432)
- Redis cache (port 6379)
- Backend API (port 5001)

## Step 3: Verify It's Running

```bash
# Check status
docker-compose ps

# Check API health
curl http://localhost:5001/health
```

## Step 4: Connect Your Frontend

Update your React Native API config:

**iOS Simulator:**
```javascript
const API_URL = 'http://localhost:5001';
```

**Android Emulator:**
```javascript
const API_URL = 'http://10.0.2.2:5001';
```

**Physical Device:**
```javascript
// Find your IP: ipconfig getifaddr en0 (macOS)
const API_URL = 'http://YOUR_IP:5001';
```

## 🎯 Common Commands

```bash
# View logs
docker-compose logs -f backend

# Stop services
docker-compose down

# Restart after code changes
docker-compose restart backend

# Access database
docker-compose exec database psql -U postgres -d recreon

# Run migrations
docker-compose exec backend npx prisma migrate dev

# Seed database
docker-compose exec backend npm run prisma:seed
```

## 🐛 Troubleshooting

**Port already in use?**
```bash
lsof -i :5001
# Kill the process or change port in docker-compose.yml
```

**Backend not starting?**
```bash
docker-compose logs backend
docker-compose restart backend
```

**Database connection failed?**
```bash
docker-compose restart database
```

## 📚 Full Documentation

See `DOCKER_SETUP.md` for complete documentation.

---

Happy coding! 🎾🏀⚽

