# 🎾 Recreon - Social Sports Platform

**Match • Chat • Play**

Recreon is a social platform that connects sports enthusiasts, organizes events, and facilitates matchmaking for recreational sports players.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React Native](https://img.shields.io/badge/React%20Native-0.79-61dafb.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)

---

## ✨ Features

### 🎮 **Play & Match**
- **Quick Match**: Find players nearby instantly
- **Skill-Based Matching**: Match with players at your level
- **Casual & Ranked**: Choose your play style
- **Challenge System**: Send match requests to specific players

### 📅 **Events & Calendar**
- **Create Events**: Organize tournaments, practices, and social games
- **Discover Games**: Find nearby games based on your location
- **Join Events**: Register for upcoming events
- **Event Management**: Track your upcoming matches

### 💬 **Messaging**
- **Real-time Chat**: Instant messaging with other players
- **Direct Messages**: Private conversations
- **Group Chats**: Team and event discussions
- **Message Notifications**: Stay updated with push notifications

### 🏅 **Sports Profiles**
- **Multiple Sports**: Track profiles for different sports
- **Skill Levels**: From beginner to professional
- **Statistics**: Win rates, matches played, and more
- **Sport Icons**: Visual representation of your sports

### 👤 **User Profiles**
- **Custom Avatars**: Personalized profile colors and images
- **Bio & Details**: Share your sports story
- **Edit Profile**: Update your information anytime
- **Sport Management**: Add and remove sports from your profile

### 🔐 **Security & Settings**
- **Secure Authentication**: JWT-based authentication
- **Password Management**: Change password anytime
- **Account Control**: Delete account with data cleanup
- **Privacy Settings**: Control your visibility

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop))
- **Expo CLI** (optional): `npm install -g expo-cli`

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/recreon.git
   cd recreon
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Set up backend with Docker**
   ```bash
   ./setup-env.sh  # Create environment files
   ./docker-start.sh  # Start all services
   ```

4. **Start the mobile app**
   ```bash
   npm start
   ```

5. **Open the app**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go on your phone

---

## 📱 Screenshots

| Home Screen | Calendar | Messages | Profile |
|------------|----------|----------|---------|
| *Coming soon* | *Coming soon* | *Coming soon* | *Coming soon* |

---

## 🏗️ Tech Stack

### Frontend
- **React Native** 0.79 - Cross-platform mobile framework
- **Expo** 53 - Development toolchain
- **React Navigation** 7 - Navigation library
- **Axios** - HTTP client
- **Socket.io Client** - Real-time communication
- **AsyncStorage** - Local data persistence

### Backend
- **Node.js** 18 - JavaScript runtime
- **Express** 5 - Web framework
- **Prisma** 6 - ORM and database toolkit
- **PostgreSQL** 16 - Relational database
- **Redis** 7 - Caching and session management
- **Socket.io** 4 - WebSocket server
- **JWT** - Authentication
- **Cloudinary** - Image hosting

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

---

## 📚 Documentation

- **[API Documentation](./API_DOCUMENTATION.md)** - Complete API reference
- **[Architecture Guide](./ARCHITECTURE.md)** - System architecture and design
- **[Docker Setup](./DOCKER_SETUP.md)** - Detailed Docker guide
- **[Quick Start Guide](./QUICK_START.md)** - Get started quickly

---

## 🗂️ Project Structure

```
Recreon/
├── backend/              # Backend API
│   ├── src/
│   │   ├── controllers/  # Business logic
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Express middleware
│   │   └── config/       # Configuration
│   ├── prisma/           # Database schema
│   └── Dockerfile
│
├── src/                  # React Native app
│   ├── screens/          # App screens
│   ├── components/       # Reusable components
│   ├── navigation/       # Navigation setup
│   ├── services/         # API services
│   ├── hooks/            # Custom React hooks
│   └── styles/           # Shared styles
│
└── docker-compose.yml    # Docker services
```

---

## 🔧 Development

### Run Backend Locally

```bash
cd backend
npm install
npm run dev
```

### Run Frontend Locally

```bash
npm install
npm start
```

### Database Management

```bash
# Run migrations
cd backend
npx prisma migrate dev

# Open Prisma Studio
npx prisma studio

# Seed database
npm run prisma:seed
```

### Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild containers
docker-compose up -d --build
```

---

## 🧪 Testing

```bash
# Run tests (coming soon)
npm test

# Run linter
npm run lint
```

---

## 🚢 Deployment

### Backend Deployment

1. **Set environment variables**
   - `NODE_ENV=production`
   - Strong `JWT_SECRET`
   - Production database URL
   - Configure CORS for your domain

2. **Deploy to platforms**
   - Heroku
   - AWS Elastic Beanstalk
   - DigitalOcean App Platform
   - Railway

### Mobile App Deployment

1. **Build for iOS**
   ```bash
   eas build --platform ios
   ```

2. **Build for Android**
   ```bash
   eas build --platform android
   ```

3. **Submit to stores**
   ```bash
   eas submit --platform ios
   eas submit --platform android
   ```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 Environment Variables

### Backend `.env`
```env
NODE_ENV=development
PORT=5001
DATABASE_URL=postgresql://user:pass@localhost:5432/recreon
JWT_SECRET=your-secret-key
REDIS_URL=redis://localhost:6379
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Frontend API Config
Update `src/constants/API.js` based on your platform:
- iOS Simulator: `http://localhost:5001`
- Android Emulator: `http://10.0.2.2:5001`
- Physical Device: `http://YOUR_IP:5001`

---

## 🐛 Troubleshooting

### Backend Connection Issues
```bash
# Check if backend is running
curl http://localhost:5001/health

# View backend logs
docker-compose logs backend

# Restart backend
docker-compose restart backend
```

### Database Issues
```bash
# Check database status
docker-compose ps database

# Access database
docker-compose exec database psql -U postgres -d recreon
```

### Mobile App Issues
- **Android**: Use `10.0.2.2` instead of `localhost`
- **iOS**: Use `localhost`
- **Physical Device**: Use your computer's IP address

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

- **Developer**: Your Name
- **GitHub**: [@yourusername](https://github.com/yourusername)

---

## 🙏 Acknowledgments

- Built with [React Native](https://reactnative.dev)
- Powered by [Expo](https://expo.dev)
- Backend with [Express](https://expressjs.com)
- Database with [Prisma](https://prisma.io)

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/recreon/issues)
- **Email**: support@recreon.com
- **Documentation**: See `docs/` folder

---

**Made with ❤️ for sports enthusiasts**

🎾 🏀 ⚽ 🏸 🎱

PostgreSQL version: 14.18
