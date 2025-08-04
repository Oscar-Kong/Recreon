const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all conversations for a user
const getConversations = async (req, res) => {
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
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
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

    // Get unread counts
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const participant = conv.participants.find(p => p.userId === userId);
        
        // Count unread messages
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            createdAt: {
              gt: participant.lastReadAt || new Date(0)
            },
            senderId: {
              not: userId
            }
          }
        });

        return {
          ...conv,
          unreadCount,
          isPinned: participant.isPinned,
          lastMessage: conv.messages[0] || null
        };
      })
    );

    res.json({
      conversations: conversationsWithUnread,
      total: conversationsWithUnread.length
    });

  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
};

// Create a new conversation
const createConversation = async (req, res) => {
  try {
    const { participantIds, type = 'direct', context = 'general', title } = req.body;
    const creatorId = req.userId;

    // Ensure creator is included
    if (!participantIds.includes(creatorId)) {
      participantIds.push(creatorId);
    }

    // For direct conversations, check if one already exists
    if (type === 'direct' && participantIds.length === 2) {
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          conversationType: 'direct',
          context: context,
          AND: participantIds.map(id => ({
            participants: {
              some: {
                userId: id
              }
            }
          }))
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  fullName: true,
                  avatarColor: true
                }
              }
            }
          }
        }
      });

      if (existingConversation) {
        return res.json({ conversation: existingConversation });
      }
    }

    // Generate avatar color for conversation
    const avatarColor = '#' + Math.floor(Math.random()*16777215).toString(16);

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        conversationType: type,
        context,
        avatarColor,
        title,
        participants: {
          create: participantIds.map(userId => ({
            userId,
            role: userId === creatorId ? 'admin' : 'member'
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
                avatarColor: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({ conversation });

  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
};

// Toggle pin status
const togglePin = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.userId;

    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId: parseInt(conversationId),
          userId
        }
      }
    });

    if (!participant) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

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

    res.json({ isPinned: updated.isPinned });

  } catch (error) {
    console.error('Error toggling pin:', error);
    res.status(500).json({ error: 'Failed to update pin status' });
  }
};

module.exports = {
  getConversations,
  createConversation,
  togglePin
};