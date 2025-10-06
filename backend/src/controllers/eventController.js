// backend/src/controllers/eventController.js
// This is the updated createEvent function

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

    // Validate time logic
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (end <= start) {
      return res.status(400).json({ 
        error: 'End time must be after start time' 
      });
    }

    /**
     * DATABASE TRANSACTION
     * 
     * This is a critical concept in database operations. A transaction ensures
     * that multiple related database operations either ALL succeed or ALL fail.
     * 
     * Why use transactions?
     * - Data integrity: If creating the event succeeds but adding the creator fails,
     *   we'd have an event with no participants (bad state)
     * - Atomicity: "All or nothing" - no partial updates
     * - Consistency: Database stays in a valid state
     * 
     * In this case, we're doing 3 operations:
     * 1. Create the event
     * 2. Add the creator as a participant (CONFIRMED status)
     * 3. Optionally create tags
     * 
     * If any step fails, Prisma automatically rolls back ALL changes.
     */
    const result = await prisma.$transaction(async (tx) => {
      // Step 1: Create the event
      const event = await tx.event.create({
        data: {
          creatorId: userId,
          sportId: parseInt(sportId),
          title,
          description: description || '',
          eventType,
          startTime: start,
          endTime: end,
          venue,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
          minParticipants: minParticipants ? parseInt(minParticipants) : 1,
          skillLevelMin,
          skillLevelMax,
          entryFee: entryFee ? parseFloat(entryFee) : null,
          registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
        },
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
          }
        }
      });

      /**
       * Step 2: AUTO-ENROLL THE CREATOR
       * 
       * This is a key business logic rule: when someone creates an event,
       * they're automatically participating in it with CONFIRMED status.
       * 
       * The EventParticipant model has a composite primary key (eventId, userId),
       * which means each user can only be in an event once.
       */
      await tx.eventParticipant.create({
        data: {
          eventId: event.id,
          userId: userId,
          status: 'CONFIRMED' // Creator is always confirmed
        }
      });

      // Step 3: Create tags if provided
      if (tags && Array.isArray(tags) && tags.length > 0) {
        await tx.eventTag.createMany({
          data: tags.map(tag => ({
            eventId: event.id,
            tagName: tag.name,
            tagColor: tag.color || '#7B9F8C' // Default color
          }))
        });
      }

      return event;
    });

    /**
     * After transaction succeeds, fetch the complete event with all relations
     * to return to the frontend. This ensures the response matches the format
     * expected by the UI.
     */
    const completeEvent = await prisma.event.findUnique({
      where: { id: result.id },
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

    /**
     * DATA TRANSFORMATION LAYER
     * 
     * We transform the database response to match what the frontend expects.
     * This pattern is called "DTO" (Data Transfer Object) - we shape the data
     * specifically for the client's needs.
     * 
     * Why transform?
     * - Frontend uses different naming conventions (e.g., 'name' instead of 'title')
     * - We calculate derived fields (e.g., currentParticipants)
     * - We format complex data (e.g., time formatting, participant mapping)
     */
    const transformedEvent = {
      id: completeEvent.id.toString(),
      name: completeEvent.title,
      type: completeEvent.eventType,
      time: `${formatTime(completeEvent.startTime)} - ${formatTime(completeEvent.endTime)}`,
      startTime: completeEvent.startTime,
      endTime: completeEvent.endTime,
      date: completeEvent.startTime,
      notes: completeEvent.description || '',
      venue: completeEvent.venue,
      location: completeEvent.latitude && completeEvent.longitude ? {
        latitude: completeEvent.latitude,
        longitude: completeEvent.longitude
      } : null,
      sport: completeEvent.sport,
      creator: completeEvent.creator,
      participants: completeEvent.participants.map(p => ({
        ...p.user,
        status: p.status,
        registeredAt: p.registeredAt
      })),
      maxParticipants: completeEvent.maxParticipants,
      currentParticipants: completeEvent.participants.length,
      skillLevelRange: {
        min: completeEvent.skillLevelMin,
        max: completeEvent.skillLevelMax
      },
      entryFee: completeEvent.entryFee,
      status: completeEvent.status,
      tags: completeEvent.tags.map(tag => ({
        name: tag.tagName,
        color: tag.tagColor
      })),
      color: getEventColor(completeEvent.eventType, completeEvent.tags),
      isCreator: true // User is the creator since they just made it
    };

    res.status(201).json({ 
      event: transformedEvent,
      message: 'Event created successfully'
    });

  } catch (error) {
    console.error('Error creating event:', error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        error: 'An event with similar details already exists' 
      });
    }
    
    if (error.code === 'P2003') {
      return res.status(400).json({ 
        error: 'Invalid reference - sport or user not found' 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to create event',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * HELPER FUNCTIONS
 * These should exist elsewhere in your controller file
 */

function formatTime(date) {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

function getEventColor(eventType, tags) {
  // Assign colors based on event type
  const typeColors = {
    'practice': '#4A90E2',
    'social': '#F39C12',
    'tournament': '#E74C3C',
    'league': '#9B59B6'
  };
  
  return typeColors[eventType] || '#7B9F8C';
}