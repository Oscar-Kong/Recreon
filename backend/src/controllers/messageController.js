const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get messages for a conversation
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, before } = req.query;
    const userId = req.userId;

    // Verify user is participant
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId: parseInt(conversationId),
          userId
        }
      }
    });

    if (!participant) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Build query conditions
    const whereConditions = {
      conversationId: parseInt(conversationId),
      isDeleted: false
    };

    if (before) {
      whereConditions.createdAt = {
        lt: new Date(before)
      };
    }

    // Get messages
    const messages = await prisma.message.findMany({
      where: whereConditions,
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarColor: true,
            avatarUrl: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: parseInt(limit)
    });

    // Update last read timestamp
    await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId: parseInt(conversationId),
          userId
        }
      },
      data: {
        lastReadAt: new Date(),
        unreadCount: 0
      }
    });

    res.json({
      messages: messages.reverse(), // Return in chronological order
      hasMore: messages.length === parseInt(limit)
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

// Send a message
const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, messageType = 'text', metadata } = req.body;
    const senderId = req.userId;

    // Verify user is participant
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId: parseInt(conversationId),
          userId: senderId
        }
      }
    });

    if (!participant) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Create message and update conversation in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create message
      const message = await tx.message.create({
        data: {
          conversationId: parseInt(conversationId),
          senderId,
          content,
          messageType,
          metadata
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatarColor: true,
              avatarUrl: true
            }
          }
        }
      });

      // Update conversation last message time
      await tx.conversation.update({
        where: { id: parseInt(conversationId) },
        data: { lastMessageAt: new Date() }
      });

      // Update unread counts for other participants
      await tx.conversationParticipant.updateMany({
        where: {
          conversationId: parseInt(conversationId),
          userId: { not: senderId }
        },
        data: {
          unreadCount: { increment: 1 }
        }
      });

      return message;
    });

    res.status(201).json({ message: result });

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// Delete a message
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.userId;

    // Verify user is the sender
    const message = await prisma.message.findUnique({
      where: { id: parseInt(messageId) }
    });

    if (!message || message.senderId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Soft delete
    await prisma.message.update({
      where: { id: parseInt(messageId) },
      data: { isDeleted: true }
    });

    res.json({ success: true });

  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
};

module.exports = {
  getMessages,
  sendMessage,
  deleteMessage
};