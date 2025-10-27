// backend/src/controllers/matchmakingController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * MATCHMAKING CONTROLLER
 * 
 * Handles player-to-player matchmaking for casual and ranked matches.
 * Uses sport preferences, skill levels, and location to suggest matches.
 */

/**
 * GET /api/matchmaking/suggestions
 * Get match suggestions based on user preferences
 * 
 * Query Parameters:
 * - sportId: Filter by specific sport
 * - mode: 'casual' or 'ranked'
 * - skillLevel: User's skill level
 * - distance: Maximum distance in km (requires latitude/longitude)
 * - latitude: User's latitude
 * - longitude: User's longitude
 */
exports.getMatchSuggestions = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { 
      sportId, 
      mode = 'casual', 
      skillLevel,
      distance = 50,
      latitude,
      longitude 
    } = req.query;

    // Build where clause for user profiles
    const whereClause = {
      userId: { not: userId }, // Exclude current user
    };

    if (sportId) {
      whereClause.sportId = parseInt(sportId);
    }

    // Skill level filtering - find users within reasonable skill range
    if (skillLevel) {
      const skillLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT', 'PROFESSIONAL'];
      const currentIndex = skillLevels.indexOf(skillLevel);
      
      if (currentIndex !== -1) {
        // Allow ±1 skill level difference for better matching
        const minIndex = Math.max(0, currentIndex - 1);
        const maxIndex = Math.min(skillLevels.length - 1, currentIndex + 1);
        const allowedLevels = skillLevels.slice(minIndex, maxIndex + 1);
        
        whereClause.skillLevel = {
          in: allowedLevels
        };
      }
    }

    // Fetch potential matches
    const userProfiles = await prisma.userSportProfile.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarColor: true,
            avatarUrl: true,
            city: true,
            state: true,
            latitude: true,
            longitude: true,
          }
        },
        sport: {
          select: {
            id: true,
            name: true,
            displayName: true
          }
        }
      },
      take: 50 // Get more than needed, filter by distance later
    });

    // Calculate distance and filter if location provided
    let suggestions = userProfiles.map(profile => {
      let distanceKm = null;
      
      if (latitude && longitude && profile.user.latitude && profile.user.longitude) {
        distanceKm = calculateDistance(
          parseFloat(latitude),
          parseFloat(longitude),
          profile.user.latitude,
          profile.user.longitude
        );
      }

      return {
        id: profile.userId,
        playerName: profile.user.fullName || profile.user.username,
        username: profile.user.username,
        sport: profile.sport.displayName || profile.sport.name,
        sportId: profile.sportId,
        skillLevel: profile.skillLevel,
        distance: distanceKm ? `${distanceKm.toFixed(1)} km` : 'Unknown',
        distanceKm: distanceKm,
        winRate: profile.winRate || 0,
        matches: profile.matchesPlayed || 0,
        avatarColor: profile.user.avatarColor || '#666666',
        avatarUrl: profile.user.avatarUrl,
        availability: 'Available now', // TODO: Implement real availability
        location: profile.user.city && profile.user.state 
          ? `${profile.user.city}, ${profile.user.state}` 
          : null
      };
    });

    // Filter by distance if provided
    if (latitude && longitude && distance) {
      suggestions = suggestions.filter(s => 
        s.distanceKm === null || s.distanceKm <= parseFloat(distance)
      );
    }

    // Sort by distance (closest first) if location available
    if (latitude && longitude) {
      suggestions.sort((a, b) => {
        if (a.distanceKm === null) return 1;
        if (b.distanceKm === null) return -1;
        return a.distanceKm - b.distanceKm;
      });
    } else {
      // Otherwise sort by match count (more experienced players first)
      suggestions.sort((a, b) => b.matches - a.matches);
    }

    // Limit to top 10 suggestions
    suggestions = suggestions.slice(0, 10);

    res.json({ 
      suggestions,
      count: suggestions.length,
      filters: {
        sportId: sportId ? parseInt(sportId) : null,
        mode,
        skillLevel,
        distance: parseFloat(distance)
      }
    });

  } catch (error) {
    console.error('Error fetching match suggestions:', error);
    res.status(500).json({ 
      error: 'Failed to fetch match suggestions',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * POST /api/matchmaking/request
 * Send a match request to another player
 * 
 * Body:
 * - targetUserId: ID of user to challenge
 * - sportId: Sport for the match
 * - proposedTime: Proposed match time
 * - stake: Optional points at stake for ranked matches
 */
exports.sendMatchRequest = async (req, res) => {
  try {
    const senderId = req.user.userId;
    const { targetUserId, sportId, proposedTime, stake } = req.body;

    // Validation
    if (!targetUserId || !sportId || !proposedTime) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['targetUserId', 'sportId', 'proposedTime']
      });
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: parseInt(targetUserId) }
    });

    if (!targetUser) {
      return res.status(404).json({ error: 'Target user not found' });
    }

    // Check if sender and target have profiles for this sport
    const [senderProfile, targetProfile] = await Promise.all([
      prisma.userSportProfile.findUnique({
        where: {
          userId_sportId: {
            userId: senderId,
            sportId: parseInt(sportId)
          }
        }
      }),
      prisma.userSportProfile.findUnique({
        where: {
          userId_sportId: {
            userId: parseInt(targetUserId),
            sportId: parseInt(sportId)
          }
        }
      })
    ]);

    if (!senderProfile) {
      return res.status(400).json({ 
        error: 'You do not have a profile for this sport' 
      });
    }

    if (!targetProfile) {
      return res.status(400).json({ 
        error: 'Target user does not have a profile for this sport' 
      });
    }

    // Check for existing pending request
    const existingChallenge = await prisma.challenge.findFirst({
      where: {
        senderId,
        receiverId: parseInt(targetUserId),
        sportId: parseInt(sportId),
        status: 'pending'
      }
    });

    if (existingChallenge) {
      return res.status(400).json({ 
        error: 'You already have a pending match request with this user' 
      });
    }

    // Calculate expiration time (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Create challenge
    const challenge = await prisma.challenge.create({
      data: {
        senderId,
        receiverId: parseInt(targetUserId),
        sportId: parseInt(sportId),
        proposedTime: new Date(proposedTime),
        expiresAt,
        stake: stake ? parseInt(stake) : null,
        status: 'pending'
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
        },
        receiver: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarColor: true,
            avatarUrl: true
          }
        },
        sport: {
          select: {
            id: true,
            name: true,
            displayName: true
          }
        }
      }
    });

    // TODO: Send push notification to target user

    res.status(201).json({ 
      message: 'Match request sent successfully',
      challenge
    });

  } catch (error) {
    console.error('Error sending match request:', error);
    res.status(500).json({ 
      error: 'Failed to send match request',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * GET /api/matchmaking/requests
 * Get user's match requests (sent and received)
 * 
 * Query Parameters:
 * - type: 'sent' | 'received' | 'all' (default: 'all')
 * - status: 'pending' | 'accepted' | 'declined' | 'expired' | 'all' (default: 'pending')
 */
exports.getMatchRequests = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { type = 'all', status = 'pending' } = req.query;

    // Build where clause
    const whereClause = {};

    if (status !== 'all') {
      whereClause.status = status;
    }

    // Fetch based on type
    let requests = [];

    if (type === 'sent' || type === 'all') {
      const sentChallenges = await prisma.challenge.findMany({
        where: {
          ...whereClause,
          senderId: userId
        },
        include: {
          receiver: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatarColor: true,
              avatarUrl: true
            }
          },
          sport: {
            select: {
              id: true,
              name: true,
              displayName: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      requests = [...requests, ...sentChallenges.map(r => ({ ...r, direction: 'sent' }))];
    }

    if (type === 'received' || type === 'all') {
      const receivedChallenges = await prisma.challenge.findMany({
        where: {
          ...whereClause,
          receiverId: userId
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
          },
          sport: {
            select: {
              id: true,
              name: true,
              displayName: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      requests = [...requests, ...receivedChallenges.map(r => ({ ...r, direction: 'received' }))];
    }

    // Sort by creation date
    requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ 
      requests,
      count: requests.length
    });

  } catch (error) {
    console.error('Error fetching match requests:', error);
    res.status(500).json({ 
      error: 'Failed to fetch match requests',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * PUT /api/matchmaking/requests/:requestId
 * Respond to a match request (accept/decline)
 * 
 * Body:
 * - action: 'accept' | 'decline'
 */
exports.respondToMatchRequest = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { requestId } = req.params;
    const { action } = req.body;

    if (!action || !['accept', 'decline'].includes(action)) {
      return res.status(400).json({ 
        error: 'Invalid action. Must be "accept" or "decline"' 
      });
    }

    // Fetch challenge
    const challenge = await prisma.challenge.findUnique({
      where: { id: parseInt(requestId) }
    });

    if (!challenge) {
      return res.status(404).json({ error: 'Match request not found' });
    }

    // Verify user is the receiver
    if (challenge.receiverId !== userId) {
      return res.status(403).json({ 
        error: 'You can only respond to requests sent to you' 
      });
    }

    // Check if already responded
    if (challenge.status !== 'pending') {
      return res.status(400).json({ 
        error: `Request has already been ${challenge.status}` 
      });
    }

    // Check if expired
    if (new Date() > challenge.expiresAt) {
      await prisma.challenge.update({
        where: { id: parseInt(requestId) },
        data: { status: 'expired' }
      });
      return res.status(400).json({ 
        error: 'This challenge has expired' 
      });
    }

    // Update challenge status
    const updatedChallenge = await prisma.challenge.update({
      where: { id: parseInt(requestId) },
      data: {
        status: action === 'accept' ? 'accepted' : 'declined'
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            fullName: true
          }
        },
        receiver: {
          select: {
            id: true,
            username: true,
            fullName: true
          }
        },
        sport: true
      }
    });

    // TODO: Send notification to sender
    // TODO: If accepted, create a match entry

    res.json({ 
      message: `Match request ${action}ed successfully`,
      challenge: updatedChallenge
    });

  } catch (error) {
    console.error('Error responding to match request:', error);
    res.status(500).json({ 
      error: 'Failed to respond to match request',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

