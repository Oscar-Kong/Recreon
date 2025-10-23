// backend/src/routes/sportsRoutes.js
const express = require('express');
const prisma = require('../config/database');

const router = express.Router();

/**
 * SPORTS ROUTES
 * 
 * These routes provide access to the sports catalog.
 * Sports are seeded data and mostly read-only.
 */

/**
 * GET /api/sports
 * Get all available sports
 * 
 * Public endpoint - no authentication required
 */
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;

    // Build where clause
    const where = category ? { category } : {};

    const sports = await prisma.sport.findMany({
      where,
      select: {
        id: true,
        name: true,
        displayName: true,
        category: true,
        icon: true,
        maxPlayers: true,
        minPlayers: true,
        isTeamSport: true,
        requiresCourt: true
      },
      orderBy: {
        displayName: 'asc'
      }
    });

    res.json({ 
      sports,
      count: sports.length
    });

  } catch (error) {
    console.error('Error fetching sports:', error);
    res.status(500).json({ 
      error: 'Failed to fetch sports',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/sports/categories
 * Get all unique sport categories
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.sport.findMany({
      select: {
        category: true
      },
      distinct: ['category']
    });

    const categoryList = categories.map(c => c.category).filter(Boolean);

    res.json({ 
      categories: categoryList,
      count: categoryList.length
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      error: 'Failed to fetch categories',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/sports/:sportId
 * Get specific sport details with statistics
 */
router.get('/:sportId', async (req, res) => {
  try {
    const { sportId } = req.params;

    const sport = await prisma.sport.findUnique({
      where: { id: parseInt(sportId) },
      include: {
        _count: {
          select: {
            events: true,
            matches: true,
            userProfiles: true
          }
        }
      }
    });

    if (!sport) {
      return res.status(404).json({ error: 'Sport not found' });
    }

    res.json({ sport });

  } catch (error) {
    console.error('Error fetching sport:', error);
    res.status(500).json({ 
      error: 'Failed to fetch sport',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/sports/:sportId/popular
 * Get popular players/events for a specific sport
 * Requires authentication
 */
router.get('/:sportId/popular', async (req, res) => {
  try {
    const { sportId } = req.params;

    // Get sport with top players and upcoming events
    const [topPlayers, upcomingEvents] = await Promise.all([
      // Top players (users with profiles for this sport, ordered by match count)
      prisma.sportProfile.findMany({
        where: { sportId: parseInt(sportId) },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatarColor: true,
              avatarUrl: true,
              city: true,
              state: true
            }
          },
          _count: {
            select: {
              player1Matches: true,
              player2Matches: true
            }
          }
        },
        take: 10,
        orderBy: {
          createdAt: 'desc' // You can change this to order by match count once you have that data
        }
      }),

      // Upcoming events
      prisma.event.findMany({
        where: {
          sportId: parseInt(sportId),
          startTime: {
            gte: new Date()
          },
          status: 'scheduled'
        },
        include: {
          creator: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatarColor: true
            }
          },
          _count: {
            select: {
              participants: true
            }
          }
        },
        take: 5,
        orderBy: {
          startTime: 'asc'
        }
      })
    ]);

    res.json({ 
      topPlayers,
      upcomingEvents
    });

  } catch (error) {
    console.error('Error fetching popular data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch popular data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;