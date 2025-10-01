// backend/src/routes/sportsRoutes.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * SPORTS ROUTES
 * 
 * Simple endpoint to get available sports for event creation.
 * This is a read-only resource since sports are seeded data.
 */

/**
 * GET /api/sports
 * Get all available sports
 * 
 * Public endpoint - no auth required (sports are general data)
 * But you can add authMiddleware if you want it protected
 */
router.get('/', async (req, res) => {
  try {
    const sports = await prisma.sport.findMany({
      select: {
        id: true,
        name: true,
        displayName: true,
        category: true,
        icon: true,
        maxPlayers: true,
        minPlayers: true,
        isTeamSport: true
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
 * GET /api/sports/:sportId
 * Get specific sport details
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

module.exports = router;

/**
 * REGISTER THIS ROUTE IN index.js:
 * 
 * const sportsRoutes = require('./routes/sportsRoutes');
 * app.use('/api/sports', sportsRoutes);
 */