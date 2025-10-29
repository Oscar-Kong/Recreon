// backend/src/routes/eventRoutes.js
const express = require('express');
const { body, param, query } = require('express-validator');
const eventController = require('../controllers/eventController');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

/**
 * EVENT ROUTES
 * 
 * All routes are protected by authentication middleware.
 * We use express-validator for input validation before the controller runs.
 * 
 * Validation Middleware Pattern:
 * 1. Define validation rules as an array
 * 2. Pass to validate middleware (checks for validation errors)
 * 3. If valid, proceed to controller
 */

// Apply auth middleware to all event routes
router.use(authMiddleware);

/**
 * GET /api/events/my-events
 * Get events user created or joined
 */
router.get(
  '/my-events',
  [
    query('date').optional().isISO8601().withMessage('Invalid date format'),
    query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
    query('endDate').optional().isISO8601().withMessage('Invalid end date format'),
    query('sportId').optional().isInt().withMessage('Sport ID must be an integer')
  ],
  validate,
  eventController.getMyEvents
);

/**
 * GET /api/events/discover
 * Get public events user can join
 */
router.get(
  '/discover',
  [
    query('date').optional().isISO8601().withMessage('Invalid date format'),
    query('sportId').optional().isInt().withMessage('Sport ID must be an integer'),
    query('skillLevel').optional().isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT', 'PROFESSIONAL'])
      .withMessage('Invalid skill level'),
    query('radius').optional().isFloat({ min: 0 }).withMessage('Radius must be a positive number'),
    query('latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
    query('longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude')
  ],
  validate,
  eventController.getDiscoverEvents
);

/**
 * GET /api/events/:eventId
 * Get specific event details
 */
router.get(
  '/:eventId',
  [
    param('eventId').isInt().withMessage('Event ID must be an integer')
  ],
  validate,
  eventController.getEventById
);

/**
 * POST /api/events
 * Create a new event
 * 
 * Request body validation ensures data integrity before it reaches the database
 */
router.post(
  '/',
  [
    body('title')
      .trim()
      .isLength({ min: 3, max: 200 })
      .withMessage('Title must be between 3 and 200 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 5000 })
      .withMessage('Description cannot exceed 5000 characters'),
    body('sportId')
      .isInt({ min: 1 })
      .withMessage('Valid sport ID is required'),
    body('eventType')
      .isIn(['tournament', 'practice', 'social', 'league'])
      .withMessage('Event type must be: tournament, practice, social, or league'),
    body('startTime')
      .isISO8601()
      .withMessage('Valid start time is required')
      .custom((value) => {
        // Allow events up to 5 minutes in the past to account for clock drift/network delays
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        if (new Date(value) < fiveMinutesAgo) {
          throw new Error('Start time cannot be in the past');
        }
        return true;
      }),
    body('endTime')
      .isISO8601()
      .withMessage('Valid end time is required')
      .custom((value, { req }) => {
        if (new Date(value) <= new Date(req.body.startTime)) {
          throw new Error('End time must be after start time');
        }
        return true;
      }),
    body('venue')
      .optional()
      .trim()
      .isLength({ max: 255 })
      .withMessage('Venue name too long'),
    body('latitude')
      .optional()
      .isFloat({ min: -90, max: 90 })
      .withMessage('Invalid latitude'),
    body('longitude')
      .optional()
      .isFloat({ min: -180, max: 180 })
      .withMessage('Invalid longitude'),
    body('maxParticipants')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Max participants must be at least 1'),
    body('minParticipants')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Min participants must be at least 1'),
    body('skillLevelMin')
      .optional()
      .isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT', 'PROFESSIONAL'])
      .withMessage('Invalid minimum skill level'),
    body('skillLevelMax')
      .optional()
      .isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT', 'PROFESSIONAL'])
      .withMessage('Invalid maximum skill level'),
    body('entryFee')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Entry fee must be a positive number'),
    body('registrationDeadline')
      .optional()
      .isISO8601()
      .withMessage('Invalid registration deadline format'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
    body('tags.*.name')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Tag name must be between 1 and 50 characters'),
    body('tags.*.color')
      .optional()
      .matches(/^#[0-9A-F]{6}$/i)
      .withMessage('Tag color must be a valid hex color')
  ],
  validate,
  eventController.createEvent
);

/**
 * PUT /api/events/:eventId
 * Update an existing event
 */
router.put(
  '/:eventId',
  [
    param('eventId').isInt().withMessage('Event ID must be an integer'),
    body('title')
      .optional()
      .trim()
      .isLength({ min: 3, max: 200 })
      .withMessage('Title must be between 3 and 200 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 5000 })
      .withMessage('Description cannot exceed 5000 characters'),
    body('startTime')
      .optional()
      .isISO8601()
      .withMessage('Invalid start time format'),
    body('endTime')
      .optional()
      .isISO8601()
      .withMessage('Invalid end time format'),
    body('status')
      .optional()
      .isIn(['active', 'cancelled', 'completed'])
      .withMessage('Status must be: active, cancelled, or completed')
  ],
  validate,
  eventController.updateEvent
);

/**
 * DELETE /api/events/:eventId
 * Delete or cancel an event
 */
router.delete(
  '/:eventId',
  [
    param('eventId').isInt().withMessage('Event ID must be an integer')
  ],
  validate,
  eventController.deleteEvent
);

/**
 * POST /api/events/:eventId/join
 * Join an event
 */
router.post(
  '/:eventId/join',
  [
    param('eventId').isInt().withMessage('Event ID must be an integer')
  ],
  validate,
  eventController.joinEvent
);

/**
 * POST /api/events/:eventId/leave
 * Leave an event
 */
router.post(
  '/:eventId/leave',
  [
    param('eventId').isInt().withMessage('Event ID must be an integer')
  ],
  validate,
  eventController.leaveEvent
);

module.exports = router;