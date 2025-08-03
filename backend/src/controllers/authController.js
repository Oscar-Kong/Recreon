const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

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
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, fullName, city, state, country } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: username.toLowerCase() }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: existingUser.email === email.toLowerCase() 
          ? 'Email already registered' 
          : 'Username already taken' 
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate random avatar color
    const avatarColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');

    // Create user
    const user = await prisma.user.create({
      data: {
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        passwordHash,
        fullName,
        avatarColor,
        city,
        state,
        country,
        profile: {
          create: {
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

    // Generate token
    const token = generateToken(user.id, user.username);

    res.status(201).json({
      success: true,
      token,
      user
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username or email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username.toLowerCase() },
          { email: username.toLowerCase() }
        ]
      },
      select: {
        id: true,
        username: true,
        email: true,
        passwordHash: true,
        fullName: true,
        avatarColor: true,
        avatarUrl: true,
        city: true,
        state: true,
        country: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Remove password from response
    const { passwordHash, ...userWithoutPassword } = user;

    // Generate token
    const token = generateToken(user.id, user.username);

    res.json({
      success: true,
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
};

// Get current user
const getMe = async (req, res) => {
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
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
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

    res.json({ user });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile
};