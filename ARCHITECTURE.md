# 🏗️ Recreon Architecture Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Architecture Patterns](#architecture-patterns)
5. [Data Flow](#data-flow)
6. [Database Schema](#database-schema)
7. [API Design](#api-design)
8. [Security Architecture](#security-architecture)
9. [Deployment Architecture](#deployment-architecture)

---

## System Overview

Recreon is a social sports platform that connects players, organizes events, and facilitates matchmaking. The system consists of:

- **Mobile App (React Native)**: Cross-platform iOS/Android application
- **Backend API (Node.js/Express)**: RESTful API with real-time capabilities
- **Database (PostgreSQL)**: Primary data store with Prisma ORM
- **Cache Layer (Redis)**: Session management and caching
- **File Storage (Cloudinary)**: Profile pictures and media

```
┌─────────────────┐
│   Mobile App    │
│  (React Native) │
└────────┬────────┘
         │ HTTP/WebSocket
         ↓
┌─────────────────┐      ┌──────────┐
│   Backend API   │─────→│  Redis   │
│ (Express/Node)  │      └──────────┘
└────────┬────────┘
         │
         ↓
┌─────────────────┐      ┌────────────┐
│   PostgreSQL    │      │ Cloudinary │
│    Database     │      │  (Images)  │
└─────────────────┘      └────────────┘
```

---

## Technology Stack

### Frontend (Mobile)
- **Framework**: React Native 0.79.5
- **Navigation**: React Navigation 7.x
- **State Management**: React Hooks + Context API
- **HTTP Client**: Axios
- **Real-time**: Socket.io Client
- **Storage**: AsyncStorage
- **UI Components**: Custom components with Expo
- **Icons**: @expo/vector-icons (Ionicons)
- **Animations**: React Native Reanimated

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express 5.x
- **ORM**: Prisma 6.x
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: express-validator
- **Password Hashing**: bcryptjs
- **Real-time**: Socket.io 4.x
- **File Upload**: Multer
- **Image Hosting**: Cloudinary

### Database & Cache
- **Primary Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Migrations**: Prisma Migrate

### DevOps
- **Containerization**: Docker & Docker Compose
- **Development**: Nodemon (hot reload)
- **Environment**: dotenv

---

## Project Structure

```
Recreon/
├── backend/                    # Backend API
│   ├── src/
│   │   ├── index.js           # Express app setup
│   │   ├── config/
│   │   │   └── database.js    # Prisma client singleton
│   │   ├── controllers/       # Business logic
│   │   │   ├── authController.js
│   │   │   ├── eventController.js
│   │   │   ├── messageController.js
│   │   │   ├── conversationController.js
│   │   │   └── matchmakingController.js
│   │   ├── middleware/        # Express middleware
│   │   │   ├── auth.js        # JWT authentication
│   │   │   └── validate.js    # Input validation
│   │   └── routes/            # API routes
│   │       ├── authRoutes.js
│   │       ├── eventRoutes.js
│   │       ├── messageRoutes.js
│   │       ├── sportsRoutes.js
│   │       └── matchmakingRoutes.js
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.js            # Seed data
│   ├── Dockerfile
│   └── package.json
│
├── src/                        # React Native frontend
│   ├── components/            # Reusable components
│   │   ├── calendar/
│   │   │   ├── CalendarView.js
│   │   │   ├── EventCard.js
│   │   │   └── AddEventModal.js
│   │   ├── common/
│   │   │   ├── SearchBar.js
│   │   │   └── LoadingSpinner.js
│   │   ├── messages/
│   │   │   ├── MessageBubble.js
│   │   │   ├── ConversationItems.js
│   │   │   └── PinnedConversations.js
│   │   ├── profile/
│   │   │   ├── EditProfileModal.js
│   │   │   └── AddSportModal.js
│   │   └── settings/
│   │       └── ChangePasswordModal.js
│   │
│   ├── screens/               # Main app screens
│   │   ├── auth/
│   │   │   ├── LoginScreen.js
│   │   │   ├── RegisterScreen.js
│   │   │   └── LoadingScreen.js
│   │   ├── HomeScreen.js
│   │   ├── PlayScreen.js
│   │   ├── CalendarScreen.js
│   │   ├── MessagesScreen.js
│   │   ├── ChatScreen.js
│   │   ├── ProfileScreen.js
│   │   └── SettingsScreen.js
│   │
│   ├── navigation/            # Navigation config
│   │   ├── AppNavigator.js
│   │   ├── AuthNavigator.js
│   │   └── TabNavigator.js
│   │
│   ├── services/              # API services
│   │   ├── api.js             # Axios config
│   │   ├── authService.js
│   │   ├── eventService.js
│   │   ├── messageService.js
│   │   ├── sportsService.js
│   │   ├── socketService.js
│   │   └── matchmakingService.js
│   │
│   ├── hooks/                 # Custom hooks
│   │   ├── useAuth.js
│   │   └── useMessages.js
│   │
│   ├── constants/             # App constants
│   │   ├── API.js
│   │   └── Colors.js
│   │
│   ├── styles/                # Shared styles
│   │   ├── colors.js
│   │   ├── fontStyles.js
│   │   └── spacing.js
│   │
│   └── utils/                 # Utility functions
│       ├── storage.js
│       └── validator.js
│
├── docker-compose.yml         # Docker orchestration
├── App.js                     # Root component
└── package.json
```

---

## Architecture Patterns

### Backend Architecture

#### MVC Pattern (Modified)
```
Request → Routes → Middleware → Controller → Prisma → Database
                        ↓
                   Response
```

**Components:**
- **Routes**: Define endpoints and attach middleware
- **Middleware**: Authentication, validation, error handling
- **Controllers**: Business logic and data transformation
- **Prisma**: ORM for database operations
- **Database**: PostgreSQL data persistence

#### Middleware Pipeline
```javascript
Request
  → CORS
  → JSON Parser
  → Authentication (if protected)
  → Validation (express-validator)
  → Controller
  → Error Handler
  → Response
```

### Frontend Architecture

#### Component-Based Architecture
```
App
├── Navigation (Auth/App Stack)
├── Context Providers (Auth, Messages)
├── Screens
│   └── Components
│       └── Sub-components
└── Services (API calls)
```

#### State Management Layers
1. **Local State** (useState): Component-specific data
2. **Context API** (useContext): Shared state (auth, user)
3. **AsyncStorage**: Persistent data (tokens, settings)
4. **Backend**: Source of truth for all data

---

## Data Flow

### Authentication Flow
```
1. User enters credentials
   ↓
2. Frontend → POST /api/auth/login
   ↓
3. Backend validates credentials
   ↓
4. Backend generates JWT token
   ↓
5. Frontend stores token in AsyncStorage
   ↓
6. Frontend includes token in all subsequent requests
   ↓
7. Backend middleware verifies token
```

### Real-time Messaging Flow
```
1. User sends message
   ↓
2. Frontend → Socket.emit('send_message')
   ↓
3. Backend receives via Socket.io
   ↓
4. Backend saves to PostgreSQL
   ↓
5. Backend broadcasts to conversation participants
   ↓
6. Other users receive via Socket.on('new_message')
   ↓
7. Frontend updates UI optimistically
```

### Event Creation Flow
```
1. User fills event form
   ↓
2. Frontend validates input
   ↓
3. Frontend → POST /api/events
   ↓
4. Backend validation middleware checks data
   ↓
5. Backend controller creates event in DB
   ↓
6. Backend returns event with populated relations
   ↓
7. Frontend updates calendar view
```

---

## Database Schema

### Core Entities

```
User
├── UserProfile (1:1)
├── UserSportProfile (1:N)
├── UserRanking (1:N)
├── Event (1:N as creator)
├── EventParticipant (1:N)
├── ConversationParticipant (1:N)
├── Message (1:N)
├── Match (1:N as creator)
├── MatchParticipant (1:N)
├── Challenge (1:N sent, 1:N received)
└── Guide (1:N)

Sport
├── UserSportProfile (1:N)
├── Event (1:N)
├── Match (1:N)
├── UserRanking (1:N)
└── Challenge (1:N)

Conversation
├── ConversationParticipant (1:N)
└── Message (1:N)
```

### Key Relationships

- **User ↔ Sport**: Many-to-Many through `UserSportProfile`
- **User ↔ Event**: Many-to-Many through `EventParticipant`
- **User ↔ Conversation**: Many-to-Many through `ConversationParticipant`
- **User ↔ Match**: Many-to-Many through `MatchParticipant`

### Indexes for Performance
```sql
-- Location-based queries
CREATE INDEX idx_events_location ON events (latitude, longitude);
CREATE INDEX idx_users_location ON users (city, state, country);

-- Ranking queries
CREATE INDEX idx_rankings_elo ON user_rankings (sport_id, elo_rating DESC);

-- Message queries
CREATE INDEX idx_messages_conversation ON messages (conversation_id, created_at DESC);

-- Event discovery
CREATE INDEX idx_events_sport_time ON events (sport_id, status, start_time);
```

---

## API Design

### RESTful Principles

- **Resources**: Nouns (users, events, messages)
- **HTTP Methods**: GET (read), POST (create), PUT (update), DELETE (delete)
- **Status Codes**: Meaningful HTTP status codes
- **Consistency**: Standard response formats

### Naming Conventions

```
✅ Good:
GET    /api/events               # List events
GET    /api/events/:id           # Get specific event
POST   /api/events               # Create event
PUT    /api/events/:id           # Update event
DELETE /api/events/:id           # Delete event

❌ Bad:
GET    /api/getEvents
POST   /api/createNewEvent
GET    /api/event/:id
```

### Response Format Standards

**Success Response:**
```json
{
  "message": "Operation successful",
  "data": { /* resource */ }
}
```

**Error Response:**
```json
{
  "error": "Error message",
  "details": [ /* validation errors */ ]
}
```

**List Response:**
```json
{
  "items": [ /* array of resources */ ],
  "count": 42,
  "hasMore": true
}
```

---

## Security Architecture

### Authentication
- **Method**: JWT (JSON Web Tokens)
- **Storage**: Frontend stores in AsyncStorage
- **Transmission**: Authorization header (`Bearer <token>`)
- **Expiration**: 7 days (configurable)

### Authorization
- **Protected Routes**: Middleware checks JWT validity
- **Resource Ownership**: Controllers verify user owns resource
- **Role-based**: Future implementation for admin roles

### Data Protection
- **Passwords**: Bcrypt hashed (salt rounds: 10)
- **SQL Injection**: Prisma parameterized queries
- **XSS**: Input sanitization (future implementation)
- **CORS**: Configured for development origins

### Best Practices Implemented
- ✅ Password hashing
- ✅ JWT authentication
- ✅ Protected routes
- ✅ Input validation
- ✅ Environment variables for secrets
- ⏳ Rate limiting (planned)
- ⏳ HTTPS in production (planned)
- ⏳ Refresh tokens (planned)

---

## Deployment Architecture

### Development Environment
```
Docker Compose:
  ├── PostgreSQL (port 5432)
  ├── Redis (port 6379)
  └── Backend API (port 5001)

Local Machine:
  └── React Native App (Expo)
```

### Production Architecture (Planned)
```
┌──────────────┐
│   Expo App   │ (iOS/Android App Stores)
└──────┬───────┘
       │ HTTPS
       ↓
┌──────────────┐
│  Load        │
│  Balancer    │
└──────┬───────┘
       │
    ┌──┴──┬──────┐
    ↓     ↓      ↓
  API   API    API  (Horizontally scaled)
    │     │      │
    └──┬──┴──┬───┘
       │     │
       ↓     ↓
   ┌────────────┐     ┌──────────┐
   │ PostgreSQL │     │  Redis   │
   │    (RDS)   │     │ (Cluster)│
   └────────────┘     └──────────┘
```

### Scaling Considerations
- **Horizontal Scaling**: Multiple API instances behind load balancer
- **Database**: Managed PostgreSQL (AWS RDS, Heroku Postgres)
- **Cache**: Redis cluster for session management
- **CDN**: Cloudinary for images, CDN for static assets
- **WebSocket**: Sticky sessions for Socket.io

---

## Performance Optimizations

### Backend
- Database connection pooling (Prisma default)
- Indexed queries for common lookups
- Pagination for large data sets
- Redis caching for frequently accessed data

### Frontend
- Component memoization (React.memo)
- Lazy loading for heavy screens
- Image optimization (Cloudinary transformations)
- Debounced search inputs
- Optimistic UI updates

---

## Monitoring & Logging

### Current Logging
- Console logs for development
- Structured error logging
- Request/response logging in API interceptors

### Planned Improvements
- **Error Tracking**: Sentry integration
- **Performance**: New Relic or Datadog
- **Analytics**: Mixpanel or Google Analytics
- **Logs**: Centralized logging (ELK stack)

---

## Future Enhancements

### Architecture Improvements
1. **Microservices**: Split API into smaller services
2. **GraphQL**: Consider GraphQL for complex queries
3. **Event-Driven**: Message queue for async operations
4. **CDN**: Content delivery for global reach
5. **Multi-region**: Deploy in multiple regions

### Technical Debt
- Migrate to TypeScript for type safety
- Implement comprehensive testing
- Add API versioning
- Improve error handling consistency
- Add request rate limiting

---

## Development Workflow

### Local Development
```bash
# Start backend
docker-compose up -d
cd backend && npm run dev

# Start mobile app
npm start
```

### Making Changes
1. Create feature branch
2. Make changes with hot reload
3. Test manually
4. Run linter: `npm run lint`
5. Commit and push
6. Create pull request

### Database Changes
```bash
# 1. Update schema.prisma
# 2. Create migration
npx prisma migrate dev --name add_new_feature

# 3. Generate Prisma client
npx prisma generate
```

---

## Troubleshooting

### Common Issues

**Backend not accessible from mobile:**
- iOS Simulator: Use `localhost`
- Android Emulator: Use `10.0.2.2`
- Physical device: Use computer's local IP

**Database connection failed:**
```bash
docker-compose restart database
docker-compose logs database
```

**Socket.io not connecting:**
- Check CORS configuration
- Verify token is being sent
- Check server logs for connection errors

---

## Resources

- **Prisma Docs**: https://www.prisma.io/docs
- **React Native**: https://reactnative.dev
- **Express.js**: https://expressjs.com
- **Socket.io**: https://socket.io
- **Docker**: https://docs.docker.com

---

**Last Updated:** January 2024  
**Version:** 1.0.0  
**Maintained By:** Recreon Development Team

