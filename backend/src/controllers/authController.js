// backend/src/controllers/authController.js
const prisma = require('../config/database'); // Import singleton
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Generate JWT Token
const generateToken = (userId, username) => {
  return jwt.sign(
    { userId, username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// Register new user
const register = async (req, res) => {
  console.log('📝 Register endpoint hit at:', new Date().toISOString());
  console.log('Request body received:', JSON.stringify(req.body, null, 2));
  
  try {
    // Check validation errors
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      console.log('❌ Validation failed:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, fullName, city, state, country } = req.body;
    console.log('Extracted data:', { username, email, fullName });

    // ========================================
    // FIX: Check if user exists with proper syntax
    // ========================================
    console.log('Checking if user exists...');
    
    // First check email
    const existingEmail = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase()
      }
    });

    if (existingEmail) {
      console.log('❌ Email already registered');
      return res.status(400).json({ 
        error: 'Email already registered' 
      });
    }

    // Then check username
    const existingUsername = await prisma.user.findUnique({
      where: {
        username: username.toLowerCase()
      }
    });

    if (existingUsername) {
      console.log('❌ Username already taken');
      return res.status(400).json({ 
        error: 'Username already taken' 
      });
    }

    console.log('✅ User does not exist, proceeding with registration...');
    
    // Hash password
    console.log('Hashing password...');
    const passwordHash = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');

    // Generate random avatar color
    const avatarColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    console.log('Generated avatar color:', avatarColor);

    // ========================================
    // FIX: Create user with proper nested create
    // ========================================
    console.log('Creating user in database...');
    const user = await prisma.user.create({
      data: {
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        passwordHash,
        fullName,
        avatarColor,
        city: city || null,
        state: state || null,
        country: country || null,
        // Create profile if it doesn't auto-create
        profile: {
          create: {
            bio: null,
            preferredSports: []
          }
        }
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        avatarColor: true,
        avatarUrl: true,
        city: true,
        state: true,
        country: true
      }
    });

    console.log('✅ User created successfully:', {
      id: user.id,
      username: user.username,
      email: user.email
    });

    // Generate token
    const token = generateToken(user.id, user.username);
    console.log('JWT token generated');

    const response = {
      success: true,
      token,
      user
    };
    
    console.log('Sending success response');
    res.status(201).json(response);

  } catch (error) {
    console.error('❌ Registration error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // ========================================
    // BETTER ERROR HANDLING
    // ========================================
    
    // Prisma unique constraint violation
    if (error.code === 'P2002') {
      console.error('Unique constraint violation on field:', error.meta?.target);
      return res.status(400).json({ 
        error: 'User with this email or username already exists' 
      });
    }
    
    // Prisma record not found
    if (error.code === 'P2025') {
      console.error('Record not found');
      return res.status(404).json({ 
        error: 'Related record not found' 
      });
    }

    // Prisma foreign key constraint
    if (error.code === 'P2003') {
      console.error('Foreign key constraint failed');
      return res.status(400).json({ 
        error: 'Invalid reference data' 
      });
    }

    // Generic error with details for debugging
    res.status(500).json({ 
      error: 'Failed to register user', 
      details: error.message,
      // Only in development
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
};

// Login user
const login = async (req, res) => {
  console.log('🔐 Login endpoint hit at:', new Date().toISOString());
  console.log('Login attempt for:', req.body.username);
  
  try {
    const { username, password } = req.body;

    // ========================================
    // FIX: Find user - try username first, then email
    // ========================================
    console.log('Searching for user...');
    
    let user = await prisma.user.findUnique({
      where: { username: username.toLowerCase() }
    });

    // If not found by username, try email
    if (!user) {
      user = await prisma.user.findUnique({
        where: { email: username.toLowerCase() }
      });
    }

    if (!user) {
      console.log('❌ User not found:', username);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('User found, verifying password...');
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      console.log('❌ Invalid password for user:', username);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('✅ Password verified successfully');

    // Remove password from response
    const { passwordHash, ...userWithoutPassword } = user;

    // Generate token
    const token = generateToken(user.id, user.username);
    console.log('JWT token generated for user:', user.username);

    res.json({
      success: true,
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to login',
      details: error.message 
    });
  }
};

// Get current user
const getMe = async (req, res) => {
  console.log('👤 GetMe endpoint hit for userId:', req.userId);
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        avatarColor: true,
        avatarUrl: true,
        city: true,
        state: true,
        country: true,
        profile: true,
        sportProfiles: {
          include: {
            sport: true
          }
        }
      }
    });

    if (!user) {
      console.log('❌ User not found:', req.userId);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('✅ User data retrieved successfully');
    res.json({ user });

  } catch (error) {
    console.error('❌ Get user error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to get user' });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  console.log('✏️ UpdateProfile endpoint hit for userId:', req.userId);
  console.log('Update data:', req.body);
  
  try {
    const { fullName, city, state, country, bio } = req.body;
    const userId = req.userId;

    // Update user and profile
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName,
        city,
        state,
        country,
        profile: {
          update: {
            bio
          }
        }
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        avatarColor: true,
        avatarUrl: true,
        city: true,
        state: true,
        country: true,
        profile: true
      }
    });

    console.log('✅ Profile updated successfully');
    res.json({ user });

  } catch (error) {
    console.error('❌ Update profile error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile
};
