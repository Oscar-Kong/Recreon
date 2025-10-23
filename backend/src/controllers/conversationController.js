// backend/src/controllers/conversationController.js
const prisma = require('../config/database');

/**
 * GET /api/messages/conversations
 * Get all conversations for the authenticated user
 */
exports.getConversations = async (req, res) => {
  try {
    const userId = req.userId;

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: userId
          }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
                avatarColor: true,
                avatarUrl: true
              }
            }
          }
        },
        messages: {
          take: 1,
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                fullName: true
              }
            }
          }
        }
      },
      orderBy: {
        lastMessageAt: 'desc'
      }
    });

    // Transform conversations to include unread count and last message
    const transformedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const participant = conv.participants.find(p => p.userId === userId);
        
        // Count unread messages
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            senderId: { not: userId },
            createdAt: {
              gt: participant?.lastReadAt || new Date(0)
            },
            isDeleted: false
          }
        });

        return {
          ...conv,
          lastMessage: conv.messages[0] || null,
          messages: undefined, // Remove full messages array
          unreadCount,
          isPinned: participant?.isPinned || false
        };
      })
    );

    res.json({ conversations: transformedConversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ 
      error: 'Failed to fetch conversations',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * POST /api/messages/conversations
 * Create a new conversation
 */
exports.createConversation = async (req, res) => {
  try {
    const { participantIds, type = 'direct', context = 'general' } = req.body;
    const creatorId = req.userId;

    // Validation
    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return res.status(400).json({ error: 'participantIds is required and must be a non-empty array' });
    }

    // For direct conversations, check if one already exists
    if (type === 'direct' && participantIds.length === 1) {
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          conversationType: 'direct',
          participants: {
            every: {
              userId: {
                in: [creatorId, participantIds[0]]
              }
            }
          }
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  fullName: true,
                  avatarColor: true,
                  avatarUrl: true
                }
              }
            }
          }
        }
      });

      if (existingConversation && existingConversation.participants.length === 2) {
        return res.json({ conversation: existingConversation });
      }
    }

    // Create new conversation
    const allParticipants = [creatorId, ...participantIds];
    
    const conversation = await prisma.conversation.create({
      data: {
        conversationType: type,
        context,
        participants: {
          create: allParticipants.map(userId => ({
            userId,
            role: userId === creatorId ? 'creator' : 'member'
          }))
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
                avatarColor: true,
                avatarUrl: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({ conversation });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ 
      error: 'Failed to create conversation',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * PUT /api/messages/conversations/:conversationId/pin
 * Toggle pin status for a conversation
 */
exports.togglePin = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.userId;

    // Get current participant record
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId: parseInt(conversationId),
          userId
        }
      }
    });

    if (!participant) {
      return res.status(404).json({ error: 'Conversation not found or you are not a participant' });
    }

    // Toggle pin status
    const updated = await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId: parseInt(conversationId),
          userId
        }
      },
      data: {
        isPinned: !participant.isPinned
      }
    });

    res.json({ 
      isPinned: updated.isPinned,
      success: true
    });
  } catch (error) {
    console.error('Error toggling pin:', error);
    res.status(500).json({ 
      error: 'Failed to toggle pin',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};