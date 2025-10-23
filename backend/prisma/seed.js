// prisma/seed-sports-only.js
// Simplified seed script - only sports, no users or seasons
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

// Sports data
const sportsData = [
  { name: 'tennis', displayName: 'Tennis', category: SPORT_CATEGORIES.RACQUET, icon: '🎾', minPlayers: 2, maxPlayers: 4, isTeamSport: false },
  { name: 'badminton', displayName: 'Badminton', category: SPORT_CATEGORIES.RACQUET, icon: '🏸', minPlayers: 2, maxPlayers: 4, isTeamSport: false },
  { name: 'table_tennis', displayName: 'Table Tennis', category: SPORT_CATEGORIES.RACQUET, icon: '🏓', minPlayers: 2, maxPlayers: 4, isTeamSport: false },
  { name: 'pickleball', displayName: 'Pickleball', category: SPORT_CATEGORIES.RACQUET, icon: '🥒', minPlayers: 2, maxPlayers: 4, isTeamSport: false },
  { name: 'squash', displayName: 'Squash', category: SPORT_CATEGORIES.RACQUET, icon: '🎾', minPlayers: 2, maxPlayers: 4, isTeamSport: false },
  { name: 'padel', displayName: 'Padel', category: SPORT_CATEGORIES.RACQUET, icon: '🎾', minPlayers: 4, maxPlayers: 4, isTeamSport: true },
  
  { name: 'basketball', displayName: 'Basketball', category: SPORT_CATEGORIES.TEAM_COURT, icon: '🏀', minPlayers: 2, maxPlayers: 10, isTeamSport: true },
  { name: 'volleyball', displayName: 'Volleyball', category: SPORT_CATEGORIES.TEAM_COURT, icon: '🏐', minPlayers: 4, maxPlayers: 12, isTeamSport: true },
  
  { name: 'soccer', displayName: 'Soccer', category: SPORT_CATEGORIES.TEAM_FIELD, icon: '⚽', minPlayers: 8, maxPlayers: 22, isTeamSport: true },
  { name: 'cricket', displayName: 'Cricket', category: SPORT_CATEGORIES.TEAM_FIELD, icon: '🏏', minPlayers: 8, maxPlayers: 22, isTeamSport: true },
  { name: 'baseball', displayName: 'Baseball', category: SPORT_CATEGORIES.TEAM_FIELD, icon: '⚾', minPlayers: 10, maxPlayers: 18, isTeamSport: true },
  { name: 'flag_football', displayName: 'Flag Football', category: SPORT_CATEGORIES.TEAM_FIELD, icon: '🏈', minPlayers: 8, maxPlayers: 14, isTeamSport: true },
  
  { name: 'boxing', displayName: 'Boxing', category: SPORT_CATEGORIES.COMBAT, icon: '🥊', minPlayers: 2, maxPlayers: 2, isTeamSport: false },
  { name: 'mma', displayName: 'Mixed Martial Arts', category: SPORT_CATEGORIES.COMBAT, icon: '🥋', minPlayers: 2, maxPlayers: 2, isTeamSport: false },
  { name: 'wrestling', displayName: 'Wrestling', category: SPORT_CATEGORIES.COMBAT, icon: '🤼', minPlayers: 2, maxPlayers: 2, isTeamSport: false },
  
  { name: 'golf', displayName: 'Golf', category: SPORT_CATEGORIES.INDIVIDUAL, icon: '⛳', minPlayers: 1, maxPlayers: 4, isTeamSport: false },
  { name: 'bowling', displayName: 'Bowling', category: SPORT_CATEGORIES.INDIVIDUAL, icon: '🎳', minPlayers: 1, maxPlayers: 8, isTeamSport: false },
  { name: 'cycling', displayName: 'Cycling', category: SPORT_CATEGORIES.INDIVIDUAL, icon: '🚴', minPlayers: 1, maxPlayers: 50, isTeamSport: false },
  { name: 'running', displayName: 'Running', category: SPORT_CATEGORIES.INDIVIDUAL, icon: '🏃', minPlayers: 1, maxPlayers: 100, isTeamSport: false },
  
  { name: 'swimming', displayName: 'Swimming', category: SPORT_CATEGORIES.WATER, icon: '🏊', minPlayers: 1, maxPlayers: 8, isTeamSport: false },
  { name: 'water_polo', displayName: 'Water Polo', category: SPORT_CATEGORIES.WATER, icon: '🤽', minPlayers: 10, maxPlayers: 14, isTeamSport: true },
  
  { name: 'ice_hockey', displayName: 'Ice Hockey', category: SPORT_CATEGORIES.WINTER, icon: '🏒', minPlayers: 8, maxPlayers: 12, isTeamSport: true },
  { name: 'skiing', displayName: 'Skiing', category: SPORT_CATEGORIES.WINTER, icon: '⛷️', minPlayers: 1, maxPlayers: 50, isTeamSport: false },
  
  { name: 'crossfit', displayName: 'CrossFit', category: SPORT_CATEGORIES.FITNESS, icon: '🏋️', minPlayers: 1, maxPlayers: 20, isTeamSport: false },
  { name: 'yoga', displayName: 'Yoga', category: SPORT_CATEGORIES.FITNESS, icon: '🧘', minPlayers: 1, maxPlayers: 30, isTeamSport: false },
  
  { name: 'pool', displayName: 'Pool/Billiards', category: SPORT_CATEGORIES.RECREATIONAL, icon: '🎱', minPlayers: 2, maxPlayers: 4, isTeamSport: false },
  { name: 'darts', displayName: 'Darts', category: SPORT_CATEGORIES.RECREATIONAL, icon: '🎯', minPlayers: 2, maxPlayers: 8, isTeamSport: false },
  { name: 'chess', displayName: 'Chess', category: SPORT_CATEGORIES.RECREATIONAL, icon: '♟️', minPlayers: 2, maxPlayers: 2, isTeamSport: false },
]

async function main() {
  console.log('🌱 Seeding sports only...\n')
  
  let successCount = 0
  let errorCount = 0
  
  for (const sport of sportsData) {
    try {
      const created = await prisma.sport.upsert({
        where: { name: sport.name },
        update: sport,
        create: sport
      })
      console.log(`✅ ${created.displayName}`)
      successCount++
    } catch (error) {
      console.error(`❌ ${sport.displayName}: ${error.message}`)
      errorCount++
    }
  }
  
  console.log(`\n📊 Summary:`)
  console.log(`   ✅ Successfully seeded: ${successCount} sports`)
  console.log(`   ❌ Failed: ${errorCount} sports`)
  console.log(`\n✨ Done!`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })