const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const conversationController = require('../controllers/conversationController');
const messageController = require('../controllers/messageController');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Conversation routes
router.get('/conversations', conversationController.getConversations);
router.post('/conversations', conversationController.createConversation);
router.put('/conversations/:conversationId/pin', conversationController.togglePin);

// Message routes
router.get('/conversations/:conversationId/messages', messageController.getMessages);
router.post('/conversations/:conversationId/messages', messageController.sendMessage);
router.delete('/messages/:messageId', messageController.deleteMessage);

module.exports = router;