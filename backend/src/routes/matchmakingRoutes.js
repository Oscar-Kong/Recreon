// backend/src/routes/matchmakingRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const matchmakingController = require('../controllers/matchmakingController');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Match suggestions
router.get('/suggestions', matchmakingController.getMatchSuggestions);

// Match requests
router.post('/request', matchmakingController.sendMatchRequest);
router.get('/requests', matchmakingController.getMatchRequests);
router.put('/requests/:requestId', matchmakingController.respondToMatchRequest);

module.exports = router;

