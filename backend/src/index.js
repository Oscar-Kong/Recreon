const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

// Load environment variables from backend/.env
// The path needs to be explicit when running from backend/src/
dotenv.config({ path: path.join(__dirname, '../.env') });

// CRITICAL: Set default NODE_ENV if not defined
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
  console.log('⚠️  NODE_ENV not set, defaulting to "development"');
}

console.log('🔧 Environment loaded:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT || 5001,
  hasJWTSecret: !!process.env.JWT_SECRET,
  hasDatabaseURL: !!process.env.DATABASE_URL
});

const app = express();
const server = http.createServer(app);

// Helper to check if in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Initialize Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      // In development, allow ALL origins
      if (isDevelopment) {
        return callback(null, true);
      }
      
      // In production, use whitelist
      const allowedOrigins = [
        'http://localhost:8081',
        'http://localhost:19000',
        'http://localhost:19001',
        'http://localhost:19002',
        'http://10.0.2.2:8081',
        'http://10.0.2.2:19000',
      ];
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  }
});

// Middleware - CORS configuration for Express
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps)
    if (!origin) return callback(null, true);
    
    // In development, allow ALL origins
    if (isDevelopment) {
      return callback(null, true);
    }
    
    // In production, be more restrictive
    const allowedOrigins = [
      'http://localhost:8081',
      'http://localhost:19000',
      'http://10.0.2.2:8081',
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Request logging middleware (helpful for debugging)
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`, {
    origin: req.headers.origin,
    userAgent: req.headers['user-agent']?.substring(0, 50) + '...',
    hasBody: !!req.body && Object.keys(req.body).length > 0
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'clubroom-backend',
    environment: process.env.NODE_ENV,
    platform: req.headers['user-agent']?.includes('Android') ? 'Android' : 
               req.headers['user-agent']?.includes('iPhone') ? 'iOS' : 'Unknown'
  });
});

// Test endpoint for debugging
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    headers: {
      origin: req.headers.origin,
      userAgent: req.headers['user-agent']
    }
  });
});

// Routes
const authRoutes = require('./routes/authRoutes');
const messageRoutes = require('./routes/messageRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const eventRoutes = require('./routes/eventRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/events', eventRoutes);

// Socket.io authentication middleware
const jwt = require('jsonwebtoken');

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    console.log('❌ Socket connection attempted without token');
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    console.log(`✅ Socket authenticated for user: ${socket.userId}`);
    next();
  } catch (err) {
    console.error('❌ Socket authentication failed:', err.message);
    next(new Error('Authentication error'));
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`👤 User ${socket.userId} connected (Socket ID: ${socket.id})`);

  // Join user's personal room
  socket.join(`user_${socket.userId}`);

  // Join conversation room
  socket.on('join_conversation', (conversationId) => {
    socket.join(`conversation_${conversationId}`);
    console.log(`📥 User ${socket.userId} joined conversation: ${conversationId}`);
  });

  // Leave conversation room
  socket.on('leave_conversation', (conversationId) => {
    socket.leave(`conversation_${conversationId}`);
    console.log(`📤 User ${socket.userId} left conversation: ${conversationId}`);
  });

  // Handle real-time messages
  socket.on('send_message', (data) => {
    console.log(`📨 Message sent in conversation ${data.conversationId}`);
    // Emit to all users in the conversation
    io.to(`conversation_${data.conversationId}`).emit('new_message', data);
  });

  // Typing indicators
  socket.on('typing_start', (data) => {
    socket.to(`conversation_${data.conversationId}`).emit('user_typing', {
      userId: socket.userId,
      conversationId: data.conversationId
    });
  });

  socket.on('typing_stop', (data) => {
    socket.to(`conversation_${data.conversationId}`).emit('user_stopped_typing', {
      userId: socket.userId,
      conversationId: data.conversationId
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`👋 User ${socket.userId} disconnected`);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  
  // Don't expose internal errors in production
  const message = isDevelopment ? err.message : 'Something went wrong!';
  
  res.status(err.status || 500).json({ 
    error: message,
    ...(isDevelopment && { stack: err.stack })
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  console.log(`❓ 404 Not Found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Start server - Listen on all network interfaces
const PORT = process.env.PORT || 5001;

server.listen(PORT, '0.0.0.0', () => {
  console.log('═══════════════════════════════════════');
  console.log('🚀 ClubRoom Backend Server Started');
  console.log('═══════════════════════════════════════');
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔌 Port: ${PORT}`);
  console.log('');
  console.log('📱 Access URLs:');
  console.log(`   • iOS Simulator:     http://localhost:${PORT}`);
  console.log(`   • Android Emulator:  http://10.0.2.2:${PORT}`);
  console.log(`   • Browser:           http://localhost:${PORT}`);
  console.log('');
  console.log('🏥 Health Check:');
  console.log(`   → http://localhost:${PORT}/health`);
  console.log('');
  console.log('✅ Server is ready to accept connections');
  console.log('═══════════════════════════════════════');
});