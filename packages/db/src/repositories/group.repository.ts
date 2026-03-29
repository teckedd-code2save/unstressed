import { prisma } from '../index'

export type GroupDashboard = {
  groups: Array<{
    id: string
    name: string
    role: 'HOST' | 'MEMBER'
    memberCount: number
    pendingVotes: number
    nextDecisionAt: string | null
  }>
  activePlan: {
    id: string
    groupId: string
    title: string
    status: 'DRAFT' | 'VOTING' | 'FINALIZED' | 'ARCHIVED'
    window: {
      start: string | null
      end: string | null
    }
    participants: Array<{
      userId: string
      displayName: string
      voteStatus: 'SUBMITTED' | 'PENDING'
    }>
    options: Array<{
      id: string
      title: string
      category: string
      score: number
      votes: number
      whyItFits: string
    }>
    itineraryDraft: Array<{
      id: string
      startsAt: string
      title: string
      type: string
    }>
  } | null
}

export async function getGroupsDashboardByUser(userId: string): Promise<GroupDashboard> {
  const groups = await prisma.$queryRaw<
    Array<{
      id: string
      name: string
      role: 'HOST' | 'MEMBER'
      memberCount: bigint
      pendingVotes: bigint
      nextDecisionAt: Date | null
    }>
  >`
    SELECT
      g."id",
      g."name",
      gm."role"::text AS "role",
      COUNT(DISTINCT gm2."userId")::bigint AS "memberCount",
      COUNT(DISTINCT CASE WHEN pv."id" IS NULL THEN gm2."userId" END)::bigint AS "pendingVotes",
      MIN(gp."updatedAt") AS "nextDecisionAt"
    FROM "group_members" gm
    INNER JOIN "groups" g ON g."id" = gm."groupId"
    INNER JOIN "group_members" gm2 ON gm2."groupId" = g."id"
    LEFT JOIN "group_plans" gp ON gp."groupId" = g."id" AND gp."status" IN ('DRAFT', 'VOTING')
    LEFT JOIN "group_plan_options" gpo ON gpo."planId" = gp."id"
    LEFT JOIN "plan_votes" pv ON pv."optionId" = gpo."id" AND pv."userId" = gm2."userId"
    WHERE gm."userId" = ${userId}
    GROUP BY g."id", g."name", gm."role"
    ORDER BY COALESCE(MIN(gp."updatedAt"), g."updatedAt") DESC
  `

  const [activePlan] = await prisma.$queryRaw<
    Array<{
      id: string
      groupId: string
      title: string
      status: 'DRAFT' | 'VOTING' | 'FINALIZED' | 'ARCHIVED'
      windowStart: Date | null
      windowEnd: Date | null
    }>
  >`
    SELECT gp."id", gp."groupId", gp."title", gp."status"::text AS "status", gp."windowStart", gp."windowEnd"
    FROM "group_plans" gp
    INNER JOIN "group_members" gm ON gm."groupId" = gp."groupId"
    WHERE gm."userId" = ${userId}
      AND gp."status" IN ('DRAFT', 'VOTING', 'FINALIZED')
    ORDER BY CASE WHEN gp."status" = 'VOTING' THEN 0 WHEN gp."status" = 'DRAFT' THEN 1 ELSE 2 END, gp."updatedAt" DESC
    LIMIT 1
  `

  if (!activePlan) {
    return {
      groups: groups.map((group) => ({
        id: group.id,
        name: group.name,
        role: group.role,
        memberCount: Number(group.memberCount),
        pendingVotes: Number(group.pendingVotes),
        nextDecisionAt: group.nextDecisionAt?.toISOString() ?? null,
      })),
      activePlan: null,
    }
  }

  const participants = await prisma.$queryRaw<
    Array<{ userId: string; displayName: string; hasVoted: boolean }>
  >`
    SELECT
      gm."userId",
      COALESCE(u."name", u."email") AS "displayName",
      EXISTS (
        SELECT 1
        FROM "plan_votes" pv
        INNER JOIN "group_plan_options" gpo ON gpo."id" = pv."optionId"
        WHERE gpo."planId" = ${activePlan.id}
          AND pv."userId" = gm."userId"
      ) AS "hasVoted"
    FROM "group_members" gm
    INNER JOIN "users" u ON u."id" = gm."userId"
    WHERE gm."groupId" = ${activePlan.groupId}
    ORDER BY gm."joinedAt" ASC
  `

  const options = await prisma.$queryRaw<
    Array<{ id: string; title: string; category: string; score: number; votes: bigint; whyItFits: string | null }>
  >`
    SELECT
      gpo."id",
      gpo."title",
      gpo."category",
      gpo."score",
      COUNT(pv."id")::bigint AS "votes",
      gpo."whyItFits"
    FROM "group_plan_options" gpo
    LEFT JOIN "plan_votes" pv ON pv."optionId" = gpo."id"
    WHERE gpo."planId" = ${activePlan.id}
    GROUP BY gpo."id", gpo."title", gpo."category", gpo."score", gpo."whyItFits"
    ORDER BY gpo."score" DESC, COUNT(pv."id") DESC, gpo."createdAt" ASC
  `

  const itineraryDraft = await prisma.$queryRaw<
    Array<{ id: string; startsAt: Date; title: string; type: string }>
  >`
    SELECT "id", "startsAt", "title", "type"
    FROM "group_itinerary_items"
    WHERE "planId" = ${activePlan.id}
    ORDER BY "sequence" ASC, "startsAt" ASC
  `

  return {
    groups: groups.map((group) => ({
      id: group.id,
      name: group.name,
      role: group.role,
      memberCount: Number(group.memberCount),
      pendingVotes: Number(group.pendingVotes),
      nextDecisionAt: group.nextDecisionAt?.toISOString() ?? null,
    })),
    activePlan: {
      id: activePlan.id,
      groupId: activePlan.groupId,
      title: activePlan.title,
      status: activePlan.status,
      window: {
        start: activePlan.windowStart?.toISOString() ?? null,
        end: activePlan.windowEnd?.toISOString() ?? null,
      },
      participants: participants.map((participant) => ({
        userId: participant.userId,
        displayName: participant.displayName,
        voteStatus: participant.hasVoted ? 'SUBMITTED' : 'PENDING',
      })),
      options: options.map((option) => ({
        id: option.id,
        title: option.title,
        category: option.category,
        score: option.score,
        votes: Number(option.votes),
        whyItFits: option.whyItFits ?? 'Pending refinement.',
      })),
      itineraryDraft: itineraryDraft.map((item) => ({
        id: item.id,
        startsAt: item.startsAt.toISOString(),
        title: item.title,
        type: item.type,
      })),
    },
  }
}
