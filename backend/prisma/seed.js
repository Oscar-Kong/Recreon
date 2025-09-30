// prisma/seed.js
const prisma = require('../src/config/database')

// Define sport categories
const SPORT_CATEGORIES = {
  RACQUET: 'racquet',
  TEAM_COURT: 'team_court',
  TEAM_FIELD: 'team_field',
  COMBAT: 'combat',
  INDIVIDUAL: 'individual',
  WATER: 'water',
  WINTER: 'winter',
  FITNESS: 'fitness',
  RECREATIONAL: 'recreational'
}

// Comprehensive sports data
const sportsData = [
  // RACQUET SPORTS
  {
    name: 'tennis',
    displayName: 'Tennis',
    category: SPORT_CATEGORIES.RACQUET,
    icon: '🎾',
    minPlayers: 2,
    maxPlayers: 4,
    isTeamSport: false,
    scoringSystem: {
      type: 'tennis',
      sets: 3,
      gamesPerSet: 6,
      tiebreak: true,
      deuceAdvantage: true,
      scoringPoints: ['0', '15', '30', '40', 'AD']
    }
  },
  {
    name: 'badminton',
    displayName: 'Badminton',
    category: SPORT_CATEGORIES.RACQUET,
    icon: '🏸',
    minPlayers: 2,
    maxPlayers: 4,
    isTeamSport: false,
    scoringSystem: {
      type: 'rally_point',
      sets: 3,
      pointsPerSet: 21,
      winBy: 2,
      maxPoints: 30
    }
  },
  {
    name: 'table_tennis',
    displayName: 'Table Tennis',
    category: SPORT_CATEGORIES.RACQUET,
    icon: '🏓',
    minPlayers: 2,
    maxPlayers: 4,
    isTeamSport: false,
    scoringSystem: {
      type: 'rally_point',
      sets: 5,
      pointsPerSet: 11,
      winBy: 2,
      serveRotation: 2
    }
  },
  {
    name: 'pickleball',
    displayName: 'Pickleball',
    category: SPORT_CATEGORIES.RACQUET,
    icon: '🥒',
    minPlayers: 2,
    maxPlayers: 4,
    isTeamSport: false,
    scoringSystem: {
      type: 'rally_point',
      winningScore: 11,
      winBy: 2,
      serveRotation: 'both_players_serve'
    }
  },
  {
    name: 'squash',
    displayName: 'Squash',
    category: SPORT_CATEGORIES.RACQUET,
    icon: '🎾',
    minPlayers: 2,
    maxPlayers: 4,
    isTeamSport: false,
    scoringSystem: {
      type: 'rally_point',
      sets: 5,
      pointsPerSet: 11,
      winBy: 2
    }
  },
  {
    name: 'padel',
    displayName: 'Padel',
    category: SPORT_CATEGORIES.RACQUET,
    icon: '🎾',
    minPlayers: 4,
    maxPlayers: 4,
    isTeamSport: true,
    scoringSystem: {
      type: 'tennis',
      sets: 3,
      gamesPerSet: 6,
      tiebreak: true
    }
  },

  // TEAM COURT SPORTS
  {
    name: 'basketball',
    displayName: 'Basketball',
    category: SPORT_CATEGORIES.TEAM_COURT,
    icon: '🏀',
    minPlayers: 2,
    maxPlayers: 10,
    isTeamSport: true,
    scoringSystem: {
      type: 'points',
      periods: 4,
      minutesPerPeriod: 12,
      pointValues: [1, 2, 3],
      formats: {
        fullCourt: { playersPerTeam: 5 },
        halfCourt: { playersPerTeam: 3 },
        oneOnOne: { playersPerTeam: 1 }
      }
    }
  },
  {
    name: 'volleyball',
    displayName: 'Volleyball',
    category: SPORT_CATEGORIES.TEAM_COURT,
    icon: '🏐',
    minPlayers: 4,
    maxPlayers: 12,
    isTeamSport: true,
    scoringSystem: {
      type: 'rally_point',
      sets: 5,
      pointsPerSet: 25,
      finalSetPoints: 15,
      winBy: 2,
      formats: {
        indoor6v6: { playersPerTeam: 6 },
        beach2v2: { playersPerTeam: 2 },
        recreational4v4: { playersPerTeam: 4 }
      }
    }
  },

  // TEAM FIELD SPORTS
  {
    name: 'soccer',
    displayName: 'Soccer',
    category: SPORT_CATEGORIES.TEAM_FIELD,
    icon: '⚽',
    minPlayers: 8,
    maxPlayers: 22,
    isTeamSport: true,
    scoringSystem: {
      type: 'goals',
      periods: 2,
      minutesPerPeriod: 45,
      formats: {
        eleven_aside: { playersPerTeam: 11 },
        seven_aside: { playersPerTeam: 7 },
        five_aside: { playersPerTeam: 5 },
        futsal: { playersPerTeam: 5, minutesPerPeriod: 20 }
      }
    }
  },
  {
    name: 'cricket',
    displayName: 'Cricket',
    category: SPORT_CATEGORIES.TEAM_FIELD,
    icon: '🏏',
    minPlayers: 8,
    maxPlayers: 22,
    isTeamSport: true,
    scoringSystem: {
      type: 'runs_wickets',
      formats: {
        t20: { overs: 20, playersPerTeam: 11 },
        oneDay: { overs: 50, playersPerTeam: 11 },
        gully: { overs: 10, playersPerTeam: 6 }
      }
    }
  },
  {
    name: 'baseball',
    displayName: 'Baseball',
    category: SPORT_CATEGORIES.TEAM_FIELD,
    icon: '⚾',
    minPlayers: 10,
    maxPlayers: 18,
    isTeamSport: true,
    scoringSystem: {
      type: 'runs',
      innings: 9,
      playersPerTeam: 9,
      formats: {
        standard: { innings: 9 },
        softball: { innings: 7 }
      }
    }
  },
  {
    name: 'flag_football',
    displayName: 'Flag Football',
    category: SPORT_CATEGORIES.TEAM_FIELD,
    icon: '🏈',
    minPlayers: 8,
    maxPlayers: 14,
    isTeamSport: true,
    scoringSystem: {
      type: 'touchdown_points',
      periods: 2,
      minutesPerPeriod: 20,
      pointValues: {
        touchdown: 6,
        extraPoint: 1,
        twoPointConversion: 2,
        safety: 2
      }
    }
  },

  // COMBAT SPORTS
  {
    name: 'boxing',
    displayName: 'Boxing',
    category: SPORT_CATEGORIES.COMBAT,
    icon: '🥊',
    minPlayers: 2,
    maxPlayers: 2,
    isTeamSport: false,
    scoringSystem: {
      type: 'rounds',
      rounds: 3,
      minutesPerRound: 3,
      judgingCriteria: ['effective_punching', 'defense', 'ring_control']
    }
  },
  {
    name: 'mma',
    displayName: 'Mixed Martial Arts',
    category: SPORT_CATEGORIES.COMBAT,
    icon: '🥋',
    minPlayers: 2,
    maxPlayers: 2,
    isTeamSport: false,
    scoringSystem: {
      type: 'rounds',
      rounds: 3,
      minutesPerRound: 5,
      winConditions: ['knockout', 'submission', 'decision']
    }
  },
  {
    name: 'wrestling',
    displayName: 'Wrestling',
    category: SPORT_CATEGORIES.COMBAT,
    icon: '🤼',
    minPlayers: 2,
    maxPlayers: 2,
    isTeamSport: false,
    scoringSystem: {
      type: 'points',
      periods: 3,
      minutesPerPeriod: 2,
      pointValues: {
        takedown: 2,
        escape: 1,
        reversal: 2,
        nearFall: [2, 3]
      }
    }
  },

  // INDIVIDUAL SPORTS
  {
    name: 'golf',
    displayName: 'Golf',
    category: SPORT_CATEGORIES.INDIVIDUAL,
    icon: '⛳',
    minPlayers: 1,
    maxPlayers: 4,
    isTeamSport: false,
    scoringSystem: {
      type: 'strokes',
      holes: 18,
      formats: {
        strokePlay: 'total_strokes',
        matchPlay: 'holes_won',
        scramble: 'best_ball'
      }
    }
  },
  {
    name: 'bowling',
    displayName: 'Bowling',
    category: SPORT_CATEGORIES.INDIVIDUAL,
    icon: '🎳',
    minPlayers: 1,
    maxPlayers: 8,
    isTeamSport: false,
    scoringSystem: {
      type: 'pins',
      frames: 10,
      pinsPerFrame: 10,
      maxScore: 300
    }
  },
  {
    name: 'cycling',
    displayName: 'Cycling',
    category: SPORT_CATEGORIES.INDIVIDUAL,
    icon: '🚴',
    minPlayers: 1,
    maxPlayers: 50,
    isTeamSport: false,
    scoringSystem: {
      type: 'time_distance',
      formats: {
        timeTrials: 'fastest_time',
        groupRide: 'completion',
        race: 'position'
      }
    }
  },
  {
    name: 'running',
    displayName: 'Running',
    category: SPORT_CATEGORIES.INDIVIDUAL,
    icon: '🏃',
    minPlayers: 1,
    maxPlayers: 100,
    isTeamSport: false,
    scoringSystem: {
      type: 'time_distance',
      formats: {
        track: { distances: [100, 200, 400, 800, 1500, 5000] },
        road: { distances: ['5k', '10k', 'half_marathon', 'marathon'] },
        trail: 'variable_distance'
      }
    }
  },

  // WATER SPORTS
  {
    name: 'swimming',
    displayName: 'Swimming',
    category: SPORT_CATEGORIES.WATER,
    icon: '🏊',
    minPlayers: 1,
    maxPlayers: 8,
    isTeamSport: false,
    scoringSystem: {
      type: 'time',
      formats: {
        freestyle: [50, 100, 200, 400, 800, 1500],
        backstroke: [50, 100, 200],
        breaststroke: [50, 100, 200],
        butterfly: [50, 100, 200]
      }
    }
  },
  {
    name: 'water_polo',
    displayName: 'Water Polo',
    category: SPORT_CATEGORIES.WATER,
    icon: '🤽',
    minPlayers: 10,
    maxPlayers: 14,
    isTeamSport: true,
    scoringSystem: {
      type: 'goals',
      periods: 4,
      minutesPerPeriod: 8,
      playersPerTeam: 7
    }
  },

  // FITNESS/GYM SPORTS
  {
    name: 'crossfit',
    displayName: 'CrossFit',
    category: SPORT_CATEGORIES.FITNESS,
    icon: '🏋️',
    minPlayers: 1,
    maxPlayers: 20,
    isTeamSport: false,
    scoringSystem: {
      type: 'workout',
      formats: {
        forTime: 'fastest_completion',
        amrap: 'most_rounds',
        emom: 'completion'
      }
    }
  },
  {
    name: 'yoga',
    displayName: 'Yoga',
    category: SPORT_CATEGORIES.FITNESS,
    icon: '🧘',
    minPlayers: 1,
    maxPlayers: 30,
    isTeamSport: false,
    scoringSystem: {
      type: 'participation',
      styles: ['vinyasa', 'hatha', 'ashtanga', 'hot_yoga', 'yin']
    }
  },

  // RECREATIONAL SPORTS
  {
    name: 'pool',
    displayName: 'Pool/Billiards',
    category: SPORT_CATEGORIES.RECREATIONAL,
    icon: '🎱',
    minPlayers: 2,
    maxPlayers: 4,
    isTeamSport: false,
    scoringSystem: {
      type: 'balls_pocketed',
      formats: {
        eightBall: 'solids_stripes',
        nineBall: 'numerical_order',
        cutthroat: 'elimination'
      }
    }
  },
  {
    name: 'darts',
    displayName: 'Darts',
    category: SPORT_CATEGORIES.RECREATIONAL,
    icon: '🎯',
    minPlayers: 2,
    maxPlayers: 8,
    isTeamSport: false,
    scoringSystem: {
      type: 'points_countdown',
      startingScore: 501,
      formats: {
        x01: [301, 501, 701],
        cricket: 'close_numbers',
        aroundTheClock: 'sequential'
      }
    }
  },
  {
    name: 'chess',
    displayName: 'Chess',
    category: SPORT_CATEGORIES.RECREATIONAL,
    icon: '♟️',
    minPlayers: 2,
    maxPlayers: 2,
    isTeamSport: false,
    scoringSystem: {
      type: 'win_draw_loss',
      timeControls: {
        bullet: { minutes: 1 },
        blitz: { minutes: 5 },
        rapid: { minutes: 15 },
        classical: { minutes: 30 }
      }
    }
  },

  // WINTER SPORTS
  {
    name: 'ice_hockey',
    displayName: 'Ice Hockey',
    category: SPORT_CATEGORIES.WINTER,
    icon: '🏒',
    minPlayers: 8,
    maxPlayers: 12,
    isTeamSport: true,
    scoringSystem: {
      type: 'goals',
      periods: 3,
      minutesPerPeriod: 20,
      playersPerTeam: 6,
      formats: {
        full: { playersPerTeam: 6 },
        threeOnThree: { playersPerTeam: 3 }
      }
    }
  },
  {
    name: 'skiing',
    displayName: 'Skiing',
    category: SPORT_CATEGORIES.WINTER,
    icon: '⛷️',
    minPlayers: 1,
    maxPlayers: 50,
    isTeamSport: false,
    scoringSystem: {
      type: 'time',
      formats: {
        slalom: 'gates_and_time',
        downhill: 'fastest_time',
        freestyle: 'points_judged'
      }
    }
  }
]

// Seed function
async function seedSports() {
  console.log('🌱 Starting sports seed...')
  
  for (const sport of sportsData) {
    try {
      const createdSport = await prisma.sport.upsert({
        where: { name: sport.name },
        update: {
          displayName: sport.displayName,
          category: sport.category,
          icon: sport.icon,
          maxPlayers: sport.maxPlayers,
          minPlayers: sport.minPlayers,
          isTeamSport: sport.isTeamSport,
          scoringSystem: sport.scoringSystem
        },
        create: sport
      })
      
      console.log(`✅ Created/Updated sport: ${createdSport.displayName}`)
    } catch (error) {
      console.error(`❌ Error creating sport ${sport.name}:`, error)
    }
  }
  
  console.log(`\n📊 Total sports seeded: ${sportsData.length}`)
}

// Create initial ranking seasons for each sport
async function seedRankingSeasons() {
  console.log('\n🏆 Creating ranking seasons...')
  
  const sports = await prisma.sport.findMany()
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()
  
  // Create quarterly seasons for each sport
  const seasonNames = ['Winter', 'Spring', 'Summer', 'Fall']
  const seasonMonths = [
    { start: 0, end: 2 },   // Jan-Mar
    { start: 3, end: 5 },   // Apr-Jun
    { start: 6, end: 8 },   // Jul-Sep
    { start: 9, end: 11 }   // Oct-Dec
  ]
  
  for (const sport of sports) {
    // Determine current season
    const currentSeasonIndex = Math.floor(currentMonth / 3)
    
    for (let i = 0; i < 4; i++) {
      const isCurrentSeason = i === currentSeasonIndex
      const season = await prisma.rankingSeason.create({
        data: {
          sportId: sport.id,
          name: `${seasonNames[i]} ${currentYear}`,
          startDate: new Date(currentYear, seasonMonths[i].start, 1),
          endDate: new Date(currentYear, seasonMonths[i].end + 1, 0, 23, 59, 59),
          isActive: isCurrentSeason
        }
      })
      
      console.log(`✅ Created ${season.name} season for ${sport.displayName}`)
    }
  }
}

// Create demo users with sport profiles
async function seedDemoUsers() {
  console.log('\n👥 Creating demo users...')
  
  const demoUsers = [
    {
      username: 'tennis_pro',
      email: 'tennis@demo.com',
      fullName: 'Alex Thompson',
      city: 'Los Angeles',
      state: 'California',
      country: 'USA',
      sports: ['tennis', 'badminton', 'table_tennis']
    },
    {
      username: 'hoops_master',
      email: 'basketball@demo.com',
      fullName: 'Jordan Williams',
      city: 'Chicago',
      state: 'Illinois',
      country: 'USA',
      sports: ['basketball', 'volleyball', 'flag_football']
    },
    {
      username: 'all_rounder',
      email: 'allsports@demo.com',
      fullName: 'Sarah Chen',
      city: 'New York',
      state: 'New York',
      country: 'USA',
      sports: ['tennis', 'swimming', 'running', 'yoga']
    }
  ]
  
  // Password would be hashed in real implementation
  const passwordHash = 'hashed_demo_password'
  
  for (const userData of demoUsers) {
    const { sports, ...userInfo } = userData
    
    // Create user
    const user = await prisma.user.create({
      data: {
        ...userInfo,
        passwordHash,
        avatarColor: '#' + Math.floor(Math.random()*16777215).toString(16),
        latitude: 34.0522 + (Math.random() - 0.5) * 0.2, // Random LA area coords
        longitude: -118.2437 + (Math.random() - 0.5) * 0.2
      }
    })
    
    // Create sport profiles for this user
    const sportRecords = await prisma.sport.findMany({
      where: { name: { in: sports } }
    })
    
    for (const sport of sportRecords) {
      const skillLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']
      const randomSkill = skillLevels[Math.floor(Math.random() * skillLevels.length)]
      
      await prisma.userSportProfile.create({
        data: {
          userId: user.id,
          sportId: sport.id,
          skillLevel: randomSkill,
          yearsPlaying: Math.floor(Math.random() * 10) + 1,
          matchesPlayed: Math.floor(Math.random() * 100),
          matchesWon: Math.floor(Math.random() * 50),
          winRate: Math.random() * 0.7 + 0.3 // 30-100% win rate
        }
      })
      
      // Create initial ranking for current season
      const currentSeason = await prisma.rankingSeason.findFirst({
        where: {
          sportId: sport.id,
          isActive: true
        }
      })
      
      if (currentSeason) {
        await prisma.userRanking.create({
          data: {
            userId: user.id,
            sportId: sport.id,
            seasonId: currentSeason.id,
            eloRating: 1200 + Math.floor(Math.random() * 400), // 1200-1600 range
            peakRating: 1200 + Math.floor(Math.random() * 400),
            rankedMatchesPlayed: Math.floor(Math.random() * 20),
            rankedMatchesWon: Math.floor(Math.random() * 15)
          }
        })
      }
    }
    
    console.log(`✅ Created user: ${user.username} with ${sports.length} sport profiles`)
  }
}

// Main seed function
async function main() {
  console.log('🚀 Starting database seed...\n')
  
  try {
    await seedSports()
    await seedRankingSeasons()
    await seedDemoUsers()
    
    console.log('\n✨ Seed completed successfully!')
  } catch (error) {
    console.error('❌ Seed failed:', error)
    throw error
  }
}

// Execute seed
main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

// Export for use in other scripts
module.exports = { sportsData, SPORT_CATEGORIES }