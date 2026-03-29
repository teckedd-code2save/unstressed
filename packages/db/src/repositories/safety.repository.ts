import { randomUUID } from 'node:crypto'
import { prisma } from '../index'

export type SafetyDashboard = {
  circles: Array<{
    id: string
    name: string
    memberCount: number
    liveShareEnabled: boolean
    quietCheckInIntervalMins: number
  }>
  activeShare: {
    id: string
    ownerUserId: string
    status: 'ACTIVE' | 'PAUSED' | 'ENDED'
    startedAt: string
    expiresAt: string
    destinationLabel: string
    viewers: Array<{
      userId: string
      displayName: string
    }>
  } | null
  recentCheckIns: Array<{
    id: string
    status: 'SAFE' | 'DELAYED' | 'HELP'
    note: string | null
    createdAt: string
  }>
}

export async function getSafetyDashboardByUser(userId: string): Promise<SafetyDashboard> {
  const circles = await prisma.$queryRaw<
    Array<{
      id: string
      name: string
      liveShareEnabled: boolean
      quietCheckInIntervalMins: number
      memberCount: bigint
    }>
  >`
    SELECT
      sc."id",
      sc."name",
      sc."liveShareEnabled",
      sc."quietCheckInIntervalMins",
      COUNT(DISTINCT scm2."userId")::bigint AS "memberCount"
    FROM "safety_circle_members" scm
    INNER JOIN "safety_circles" sc ON sc."id" = scm."circleId"
    INNER JOIN "safety_circle_members" scm2 ON scm2."circleId" = sc."id"
    WHERE scm."userId" = ${userId}
    GROUP BY sc."id", sc."name", sc."liveShareEnabled", sc."quietCheckInIntervalMins"
    ORDER BY sc."updatedAt" DESC
  `

  const [activeShare] = await prisma.$queryRaw<
    Array<{
      id: string
      ownerUserId: string
      status: 'ACTIVE' | 'PAUSED' | 'ENDED'
      startedAt: Date
      expiresAt: Date
      destinationLabel: string | null
    }>
  >`
    SELECT ls."id", ls."ownerUserId", ls."status"::text AS "status", ls."startedAt", ls."expiresAt", ls."destinationLabel"
    FROM "location_shares" ls
    INNER JOIN "safety_circle_members" scm ON scm."circleId" = ls."circleId"
    WHERE scm."userId" = ${userId}
      AND ls."status" = 'ACTIVE'
    ORDER BY ls."startedAt" DESC
    LIMIT 1
  `

  const viewers = activeShare
    ? await prisma.$queryRaw<Array<{ userId: string; displayName: string }>>`
        SELECT lsv."userId", COALESCE(u."name", u."email") AS "displayName"
        FROM "location_share_viewers" lsv
        INNER JOIN "users" u ON u."id" = lsv."userId"
        WHERE lsv."shareId" = ${activeShare.id}
        ORDER BY lsv."createdAt" ASC
      `
    : []

  const recentCheckIns = await prisma.$queryRaw<
    Array<{ id: string; status: 'SAFE' | 'DELAYED' | 'HELP'; note: string | null; createdAt: Date }>
  >`
    SELECT sci."id", sci."status"::text AS "status", sci."note", sci."createdAt"
    FROM "safety_check_ins" sci
    INNER JOIN "safety_circle_members" scm ON scm."circleId" = sci."circleId"
    WHERE scm."userId" = ${userId}
    ORDER BY sci."createdAt" DESC
    LIMIT 5
  `

  return {
    circles: circles.map((circle) => ({
      id: circle.id,
      name: circle.name,
      memberCount: Number(circle.memberCount),
      liveShareEnabled: circle.liveShareEnabled,
      quietCheckInIntervalMins: circle.quietCheckInIntervalMins,
    })),
    activeShare: activeShare
      ? {
          id: activeShare.id,
          ownerUserId: activeShare.ownerUserId,
          status: activeShare.status,
          startedAt: activeShare.startedAt.toISOString(),
          expiresAt: activeShare.expiresAt.toISOString(),
          destinationLabel: activeShare.destinationLabel ?? 'Shared route in progress',
          viewers,
        }
      : null,
    recentCheckIns: recentCheckIns.map((checkIn) => ({
      id: checkIn.id,
      status: checkIn.status,
      note: checkIn.note,
      createdAt: checkIn.createdAt.toISOString(),
    })),
  }
}

export async function createSafetyCheckIn(params: {
  userId: string
  status: 'SAFE' | 'DELAYED' | 'HELP'
  note?: string | null
  circleId?: string | null
}) {
  const [membership] = await prisma.$queryRaw<Array<{ circleId: string }>>`
    SELECT scm."circleId"
    FROM "safety_circle_members" scm
    WHERE scm."userId" = ${params.userId}
      AND (${params.circleId ?? null}::text IS NULL OR scm."circleId" = ${params.circleId ?? null})
    ORDER BY scm."joinedAt" ASC
    LIMIT 1
  `

  if (!membership) {
    throw new Error('No safety circle found for this user')
  }

  const id = `checkin_${randomUUID()}`
  const [created] = await prisma.$queryRaw<
    Array<{ id: string; status: 'SAFE' | 'DELAYED' | 'HELP'; note: string | null; createdAt: Date }>
  >`
    INSERT INTO "safety_check_ins" ("id", "circleId", "userId", "status", "note", "createdAt")
    VALUES (${id}, ${membership.circleId}, ${params.userId}, ${params.status}::"SafetyCheckInStatus", ${params.note ?? null}, NOW())
    RETURNING "id", "status"::text AS "status", "note", "createdAt"
  `

  return {
    accepted: true,
    status: created.status,
    note: created.note,
    recordedAt: created.createdAt.toISOString(),
  }
}
