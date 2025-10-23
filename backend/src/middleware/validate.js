// backend/src/middleware/validate.js
const { validationResult } = require('express-validator');

/**
 * Validation Middleware
 * 
 * This middleware checks for validation errors from express-validator
 * and returns a standardized error response if any are found.
 * 
 * Usage:
 * router.post('/endpoint', [validationRules], validate, controller);
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Log validation errors in development
    if (process.env.NODE_ENV === 'development') {
      console.log('❌ Validation errors:', errors.array());
    }
    
    // Format errors for response
    const formattedErrors = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value
    }));
    
    return res.status(400).json({ 
      error: 'Validation failed',
      details: formattedErrors
    });
  }
  
  next();
};

module.exports = validate;