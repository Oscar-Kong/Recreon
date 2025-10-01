// backend/src/middleware/validate.js
const { validationResult } = require('express-validator');

/**
 * VALIDATION MIDDLEWARE
 * 
 * This middleware checks the results from express-validator and returns
 * a formatted error response if validation fails.
 * 
 * Design Pattern: Error Handling Middleware
 * - Centralized validation error handling
 * - Consistent error response format
 * - Prevents invalid data from reaching controllers
 * 
 * Usage:
 * router.post('/endpoint', [validation rules], validate, controller)
 */

const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Format errors for better readability
    const formattedErrors = errors.array().map(error => ({
      field: error.param,
      message: error.msg,
      value: error.value
    }));

    console.log('⚠️  Validation failed:', formattedErrors);

    return res.status(400).json({
      error: 'Validation failed',
      details: formattedErrors
    });
  }

  // Validation passed, proceed to controller
  next();
};

module.exports = validate;