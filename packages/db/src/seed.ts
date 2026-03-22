import 'dotenv/config'
import { prisma } from './index'

async function seed() {
  console.log('🌱 Seeding unstressed database...')

  // Demo user
  const user = await prisma.user.upsert({
    where: { clerkId: 'demo_user_001' },
    update: {},
    create: {
      clerkId: 'demo_user_001',
      email: 'demo@unstressed.app',
      name: 'Alex Chen',
      avatarUrl: null,
      context: {
        create: {
          energyLevel: 'medium',
          preferredSanctuaries: ['quiet-cafes', 'forest-trails', 'quiet-waterfronts'],
          silenceStart: '22:00',
          silenceEnd: '08:00',
          circadianWakeTime: '07:15',
          calendarProvider: 'google',
          healthProvider: 'apple_health',
          lastSynced: new Date(),
        },
      },
    },
  })
  console.log(`✅ User: ${user.name}`)

  // Suggestions
  await prisma.suggestion.createMany({
    skipDuplicates: true,
    data: [
      {
        userId: user.id,
        title: 'The Glass House',
        description: 'A sanctuary for decompression and herbal matcha.',
        category: 'rest',
        location: 'Shoreditch, London',
        distanceMins: 12,
        moodTags: ['Quiet Atmosphere', 'Low Stimulus'],
        contextTags: ['Fits Your Budget', 'Matches Your Energy Level'],
        imageUrl: null,
        whyItFits: "Based on your 72-hour cognitive load pattern, the Glass House's white-noise environment will help pre-empt the Friday burnout.",
        aiGenerated: true,
        isActive: true,
      },
      {
        userId: user.id,
        title: 'Solar Soak',
        description: 'The UV index is perfect right now. 15 minutes of outdoor light recommended.',
        category: 'nature',
        location: 'Victoria Park',
        distanceMins: 8,
        moodTags: ['Vibrant Energy', 'Nature Escape'],
        contextTags: ['Active Now'],
        imageUrl: null,
        whyItFits: 'Your circadian data shows a mid-afternoon dip. Natural light at this hour resets melatonin timing.',
        aiGenerated: true,
        isActive: true,
      },
      {
        userId: user.id,
        title: 'The Altai Retreat',
        description: 'A curated sanctuary designed for deep cognitive restoration in high-altitude pine forests.',
        category: 'focus',
        location: 'Siberia, Russia',
        distanceMins: null,
        moodTags: ['Solitude', 'Deep Focus', 'Restorative Sleep'],
        contextTags: ['Fits Your Budget', 'Matches Your Energy Level'],
        imageUrl: null,
        whyItFits: "Based on your 72-hour cognitive load and elevated cortisol patterns, the absolute acoustic silence of the Altai valley provides the neuro-reset your current focus state requires.",
        aiGenerated: true,
        isActive: true,
      },
    ],
  })
  console.log('✅ Suggestions seeded')

  // Collections — trips
  const amalfiTrip = await prisma.collection.upsert({
    where: { id: 'col_amalfi_001' },
    update: {},
    create: {
      id: 'col_amalfi_001',
      userId: user.id,
      name: 'Amalfi Coast Drift',
      description: '7 days of Mediterranean serenity, hidden caves, and terraced lemon groves.',
      type: 'TRIP',
      coverImage: null,
      isPrivate: false,
      icon: '✈️',
      dateStart: new Date('2026-06-12'),
      dateEnd: new Date('2026-06-19'),
    },
  })

  const alpineTrip = await prisma.collection.upsert({
    where: { id: 'col_alpine_001' },
    update: {},
    create: {
      id: 'col_alpine_001',
      userId: user.id,
      name: 'Swiss Alpine Silence',
      description: 'Zermatt Retreat · 6 Days of high-altitude focus and mountain air.',
      type: 'TRIP',
      coverImage: null,
      isPrivate: false,
      icon: '🏔',
      dateStart: new Date('2026-08-26'),
      dateEnd: new Date('2026-08-31'),
    },
  })

  // Collections — folders
  const summerFolder = await prisma.collection.upsert({
    where: { id: 'col_summer_001' },
    update: {},
    create: {
      id: 'col_summer_001',
      userId: user.id,
      name: 'Summer Retreats',
      description: 'Warm-weather sanctuaries curated for restoration.',
      type: 'FOLDER',
      coverImage: null,
      isPrivate: false,
      icon: '☀️',
    },
  })

  const hikingFolder = await prisma.collection.upsert({
    where: { id: 'col_hiking_001' },
    update: {},
    create: {
      id: 'col_hiking_001',
      userId: user.id,
      name: 'Local Hiking',
      description: 'Day trips and weekend trails within 50 miles.',
      type: 'FOLDER',
      coverImage: null,
      isPrivate: false,
      icon: '🥾',
    },
  })
  console.log('✅ Collections seeded')

  // Collection items
  await prisma.collectionItem.createMany({
    skipDuplicates: true,
    data: [
      {
        collectionId: amalfiTrip.id,
        placeName: 'Positano Cliffside Villa',
        placeLocation: 'Positano, Italy',
        placeImageUrl: null,
        notes: 'Best terrace view for group yoga',
      },
      {
        collectionId: amalfiTrip.id,
        placeName: 'Blue Grotto',
        placeLocation: 'Capri, Italy',
        placeImageUrl: null,
        notes: 'Go early morning to avoid crowds',
      },
      {
        collectionId: summerFolder.id,
        placeName: 'Grand Hotel Tremezzo',
        placeLocation: 'Lake Como, Italy',
        placeImageUrl: null,
        notes: 'Saved to Europe 2026',
      },
      {
        collectionId: summerFolder.id,
        placeName: 'Le Marais Rooftop',
        placeLocation: 'Paris, France',
        placeImageUrl: null,
        notes: null,
      },
      {
        collectionId: hikingFolder.id,
        placeName: 'Box Hill Summit Trail',
        placeLocation: 'Surrey, UK',
        placeImageUrl: null,
        notes: 'Best in autumn',
      },
    ],
  })
  console.log('✅ Collection items seeded')

  // Search history
  await prisma.searchQuery.createMany({
    skipDuplicates: true,
    data: [
      { userId: user.id, queryText: 'quiet cafe for deep work', moodFilters: ['Deep Focus', 'Solitude'], resultsCount: 4 },
      { userId: user.id, queryText: 'nature walk near me', moodFilters: ['Nature Escape'], resultsCount: 3 },
      { userId: user.id, queryText: null, moodFilters: ['Restorative Sleep', 'Creative Flow'], resultsCount: 5 },
    ],
  })
  console.log('✅ Search history seeded')

  console.log('\n🎉 Seed complete. Database is ready.')
}

seed()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
