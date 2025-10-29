// backend/src/controllers/passwordResetController.js
const prisma = require('../config/database');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { validatePassword } = require('../utils/passwordValidator');

/**
 * Password Reset Controller
 * 
 * Handles password reset functionality with email verification.
 * Implements secure token-based reset flow.
 */

// In-memory store for reset tokens (use Redis in production)
// Structure: { token: { userId, email, expires } }
const resetTokenStore = new Map();

// Token expiration time (15 minutes)
const TOKEN_EXPIRY = 15 * 60 * 1000;

/**
 * Request Password Reset
 * Generates a reset token and sends reset email
 */
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
      },
    });

    // Always return success (don't reveal if email exists)
    // This prevents email enumeration attacks
    if (!user) {
      console.log(`Password reset requested for non-existent email: ${email}`);
      return res.status(200).json({
        message: 'If an account exists with this email, you will receive a password reset link',
      });
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Store token with user info and expiration
    resetTokenStore.set(hashedToken, {
      userId: user.id,
      email: user.email,
      expires: Date.now() + TOKEN_EXPIRY,
    });

    // Clean up expired tokens
    cleanupExpiredTokens();

    // TODO: Send email with reset link
    // In production, use SendGrid, AWS SES, or similar
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:8081'}/reset-password?token=${resetToken}`;
    
    console.log('📧 Password Reset Email (Development Only):');
    console.log('To:', user.email);
    console.log('Reset Link:', resetLink);
    console.log('Token expires in 15 minutes');

    // In development, include token in response
    // REMOVE THIS IN PRODUCTION - tokens should only be sent via email
    const response = {
      message: 'If an account exists with this email, you will receive a password reset link',
    };

    if (process.env.NODE_ENV === 'development') {
      response.debug = {
        resetToken,
        resetLink,
        expiresIn: '15 minutes',
      };
    }

    res.status(200).json(response);

  } catch (error) {
    console.error('❌ Password reset request error:', error);
    res.status(500).json({
      error: 'Failed to process password reset request',
    });
  }
};

/**
 * Verify Reset Token
 * Checks if token is valid and not expired
 */
const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    // Hash the token to match stored value
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const tokenData = resetTokenStore.get(hashedToken);

    if (!tokenData) {
      return res.status(400).json({
        error: 'Invalid or expired reset token',
      });
    }

    // Check if token is expired
    if (Date.now() > tokenData.expires) {
      resetTokenStore.delete(hashedToken);
      return res.status(400).json({
        error: 'Reset token has expired',
      });
    }

    // Token is valid
    res.status(200).json({
      valid: true,
      email: tokenData.email,
    });

  } catch (error) {
    console.error('❌ Token verification error:', error);
    res.status(500).json({
      error: 'Failed to verify reset token',
    });
  }
};

/**
 * Reset Password
 * Sets new password using valid reset token
 */
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        error: 'Password does not meet requirements',
        details: passwordValidation.errors,
      });
    }

    // Hash the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const tokenData = resetTokenStore.get(hashedToken);

    if (!tokenData) {
      return res.status(400).json({
        error: 'Invalid or expired reset token',
      });
    }

    // Check expiration
    if (Date.now() > tokenData.expires) {
      resetTokenStore.delete(hashedToken);
      return res.status(400).json({
        error: 'Reset token has expired',
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password
    await prisma.user.update({
      where: { id: tokenData.userId },
      data: { passwordHash: hashedPassword },
    });

    // Delete used token
    resetTokenStore.delete(hashedToken);

    // TODO: Revoke all refresh tokens for this user
    // revokeAllUserTokens(tokenData.userId);

    // TODO: Send confirmation email
    console.log(`✅ Password reset successful for user ${tokenData.userId}`);

    res.status(200).json({
      message: 'Password reset successful',
    });

  } catch (error) {
    console.error('❌ Password reset error:', error);
    res.status(500).json({
      error: 'Failed to reset password',
    });
  }
};

/**
 * Clean up expired tokens
 * Removes expired tokens from store
 */
function cleanupExpiredTokens() {
  const now = Date.now();
  for (const [token, data] of resetTokenStore.entries()) {
    if (now > data.expires) {
      resetTokenStore.delete(token);
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupExpiredTokens, 5 * 60 * 1000);

module.exports = {
  requestPasswordReset,
  verifyResetToken,
  resetPassword,
};

