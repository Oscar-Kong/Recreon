// backend/src/utils/passwordValidator.js

/**
 * Password Validation Utility
 * 
 * Enforces strong password requirements to improve security.
 */

/**
 * Password strength requirements
 */
const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?',
};

/**
 * Validate Password Strength
 * Returns { valid: boolean, errors: string[] }
 */
function validatePassword(password) {
  const errors = [];

  if (!password) {
    return {
      valid: false,
      errors: ['Password is required'],
    };
  }

  // Check length
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`);
  }

  if (password.length > PASSWORD_REQUIREMENTS.maxLength) {
    errors.push(`Password must not exceed ${PASSWORD_REQUIREMENTS.maxLength} characters`);
  }

  // Check for uppercase letters
  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  // Check for lowercase letters
  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  // Check for numbers
  if (PASSWORD_REQUIREMENTS.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // Check for special characters
  if (PASSWORD_REQUIREMENTS.requireSpecialChars) {
    const specialCharsRegex = new RegExp(`[${PASSWORD_REQUIREMENTS.specialChars.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}]`);
    if (!specialCharsRegex.test(password)) {
      errors.push('Password must contain at least one special character (!@#$%^&*...)');
    }
  }

  // Check for common weak patterns
  const weakPatterns = [
    /^123456/,
    /^password/i,
    /^qwerty/i,
    /^abc123/i,
    /^letmein/i,
    /^welcome/i,
    /^admin/i,
  ];

  for (const pattern of weakPatterns) {
    if (pattern.test(password)) {
      errors.push('Password is too common. Please choose a more unique password');
      break;
    }
  }

  // Check for sequential characters
  if (/(.)\1{2,}/.test(password)) {
    errors.push('Password should not contain repeated characters (e.g., "aaa", "111")');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate Password Strength Score (0-100)
 * Returns { score: number, strength: string, feedback: string[] }
 */
function calculatePasswordStrength(password) {
  if (!password) {
    return { score: 0, strength: 'very-weak', feedback: ['Enter a password'] };
  }

  let score = 0;
  const feedback = [];

  // Length scoring (up to 30 points)
  if (password.length >= 8) score += 10;
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;

  // Character variety (up to 40 points)
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/\d/.test(password)) score += 10;
  if (/[^a-zA-Z0-9]/.test(password)) score += 10;

  // Complexity bonus (up to 30 points)
  const uniqueChars = new Set(password).size;
  if (uniqueChars > password.length * 0.5) score += 10; // Good variety
  if (!/(.)\1{2,}/.test(password)) score += 10; // No repeated chars
  if (!/^[a-zA-Z]+$/.test(password)) score += 10; // Not just letters

  // Determine strength level
  let strength;
  if (score < 30) {
    strength = 'very-weak';
    feedback.push('Password is very weak');
    feedback.push('Add more characters, numbers, and symbols');
  } else if (score < 50) {
    strength = 'weak';
    feedback.push('Password could be stronger');
    feedback.push('Consider adding special characters');
  } else if (score < 70) {
    strength = 'medium';
    feedback.push('Password strength is moderate');
    feedback.push('Consider making it longer');
  } else if (score < 90) {
    strength = 'strong';
    feedback.push('Password is strong');
  } else {
    strength = 'very-strong';
    feedback.push('Excellent password strength!');
  }

  return { score, strength, feedback };
}

/**
 * Check if password has been compromised (basic check)
 * In production, use Have I Been Pwned API
 */
function isPasswordCompromised(password) {
  // Common compromised passwords
  const compromisedPasswords = [
    'password',
    '12345678',
    'qwerty123',
    'abc123456',
    'password123',
    'welcome123',
  ];

  return compromisedPasswords.includes(password.toLowerCase());
}

/**
 * Get Password Requirements Text
 * Returns user-friendly description of requirements
 */
function getPasswordRequirements() {
  const requirements = [];

  requirements.push(`At least ${PASSWORD_REQUIREMENTS.minLength} characters long`);
  
  if (PASSWORD_REQUIREMENTS.requireUppercase) {
    requirements.push('At least one uppercase letter (A-Z)');
  }
  
  if (PASSWORD_REQUIREMENTS.requireLowercase) {
    requirements.push('At least one lowercase letter (a-z)');
  }
  
  if (PASSWORD_REQUIREMENTS.requireNumbers) {
    requirements.push('At least one number (0-9)');
  }
  
  if (PASSWORD_REQUIREMENTS.requireSpecialChars) {
    requirements.push('At least one special character (!@#$%...)');
  }

  return requirements;
}

module.exports = {
  validatePassword,
  calculatePasswordStrength,
  isPasswordCompromised,
  getPasswordRequirements,
  PASSWORD_REQUIREMENTS,
};

