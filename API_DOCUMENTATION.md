# 🔌 Recreon API Documentation

## Base URL

```
Development: http://localhost:5001
Production: https://api.recreon.com (when deployed)
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

---

## 📍 API Endpoints

### 🔐 Authentication

#### Register New User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "avatarColor": "#7B9F8C"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "avatarUrl": null,
    "avatarColor": "#7B9F8C"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Get Current User Profile
```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "fullName": "John Doe",
  "avatarUrl": "https://cloudinary.com/...",
  "avatarColor": "#7B9F8C",
  "profile": {
    "bio": "Tennis enthusiast",
    "dateOfBirth": "1990-01-01T00:00:00.000Z",
    "phoneNumber": "+1234567890"
  },
  "sportProfiles": [
    {
      "id": 1,
      "sport": {
        "id": 1,
        "name": "Tennis",
        "displayName": "Tennis"
      },
      "skillLevel": "INTERMEDIATE",
      "yearsPlaying": 5,
      "matchesPlayed": 25,
      "matchesWon": 15,
      "winRate": 60.0
    }
  ]
}
```

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "fullName": "John Smith",
  "bio": "Tennis and basketball player",
  "phoneNumber": "+1234567890",
  "city": "San Francisco",
  "state": "California",
  "country": "USA"
}
```

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "user": { /* updated user object */ }
}
```

#### Change Password
```http
PUT /api/auth/change-password
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass456!"
}
```

**Response (200):**
```json
{
  "message": "Password changed successfully"
}
```

#### Delete Account
```http
DELETE /api/auth/delete-account
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Account deleted successfully"
}
```

---

### 🏅 Sports Management

#### Get All Sports
```http
GET /api/sports
```

**Response (200):**
```json
{
  "sports": [
    {
      "id": 1,
      "name": "Tennis",
      "displayName": "Tennis",
      "category": "racquet",
      "maxPlayers": 4,
      "minPlayers": 2,
      "isTeamSport": false
    }
  ],
  "count": 10
}
```

#### Get Sport by ID
```http
GET /api/sports/:id
```

**Response (200):**
```json
{
  "id": 1,
  "name": "Tennis",
  "displayName": "Tennis",
  "category": "racquet",
  "maxPlayers": 4,
  "minPlayers": 2,
  "isTeamSport": false,
  "scoringSystem": { /* scoring rules */ }
}
```

#### Add Sport to Profile
```http
POST /api/auth/sport-profiles
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "sportId": 1,
  "skillLevel": "INTERMEDIATE",
  "yearsPlaying": 5
}
```

**Response (201):**
```json
{
  "message": "Sport profile added successfully",
  "sportProfile": {
    "id": 1,
    "sportId": 1,
    "skillLevel": "INTERMEDIATE",
    "yearsPlaying": 5,
    "sport": {
      "id": 1,
      "name": "Tennis",
      "displayName": "Tennis"
    }
  }
}
```

#### Update Sport Profile
```http
PUT /api/auth/sport-profiles/:sportId
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "skillLevel": "ADVANCED",
  "yearsPlaying": 6
}
```

**Response (200):**
```json
{
  "message": "Sport profile updated successfully",
  "sportProfile": { /* updated profile */ }
}
```

#### Remove Sport from Profile
```http
DELETE /api/auth/sport-profiles/:sportId
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Sport profile removed successfully"
}
```

---

### 📅 Events Management

#### Get Discover Events
```http
GET /api/events/discover?sportId=1&limit=10
```

**Query Parameters:**
- `sportId` (optional): Filter by sport
- `skillLevel` (optional): Filter by skill level
- `latitude` (optional): User's latitude
- `longitude` (optional): User's longitude
- `maxDistance` (optional): Maximum distance in km (default: 50)
- `limit` (optional): Number of results (default: 20)

**Response (200):**
```json
{
  "events": [
    {
      "id": 1,
      "title": "Weekend Tennis Match",
      "description": "Casual weekend tennis game",
      "eventType": "social",
      "sport": {
        "id": 1,
        "name": "Tennis",
        "displayName": "Tennis"
      },
      "startTime": "2024-12-25T14:00:00.000Z",
      "endTime": "2024-12-25T16:00:00.000Z",
      "time": "2:00 PM - 4:00 PM",
      "venue": "Central Park Tennis Courts",
      "location": "Central Park, NY",
      "participants": 3,
      "maxParticipants": 4,
      "isFull": false,
      "skillLevelRange": "BEGINNER-INTERMEDIATE",
      "distance": "2.5 km",
      "creator": {
        "id": 5,
        "username": "tennis_pro",
        "fullName": "Sarah Johnson",
        "avatarColor": "#7B9F8C"
      }
    }
  ],
  "count": 1
}
```

#### Get My Events
```http
GET /api/events/my-events?startDate=2024-01-01
Authorization: Bearer <token>
```

**Query Parameters:**
- `startDate` (optional): Get events from this date onwards
- `endDate` (optional): Get events up to this date

**Response (200):**
```json
{
  "events": [
    {
      "id": 1,
      "title": "Weekend Tennis Match",
      "eventType": "social",
      "startTime": "2024-12-25T14:00:00.000Z",
      "endTime": "2024-12-25T16:00:00.000Z",
      "venue": "Central Park Tennis Courts",
      "sport": { /* sport details */ },
      "participants": [ /* participant list */ ],
      "isCreator": true
    }
  ],
  "count": 1
}
```

#### Create Event
```http
POST /api/events
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Weekend Tennis Match",
  "description": "Casual weekend tennis game for intermediates",
  "sportId": 1,
  "eventType": "social",
  "startTime": "2024-12-25T14:00:00.000Z",
  "endTime": "2024-12-25T16:00:00.000Z",
  "venue": "Central Park Tennis Courts",
  "latitude": 40.7829,
  "longitude": -73.9654,
  "maxParticipants": 4,
  "skillLevelMin": "BEGINNER",
  "skillLevelMax": "INTERMEDIATE"
}
```

**Response (201):**
```json
{
  "message": "Event created successfully",
  "event": {
    "id": 1,
    "title": "Weekend Tennis Match",
    /* full event details */
  }
}
```

#### Join Event
```http
POST /api/events/:eventId/join
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Successfully joined event",
  "participation": {
    "eventId": 1,
    "userId": 2,
    "status": "CONFIRMED",
    "registeredAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Leave Event
```http
DELETE /api/events/:eventId/leave
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Successfully left event"
}
```

---

### 💬 Messages & Conversations

#### Get All Conversations
```http
GET /api/conversations
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "conversations": [
    {
      "id": 1,
      "conversationType": "direct",
      "lastMessageAt": "2024-01-15T10:30:00.000Z",
      "participants": [
        {
          "user": {
            "id": 2,
            "username": "jane_smith",
            "fullName": "Jane Smith",
            "avatarColor": "#DC2626"
          }
        }
      ],
      "lastMessage": {
        "content": "See you at the tennis court!",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "senderId": 2
      },
      "unreadCount": 2,
      "isPinned": false
    }
  ]
}
```

#### Get Messages in Conversation
```http
GET /api/conversations/:conversationId/messages?limit=50
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (optional): Number of messages (default: 50)
- `before` (optional): Get messages before this message ID

**Response (200):**
```json
{
  "messages": [
    {
      "id": 1,
      "conversationId": 1,
      "senderId": 2,
      "content": "See you at the tennis court!",
      "messageType": "text",
      "isEdited": false,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "sender": {
        "id": 2,
        "username": "jane_smith",
        "fullName": "Jane Smith",
        "avatarColor": "#DC2626"
      }
    }
  ],
  "hasMore": false
}
```

#### Send Message
```http
POST /api/conversations/:conversationId/messages
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "content": "Great game today!",
  "messageType": "text"
}
```

**Response (201):**
```json
{
  "message": {
    "id": 2,
    "conversationId": 1,
    "senderId": 1,
    "content": "Great game today!",
    "messageType": "text",
    "createdAt": "2024-01-15T10:35:00.000Z"
  }
}
```

#### Create Conversation
```http
POST /api/conversations
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "participantIds": [2, 3],
  "conversationType": "direct"
}
```

**Response (201):**
```json
{
  "conversation": {
    "id": 1,
    "conversationType": "direct",
    "participants": [ /* participant details */ ]
  }
}
```

#### Toggle Pin Conversation
```http
PUT /api/conversations/:conversationId/pin
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Conversation pin status updated",
  "isPinned": true
}
```

---

### 🎮 Matchmaking

#### Get Match Suggestions
```http
GET /api/matchmaking/suggestions?sportId=1&skillLevel=INTERMEDIATE
Authorization: Bearer <token>
```

**Query Parameters:**
- `sportId` (required): Sport to find matches for
- `mode` (optional): "casual" or "ranked" (default: "casual")
- `skillLevel` (optional): Desired skill level
- `distance` (optional): Maximum distance in km
- `latitude` (optional): User's latitude
- `longitude` (optional): User's longitude

**Response (200):**
```json
{
  "suggestions": [
    {
      "id": 2,
      "playerName": "Mike Johnson",
      "username": "mike_j",
      "skillLevel": "INTERMEDIATE",
      "distance": "3.2 km",
      "winRate": 65,
      "matches": 42,
      "availability": "Available now",
      "avatarColor": "#059669",
      "commonSports": ["Tennis", "Badminton"]
    }
  ],
  "count": 1
}
```

#### Send Match Request
```http
POST /api/matchmaking/request
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "targetUserId": 2,
  "sportId": 1,
  "proposedTime": "2024-12-25T14:00:00.000Z",
  "message": "Would you like to play tennis this weekend?"
}
```

**Response (201):**
```json
{
  "message": "Match request sent successfully",
  "challenge": {
    "id": 1,
    "senderId": 1,
    "receiverId": 2,
    "sportId": 1,
    "proposedTime": "2024-12-25T14:00:00.000Z",
    "status": "pending"
  }
}
```

---

### 🏆 Rankings (Future Feature)

#### Get Leaderboard
```http
GET /api/rankings/leaderboard?sportId=1&scope=city
Authorization: Bearer <token>
```

**Query Parameters:**
- `sportId` (required): Sport to view rankings for
- `scope` (optional): "city", "state", "country", "global" (default: "global")
- `limit` (optional): Number of results (default: 50)

**Response (200):**
```json
{
  "rankings": [
    {
      "rank": 1,
      "user": {
        "id": 5,
        "username": "tennis_pro",
        "fullName": "Sarah Johnson",
        "avatarColor": "#7B9F8C"
      },
      "eloRating": 1850,
      "rankedMatchesPlayed": 125,
      "rankedMatchesWon": 95,
      "winRate": 76.0,
      "streak": 8
    }
  ],
  "myRanking": {
    "rank": 42,
    "eloRating": 1450
  }
}
```

---

## ⚠️ Error Responses

### Standard Error Format
```json
{
  "error": "Error message here",
  "details": "Additional error details (development only)"
}
```

### Common HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data or validation failed |
| 401 | Unauthorized | Authentication required or invalid token |
| 403 | Forbidden | Authenticated but not authorized |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 500 | Internal Server Error | Server error occurred |

### Validation Error Example
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format",
      "value": "invalid-email"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters",
      "value": "short"
    }
  ]
}
```

---

## 🔌 WebSocket Events (Socket.io)

### Connection
```javascript
const socket = io('http://localhost:5001', {
  auth: { token: 'your_jwt_token' }
});
```

### Events

#### Join Conversation
```javascript
socket.emit('join_conversation', { conversationId: 1 });
```

#### Leave Conversation
```javascript
socket.emit('leave_conversation', { conversationId: 1 });
```

#### Send Message (Real-time)
```javascript
socket.emit('send_message', {
  conversationId: 1,
  content: 'Hello!',
  messageType: 'text'
});
```

#### Receive New Message
```javascript
socket.on('new_message', (data) => {
  console.log('New message:', data.message);
  // data.message contains full message object
});
```

#### Typing Indicator (Future)
```javascript
socket.emit('typing', { conversationId: 1 });
socket.on('user_typing', (data) => {
  console.log(`${data.username} is typing...`);
});
```

---

## 📝 Rate Limiting

Current rate limits (will be implemented):
- Authentication endpoints: 5 requests per minute
- General API: 100 requests per minute
- WebSocket messages: 50 messages per minute

---

## 🔧 Environment Variables

Required backend environment variables:

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

---

## 📞 Support

For API issues or questions:
- Create an issue on GitHub
- Check the troubleshooting guide in `DOCKER_SETUP.md`
- Review error logs in `docker-compose logs backend`

---

**Last Updated:** January 2024  
**API Version:** 1.0.0

