// backend/src/controllers/eventController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * EVENT CONTROLLER
 * 
 * This controller handles all event-related operations.
 * Design Pattern: Controller layer in MVC - handles HTTP requests/responses
 * and delegates business logic to Prisma ORM.
 */

/**
 * GET /api/events/my-events
 * Fetches events that the authenticated user has created or joined
 * 
 * Query Parameters:
 * - date: ISO date string to filter events by date
 * - startDate: Filter events from this date onwards
 * - endDate: Filter events up to this date
 * - sportId: Filter by specific sport
 */
exports.getMyEvents = async (req, res) => {
  try {
    const userId = req.user.userId; // From auth middleware
    const { date, startDate, endDate, sportId } = req.query;

    // Build the WHERE clause dynamically based on query parameters
    const whereClause = {
      OR: [
        { creatorId: userId }, // Events created by user
        { 
          participants: {
            some: { 
              userId: userId,
              status: { in: ['CONFIRMED', 'PENDING'] }
            }
          }
        }
      ]
    };

    // Date filtering
    if (date) {
      const selectedDate = new Date(date);
      const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));
      
      whereClause.startTime = {
        gte: startOfDay,
        lte: endOfDay
      };
    } else if (startDate || endDate) {
      whereClause.startTime = {};
      if (startDate) whereClause.startTime.gte = new Date(startDate);
      if (endDate) whereClause.startTime.lte = new Date(endDate);
    }

    // Sport filtering
    if (sportId) {
      whereClause.sportId = parseInt(sportId);
    }

    // Fetch events with related data
    const events = await prisma.event.findMany({
      where: whereClause,
      include: {
        sport: true,
        creator: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
            avatarColor: true
          }
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true
              }
            }
          }
        },
        tags: true,
        _count: {
          select: {
            participants: true
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    // Transform events for frontend
    const transformedEvents = events.map(event => ({
      id: event.id.toString(),
      name: event.title,
      title: event.title,
      date: event.startTime,
      time: formatTime(event.startTime),
      location: event.venue || 'TBD',
      venue: event.venue,
      participants: event._count.participants,
      maxParticipants: event.maxParticipants,
      color: getEventColor(event.eventType, event.tags),
      sport: event.sport?.displayName || event.sport?.name,
      sportId: event.sportId,
      eventType: event.eventType,
      description: event.description,
      startTime: event.startTime,
      endTime: event.endTime,
      skillLevelRange: formatSkillLevel(event.skillLevelMin, event.skillLevelMax),
      isCreator: event.creatorId === userId,
      status: event.status,
      tags: event.tags.map(tag => ({
        name: tag.tagName,
        color: tag.tagColor
      }))
    }));

    res.json({ events: transformedEvents });

  } catch (error) {
    console.error('Error fetching my events:', error);
    res.status(500).json({ 
      error: 'Failed to fetch events',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * GET /api/events/discover
 * Fetches public events that user can join
 */
exports.getDiscoverEvents = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { date, sportId, skillLevel, radius, latitude, longitude } = req.query;

    const whereClause = {
      status: 'active',
      creatorId: { not: userId },
      NOT: {
        participants: {
          some: { userId: userId }
        }
      },
      startTime: {
        gte: new Date()
      }
    };

    // Date filtering
    if (date) {
      const selectedDate = new Date(date);
      const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));
      
      whereClause.startTime = {
        gte: startOfDay,
        lte: endOfDay
      };
    }

    // Sport filtering
    if (sportId) {
      whereClause.sportId = parseInt(sportId);
    }

    // Skill level filtering
    if (skillLevel) {
      whereClause.OR = [
        { skillLevelMin: null, skillLevelMax: null },
        { 
          skillLevelMin: { lte: skillLevel },
          skillLevelMax: { gte: skillLevel }
        }
      ];
    }

    const events = await prisma.event.findMany({
      where: whereClause,
      include: {
        sport: true,
        creator: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
            avatarColor: true
          }
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true
              }
            }
          }
        },
        tags: true,
        _count: {
          select: {
            participants: true
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      },
      take: 50
    });

    // If location filtering is requested
    let filteredEvents = events;
    if (latitude && longitude && radius) {
      const userLat = parseFloat(latitude);
      const userLon = parseFloat(longitude);
      const maxRadius = parseFloat(radius);

      filteredEvents = events.filter(event => {
        if (!event.latitude || !event.longitude) return false;
        const distance = calculateDistance(userLat, userLon, event.latitude, event.longitude);
        return distance <= maxRadius;
      });
    }

    // Transform events for frontend
    const transformedEvents = filteredEvents.map(event => {
      const participantCount = event._count.participants;
      const isFull = event.maxParticipants ? participantCount >= event.maxParticipants : false;
      
      return {
        id: event.id.toString(),
        name: event.title,
        title: event.title,
        date: event.startTime,
        time: formatTime(event.startTime),
        location: event.venue || 'TBD',
        venue: event.venue,
        participants: participantCount,
        maxParticipants: event.maxParticipants,
        isFull,
        color: getEventColor(event.eventType, event.tags),
        sport: event.sport?.displayName || event.sport?.name,
        sportId: event.sportId,
        eventType: event.eventType,
        description: event.description,
        startTime: event.startTime,
        endTime: event.endTime,
        skillLevelRange: formatSkillLevel(event.skillLevelMin, event.skillLevelMax),
        creator: event.creator,
        status: event.status,
        tags: event.tags.map(tag => ({
          name: tag.tagName,
          color: tag.tagColor
        }))
      };
    });

    res.json({ events: transformedEvents });

  } catch (error) {
    console.error('Error fetching discover events:', error);
    res.status(500).json({ 
      error: 'Failed to fetch discover events',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * GET /api/events/:eventId
 * Fetch detailed information about a specific event
 */
exports.getEventById = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.userId;

    const event = await prisma.event.findUnique({
      where: { id: parseInt(eventId) },
      include: {
        sport: true,
        creator: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
            avatarColor: true
          }
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
                avatarUrl: true,
                avatarColor: true
              }
            }
          }
        },
        tags: true
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if current user is participating
    const userParticipation = event.participants.find(p => p.userId === userId);

    const transformedEvent = {
      id: event.id.toString(),
      title: event.title,
      description: event.description,
      eventType: event.eventType,
      startTime: event.startTime,
      endTime: event.endTime,
      venue: event.venue,
      location: event.latitude && event.longitude ? {
        latitude: event.latitude,
        longitude: event.longitude
      } : null,
      sport: event.sport,
      creator: event.creator,
      participants: event.participants.map(p => ({
        ...p.user,
        status: p.status,
        registeredAt: p.registeredAt
      })),
      maxParticipants: event.maxParticipants,
      minParticipants: event.minParticipants,
      skillLevelRange: {
        min: event.skillLevelMin,
        max: event.skillLevelMax
      },
      entryFee: event.entryFee,
      registrationDeadline: event.registrationDeadline,
      status: event.status,
      tags: event.tags.map(tag => ({
        name: tag.tagName,
        color: tag.tagColor
      })),
      isCreator: event.creatorId === userId,
      isParticipating: !!userParticipation,
      participationStatus: userParticipation?.status
    };

    res.json({ event: transformedEvent });

  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ 
      error: 'Failed to fetch event',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * POST /api/events
 * Create a new event
 */
exports.createEvent = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      title,
      description,
      sportId,
      eventType,
      startTime,
      endTime,
      venue,
      latitude,
      longitude,
      maxParticipants,
      minParticipants,
      skillLevelMin,
      skillLevelMax,
      entryFee,
      registrationDeadline,
      tags
    } = req.body;

    // Validation
    if (!title || !sportId || !eventType || !startTime || !endTime) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['title', 'sportId', 'eventType', 'startTime', 'endTime']
      });
    }

    // Verify sport exists
    const sport = await prisma.sport.findUnique({
      where: { id: parseInt(sportId) }
    });

    if (!sport) {
      return res.status(400).json({ error: 'Invalid sport ID' });
    }

    // Use a transaction to create event and tags atomically
    const result = await prisma.$transaction(async (tx) => {
      // Create the event
      const event = await tx.event.create({
        data: {
          creatorId: userId,
          sportId: parseInt(sportId),
          title,
          description,
          eventType,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          venue,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
          minParticipants: minParticipants ? parseInt(minParticipants) : null,
          skillLevelMin,
          skillLevelMax,
          entryFee: entryFee ? parseFloat(entryFee) : null,
          registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
          status: 'active'
        }
      });

      // Create tags if provided
      if (tags && tags.length > 0) {
        await tx.eventTag.createMany({
          data: tags.map(tag => ({
            eventId: event.id,
            tagName: tag.name,
            tagColor: tag.color || '#666666'
          }))
        });
      }

      // Auto-join creator as first participant
      await tx.eventParticipant.create({
        data: {
          eventId: event.id,
          userId: userId,
          status: 'CONFIRMED'
        }
      });

      return event;
    });

    // Fetch the complete event with all relations
    const createdEvent = await prisma.event.findUnique({
      where: { id: result.id },
      include: {
        sport: true,
        creator: {
          select: {
            id: true,
            username: true,
            fullName: true
          }
        },
        participants: true,
        tags: true
      }
    });

    res.status(201).json({ 
      message: 'Event created successfully',
      event: createdEvent
    });

  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ 
      error: 'Failed to create event',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * PUT /api/events/:eventId
 * Update an existing event (only creator can update)
 */
exports.updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.userId;
    const updates = req.body;

    // Verify event exists and user is creator
    const event = await prisma.event.findUnique({
      where: { id: parseInt(eventId) }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.creatorId !== userId) {
      return res.status(403).json({ error: 'Only the event creator can update this event' });
    }

    // Build update data object dynamically
    const updateData = {};
    const allowedFields = [
      'title', 'description', 'startTime', 'endTime', 'venue',
      'latitude', 'longitude', 'maxParticipants', 'minParticipants',
      'skillLevelMin', 'skillLevelMax', 'entryFee', 'registrationDeadline', 'status'
    ];

    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        if (field === 'startTime' || field === 'endTime' || field === 'registrationDeadline') {
          updateData[field] = new Date(updates[field]);
        } else if (field === 'latitude' || field === 'longitude' || field === 'entryFee') {
          updateData[field] = parseFloat(updates[field]);
        } else if (field === 'maxParticipants' || field === 'minParticipants') {
          updateData[field] = parseInt(updates[field]);
        } else {
          updateData[field] = updates[field];
        }
      }
    });

    const updatedEvent = await prisma.event.update({
      where: { id: parseInt(eventId) },
      data: updateData,
      include: {
        sport: true,
        creator: {
          select: {
            id: true,
            username: true,
            fullName: true
          }
        },
        participants: true,
        tags: true
      }
    });

    res.json({ 
      message: 'Event updated successfully',
      event: updatedEvent
    });

  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ 
      error: 'Failed to update event',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * DELETE /api/events/:eventId
 * Delete an event (only creator can delete, or cancel if participants exist)
 */
exports.deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.userId;

    const event = await prisma.event.findUnique({
      where: { id: parseInt(eventId) },
      include: {
        participants: true
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.creatorId !== userId) {
      return res.status(403).json({ error: 'Only the event creator can delete this event' });
    }

    // If event has participants other than creator, cancel instead of delete
    const otherParticipants = event.participants.filter(p => p.userId !== userId);
    if (otherParticipants.length > 0) {
      await prisma.event.update({
        where: { id: parseInt(eventId) },
        data: { status: 'cancelled' }
      });
      return res.json({ 
        message: 'Event cancelled (had participants)',
        status: 'cancelled'
      });
    }

    // No other participants, safe to delete
    await prisma.event.delete({
      where: { id: parseInt(eventId) }
    });

    res.json({ message: 'Event deleted successfully' });

  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ 
      error: 'Failed to delete event',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * POST /api/events/:eventId/join
 * Join an event
 */
exports.joinEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.userId;

    const event = await prisma.event.findUnique({
      where: { id: parseInt(eventId) },
      include: {
        participants: true
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if already participating
    const existingParticipation = event.participants.find(p => p.userId === userId);
    if (existingParticipation) {
      return res.status(400).json({ error: 'Already participating in this event' });
    }

    // Check if event is full
    if (event.maxParticipants && event.participants.length >= event.maxParticipants) {
      return res.status(400).json({ error: 'Event is full' });
    }

    // Check registration deadline
    if (event.registrationDeadline && new Date() > event.registrationDeadline) {
      return res.status(400).json({ error: 'Registration deadline has passed' });
    }

    // Add participant
    await prisma.eventParticipant.create({
      data: {
        eventId: parseInt(eventId),
        userId: userId,
        status: 'CONFIRMED'
      }
    });

    res.json({ message: 'Successfully joined event' });

  } catch (error) {
    console.error('Error joining event:', error);
    res.status(500).json({ 
      error: 'Failed to join event',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * POST /api/events/:eventId/leave
 * Leave an event
 */
exports.leaveEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.userId;

    const event = await prisma.event.findUnique({
      where: { id: parseInt(eventId) }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Creator cannot leave their own event
    if (event.creatorId === userId) {
      return res.status(400).json({ error: 'Event creator cannot leave. Delete the event instead.' });
    }

    // Remove participation
    await prisma.eventParticipant.delete({
      where: {
        eventId_userId: {
          eventId: parseInt(eventId),
          userId: userId
        }
      }
    });

    res.json({ message: 'Successfully left event' });

  } catch (error) {
    console.error('Error leaving event:', error);
    res.status(500).json({ 
      error: 'Failed to leave event',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Format time to 12-hour format with AM/PM
 */
function formatTime(date) {
  return new Date(date).toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
}

/**
 * Get event color based on type and tags
 */
function getEventColor(eventType, tags) {
  // Priority: use tag color if exists
  if (tags && tags.length > 0 && tags[0].tagColor) {
    return tags[0].tagColor;
  }

  // Default colors by event type
  const colorMap = {
    'tournament': '#DC2626',
    'practice': '#D97706',
    'social': '#059669',
    'league': '#2563EB'
  };

  return colorMap[eventType] || '#666666';
}

/**
 * Format skill level range for display
 */
function formatSkillLevel(min, max) {
  if (!min && !max) return 'All Levels';
  if (min === max) return min;
  return `${min} - ${max}`;
}

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