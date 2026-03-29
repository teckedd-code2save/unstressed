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

  const closeFriendsCircle = await prisma.$queryRaw<Array<{ id: string }>>`
    INSERT INTO "safety_circles" ("id", "ownerUserId", "name", "liveShareEnabled", "quietCheckInIntervalMins", "createdAt", "updatedAt")
    VALUES ('circle_close_friends', ${user.id}, 'Close Friends', true, 90, NOW(), NOW())
    ON CONFLICT ("id") DO UPDATE
    SET "name" = EXCLUDED."name",
        "liveShareEnabled" = EXCLUDED."liveShareEnabled",
        "quietCheckInIntervalMins" = EXCLUDED."quietCheckInIntervalMins",
        "updatedAt" = NOW()
    RETURNING "id"
  `

  await prisma.$executeRaw`
    INSERT INTO "safety_circle_members" ("id", "circleId", "userId", "role", "joinedAt")
    VALUES
      ('scm_owner_demo', ${closeFriendsCircle[0]!.id}, ${user.id}, 'OWNER'::"SafetyCircleRole", NOW())
    ON CONFLICT ("circleId", "userId") DO NOTHING
  `

  await prisma.$executeRaw`
    INSERT INTO "location_shares" ("id", "circleId", "ownerUserId", "status", "destinationLabel", "startedAt", "expiresAt", "createdAt")
    VALUES (
      'share_evening_walk',
      ${closeFriendsCircle[0]!.id},
      ${user.id},
      'ACTIVE'::"LocationShareStatus",
      'Airport Residential evening walk',
      NOW() - INTERVAL '20 minutes',
      NOW() + INTERVAL '2 hours',
      NOW() - INTERVAL '20 minutes'
    )
    ON CONFLICT ("id") DO UPDATE
    SET "status" = EXCLUDED."status",
        "destinationLabel" = EXCLUDED."destinationLabel",
        "expiresAt" = EXCLUDED."expiresAt"
  `

  await prisma.$executeRaw`
    INSERT INTO "safety_check_ins" ("id", "circleId", "userId", "status", "note", "createdAt")
    VALUES (
      'checkin_1',
      ${closeFriendsCircle[0]!.id},
      ${user.id},
      'SAFE'::"SafetyCheckInStatus",
      'Reached the cafe, battery is fine.',
      NOW() - INTERVAL '15 minutes'
    )
    ON CONFLICT ("id") DO UPDATE
    SET "status" = EXCLUDED."status",
        "note" = EXCLUDED."note",
        "createdAt" = EXCLUDED."createdAt"
  `

  const [weekendGroup] = await prisma.$queryRaw<Array<{ id: string }>>`
    INSERT INTO "groups" ("id", "name", "description", "hostUserId", "status", "createdAt", "updatedAt")
    VALUES (
      'group_core_weekend',
      'Core Weekend Circle',
      'Shared planning for low-stress weekend resets.',
      ${user.id},
      'ACTIVE'::"GroupStatus",
      NOW(),
      NOW()
    )
    ON CONFLICT ("id") DO UPDATE
    SET "name" = EXCLUDED."name",
        "description" = EXCLUDED."description",
        "status" = EXCLUDED."status",
        "updatedAt" = NOW()
    RETURNING "id"
  `

  await prisma.$executeRaw`
    INSERT INTO "group_members" ("id", "groupId", "userId", "role", "notificationsEnabled", "joinedAt")
    VALUES ('gm_owner_demo', ${weekendGroup.id}, ${user.id}, 'HOST'::"GroupMemberRole", true, NOW())
    ON CONFLICT ("groupId", "userId") DO NOTHING
  `

  const [activePlan] = await prisma.$queryRaw<Array<{ id: string }>>`
    INSERT INTO "group_plans" ("id", "groupId", "createdByUserId", "title", "notes", "status", "windowStart", "windowEnd", "createdAt", "updatedAt")
    VALUES (
      'plan_akosombo_retreat',
      ${weekendGroup.id},
      ${user.id},
      'Akosombo Reset',
      'Quiet itinerary with movement, rest, and consensus voting.',
      'VOTING'::"GroupPlanStatus",
      TIMESTAMP '2026-04-04 09:00:00',
      TIMESTAMP '2026-04-05 19:00:00',
      NOW(),
      NOW()
    )
    ON CONFLICT ("id") DO UPDATE
    SET "title" = EXCLUDED."title",
        "notes" = EXCLUDED."notes",
        "status" = EXCLUDED."status",
        "windowStart" = EXCLUDED."windowStart",
        "windowEnd" = EXCLUDED."windowEnd",
        "updatedAt" = NOW()
    RETURNING "id"
  `

  await prisma.$executeRaw`
    INSERT INTO "group_plan_options" ("id", "planId", "title", "description", "category", "score", "whyItFits", "createdByUserId", "createdAt")
    VALUES
      (
        'option_river_lodge',
        ${activePlan.id},
        'Riverfront Lodge',
        'Private rooms, quiet waterfront, and low travel fatigue.',
        'stay',
        92,
        'Calm water views, low travel fatigue, and enough privacy for recovery.',
        ${user.id},
        NOW()
      ),
      (
        'option_hill_trails',
        ${activePlan.id},
        'Hill Trails + Picnic',
        'Gentle movement with a flexible recovery window after lunch.',
        'activity',
        87,
        'Balances movement with quiet downtime and works for mixed energy levels.',
        ${user.id},
        NOW()
      )
    ON CONFLICT ("id") DO UPDATE
    SET "title" = EXCLUDED."title",
        "description" = EXCLUDED."description",
        "category" = EXCLUDED."category",
        "score" = EXCLUDED."score",
        "whyItFits" = EXCLUDED."whyItFits"
  `

  await prisma.$executeRaw`
    INSERT INTO "plan_votes" ("id", "optionId", "userId", "vote", "createdAt")
    VALUES ('vote_demo_river_lodge', 'option_river_lodge', ${user.id}, 1, NOW())
    ON CONFLICT ("optionId", "userId") DO UPDATE
    SET "vote" = EXCLUDED."vote",
        "createdAt" = EXCLUDED."createdAt"
  `

  await prisma.$executeRaw`
    INSERT INTO "group_itinerary_items" ("id", "planId", "sequence", "startsAt", "endsAt", "title", "type", "notes", "createdAt")
    VALUES
      (
        'itinerary_departure',
        ${activePlan.id},
        1,
        TIMESTAMP '2026-04-04 09:00:00',
        TIMESTAMP '2026-04-04 11:30:00',
        'Departure from Accra',
        'travel',
        'Leave early to avoid peak traffic.',
        NOW()
      ),
      (
        'itinerary_checkin',
        ${activePlan.id},
        2,
        TIMESTAMP '2026-04-04 12:00:00',
        TIMESTAMP '2026-04-04 14:00:00',
        'Lodge check-in and quiet lunch',
        'stay',
        'Low-stimulation reset before afternoon planning.',
        NOW()
      )
    ON CONFLICT ("planId", "sequence") DO UPDATE
    SET "startsAt" = EXCLUDED."startsAt",
        "endsAt" = EXCLUDED."endsAt",
        "title" = EXCLUDED."title",
        "type" = EXCLUDED."type",
        "notes" = EXCLUDED."notes"
  `
  console.log('✅ Groups and safety seeded')

  console.log('\n🎉 Seed complete. Database is ready.')
}

seed()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
