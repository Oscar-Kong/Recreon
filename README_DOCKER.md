# 🐳 Recreon Docker Setup - Complete Guide

## 📦 What's Included

Your Docker setup includes:

- ✅ **PostgreSQL 16** - Main database
- ✅ **Redis 7** - Caching and sessions
- ✅ **Backend API** - Node.js/Express server with Prisma ORM
- ✅ **Auto-migrations** - Prisma migrations run automatically
- ✅ **Hot reload** - Code changes reflect immediately
- ✅ **Health checks** - Automatic service health monitoring

## 🚀 Quick Start (3 Steps)

### Step 1: Setup Environment

```bash
./setup-env.sh
```

This creates the necessary `.env` files with default development settings.

### Step 2: Start Docker

```bash
./docker-start.sh
```

Or manually:

```bash
docker-compose up -d
```

### Step 3: Verify

```bash
# Check API health
curl http://localhost:5001/health

# Should return: {"status":"ok"}
```

## 📁 Files Created

```
Recreon/
├── docker-compose.yml          # Main Docker configuration
├── .dockerignore               # Files to exclude from Docker builds
├── .env                        # Docker environment variables
├── setup-env.sh               # Environment setup script
├── docker-start.sh            # Quick start script
├── DOCKER_SETUP.md            # Complete documentation
├── QUICK_START.md             # Quick reference guide
└── backend/
    ├── Dockerfile             # Backend container definition
    ├── .dockerignore          # Backend-specific exclusions
    ├── .env                   # Backend environment variables
    └── .env.example           # Environment template
```

## 🎯 Common Tasks

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f database
```

### Stop Services

```bash
docker-compose down
```

### Restart After Code Changes

```bash
# Backend code changes (auto-reloads, but if needed):
docker-compose restart backend

# Prisma schema changes:
docker-compose exec backend npx prisma migrate dev
docker-compose exec backend npx prisma generate
docker-compose restart backend
```

### Access Database

```bash
# Connect to PostgreSQL
docker-compose exec database psql -U postgres -d recreon

# Common commands:
# \dt              - List tables
# \d "User"        - Describe User table
# SELECT * FROM "User"; - Query users
# \q               - Quit
```

### Run Prisma Studio

```bash
cd backend
npx prisma studio
```

Opens at http://localhost:5555 - GUI for browsing database

### Seed Database

```bash
docker-compose exec backend npm run prisma:seed
```

## 🔧 Configuration

### Environment Variables

**backend/.env:**
```env
NODE_ENV=development
PORT=5001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/recreon?schema=public
JWT_SECRET=recreon-dev-secret-key-please-change-in-production-2024
REDIS_URL=redis://localhost:6379
```

**Root .env (for Docker):**
```env
JWT_SECRET=recreon-dev-secret-key-please-change-in-production-2024
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Change Database Password

Edit `docker-compose.yml`:

```yaml
database:
  environment:
    POSTGRES_PASSWORD: your-new-password
```

And update `DATABASE_URL` in `backend/.env`

### Change Ports

Edit `docker-compose.yml`:

```yaml
backend:
  ports:
    - "3000:5001"  # Change 3000 to your desired port
```

## 📱 Connect React Native App

Update your frontend API config based on your device:

**iOS Simulator:**
```javascript
const API_URL = 'http://localhost:5001';
```

**Android Emulator:**
```javascript
const API_URL = 'http://10.0.2.2:5001';
```

**Physical Device:**
```bash
# Find your computer's IP address
ipconfig getifaddr en0  # macOS
ipconfig               # Windows
hostname -I            # Linux
```

```javascript
const API_URL = 'http://YOUR_IP:5001';
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find process using port 5001
lsof -i :5001

# Kill it or change port in docker-compose.yml
```

### Database Connection Failed

```bash
# Check database health
docker-compose ps database

# Restart database
docker-compose restart database

# View logs
docker-compose logs database
```

### Backend Won't Start

```bash
# View logs
docker-compose logs backend

# Rebuild container
docker-compose up -d --build backend

# Check database is ready
docker-compose exec backend pg_isready -h database -U postgres
```

### Prisma Client Not Generated

```bash
docker-compose exec backend npx prisma generate
docker-compose restart backend
```

### Reset Everything

```bash
# Stop and remove all containers and volumes (⚠️ deletes data)
docker-compose down -v

# Start fresh
./docker-start.sh
```

## 🔒 Security Notes

### Development vs Production

**Current setup is for DEVELOPMENT only!**

For production:

1. **Change JWT_SECRET** to a strong random string:
   ```bash
   openssl rand -base64 32
   ```

2. **Use managed database** (not Docker):
   - AWS RDS
   - Heroku Postgres
   - DigitalOcean Managed Database

3. **Set NODE_ENV=production**

4. **Enable SSL** for database connections

5. **Configure CORS** properly:
   ```javascript
   cors({
     origin: ['https://yourdomain.com'],
     credentials: true
   })
   ```

6. **Use Docker secrets** for sensitive data

7. **Add rate limiting**

8. **Enable logging and monitoring**

## 📊 Monitoring

### Check Service Health

```bash
# All services
docker-compose ps

# Backend health endpoint
curl http://localhost:5001/health

# Database
docker-compose exec database pg_isready -U postgres

# Redis
docker-compose exec redis redis-cli ping
```

### View Resource Usage

```bash
docker stats
```

### Disk Usage

```bash
# Docker disk usage
docker system df

# Clean up unused resources
docker system prune -a
```

## 🧹 Cleanup

### Remove Recreon Services

```bash
# Stop and remove (keeps data)
docker-compose down

# Stop and remove with data (⚠️ deletes database)
docker-compose down -v
```

### Clean Up Docker

```bash
# Remove unused containers
docker container prune

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Remove everything unused
docker system prune -a
```

## 📚 Additional Resources

- **Docker Documentation**: https://docs.docker.com
- **Docker Compose**: https://docs.docker.com/compose
- **Prisma Docs**: https://www.prisma.io/docs
- **PostgreSQL**: https://www.postgresql.org/docs
- **Redis**: https://redis.io/docs

## 🆘 Getting Help

### Check Logs First

```bash
docker-compose logs -f
```

### Common Issues

1. **Port conflicts** → Change ports in docker-compose.yml
2. **Database errors** → Try `docker-compose restart database`
3. **Backend errors** → Try `docker-compose up -d --build backend`
4. **Prisma errors** → Run `docker-compose exec backend npx prisma generate`

### Still Having Issues?

1. Stop all services: `docker-compose down`
2. Remove volumes: `docker-compose down -v`
3. Start fresh: `./docker-start.sh`

---

🎾 Happy coding with Recreon! 🏀⚽

