const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const passwordResetController = require('../controllers/passwordResetController');
const authMiddleware = require('../middleware/auth');
const { authLimiter, passwordResetLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/\d/)
    .withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/)
    .withMessage('Password must contain at least one special character'),
  body('fullName')
    .notEmpty()
    .withMessage('Full name is required')
];

const loginValidation = [
  body('username')
    .notEmpty()
    .withMessage('Username or email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Public routes with rate limiting
router.post('/register', authLimiter, registerValidation, authController.register);
router.post('/login', authLimiter, loginValidation, authController.login);

// Protected routes
router.get('/me', authMiddleware, authController.getMe);
router.put('/profile', authMiddleware, authController.updateProfile);
router.put('/change-password', authMiddleware, authController.changePassword);
router.delete('/delete-account', authMiddleware, authController.deleteAccount);

// Token management
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authMiddleware, authController.logout);

// Password reset routes
router.post(
  '/forgot-password',
  passwordResetLimiter,
  [
    body('email')
      .isEmail()
      .withMessage('Valid email is required'),
  ],
  passwordResetController.requestPasswordReset
);

router.get('/verify-reset-token/:token', passwordResetController.verifyResetToken);

router.post(
  '/reset-password',
  passwordResetLimiter,
  [
    body('token')
      .notEmpty()
      .withMessage('Reset token is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/[A-Z]/)
      .withMessage('Password must contain at least one uppercase letter')
      .matches(/[a-z]/)
      .withMessage('Password must contain at least one lowercase letter')
      .matches(/\d/)
      .withMessage('Password must contain at least one number')
      .matches(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/)
      .withMessage('Password must contain at least one special character'),
  ],
  passwordResetController.resetPassword
);

// User sport profiles
router.post('/sport-profiles', authMiddleware, authController.addSportProfile);
router.delete('/sport-profiles/:sportId', authMiddleware, authController.removeSportProfile);
router.put('/sport-profiles/:sportId', authMiddleware, authController.updateSportProfile);

module.exports = router;