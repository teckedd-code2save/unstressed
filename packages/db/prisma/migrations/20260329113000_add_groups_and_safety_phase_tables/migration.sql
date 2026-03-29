-- Create enums
CREATE TYPE "GroupStatus" AS ENUM ('ACTIVE', 'ARCHIVED');
CREATE TYPE "GroupMemberRole" AS ENUM ('HOST', 'MEMBER');
CREATE TYPE "GroupPlanStatus" AS ENUM ('DRAFT', 'VOTING', 'FINALIZED', 'ARCHIVED');
CREATE TYPE "SafetyCircleRole" AS ENUM ('OWNER', 'MEMBER');
CREATE TYPE "LocationShareStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ENDED');
CREATE TYPE "SafetyCheckInStatus" AS ENUM ('SAFE', 'DELAYED', 'HELP');

-- Create tables
CREATE TABLE "groups" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "hostUserId" TEXT NOT NULL,
  "status" "GroupStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "group_members" (
  "id" TEXT NOT NULL,
  "groupId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "role" "GroupMemberRole" NOT NULL DEFAULT 'MEMBER',
  "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
  "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "group_members_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "group_plans" (
  "id" TEXT NOT NULL,
  "groupId" TEXT NOT NULL,
  "createdByUserId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "notes" TEXT,
  "status" "GroupPlanStatus" NOT NULL DEFAULT 'DRAFT',
  "windowStart" TIMESTAMP(3),
  "windowEnd" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "group_plans_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "group_plan_options" (
  "id" TEXT NOT NULL,
  "planId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "category" TEXT NOT NULL,
  "score" INTEGER NOT NULL DEFAULT 0,
  "whyItFits" TEXT,
  "createdByUserId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "group_plan_options_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "plan_votes" (
  "id" TEXT NOT NULL,
  "optionId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "vote" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "plan_votes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "group_itinerary_items" (
  "id" TEXT NOT NULL,
  "planId" TEXT NOT NULL,
  "sequence" INTEGER NOT NULL,
  "startsAt" TIMESTAMP(3) NOT NULL,
  "endsAt" TIMESTAMP(3),
  "title" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "group_itinerary_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "safety_circles" (
  "id" TEXT NOT NULL,
  "ownerUserId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "liveShareEnabled" BOOLEAN NOT NULL DEFAULT true,
  "quietCheckInIntervalMins" INTEGER NOT NULL DEFAULT 90,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "safety_circles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "safety_circle_members" (
  "id" TEXT NOT NULL,
  "circleId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "role" "SafetyCircleRole" NOT NULL DEFAULT 'MEMBER',
  "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "safety_circle_members_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "location_shares" (
  "id" TEXT NOT NULL,
  "circleId" TEXT NOT NULL,
  "ownerUserId" TEXT NOT NULL,
  "status" "LocationShareStatus" NOT NULL DEFAULT 'ACTIVE',
  "destinationLabel" TEXT,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "endedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "location_shares_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "location_share_viewers" (
  "id" TEXT NOT NULL,
  "shareId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "location_share_viewers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "safety_check_ins" (
  "id" TEXT NOT NULL,
  "circleId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "status" "SafetyCheckInStatus" NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "safety_check_ins_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX "groups_hostUserId_status_idx" ON "groups"("hostUserId", "status");
CREATE UNIQUE INDEX "group_members_groupId_userId_key" ON "group_members"("groupId", "userId");
CREATE INDEX "group_members_userId_joinedAt_idx" ON "group_members"("userId", "joinedAt" DESC);
CREATE INDEX "group_plans_groupId_status_updatedAt_idx" ON "group_plans"("groupId", "status", "updatedAt" DESC);
CREATE INDEX "group_plan_options_planId_createdAt_idx" ON "group_plan_options"("planId", "createdAt");
CREATE UNIQUE INDEX "plan_votes_optionId_userId_key" ON "plan_votes"("optionId", "userId");
CREATE INDEX "plan_votes_userId_createdAt_idx" ON "plan_votes"("userId", "createdAt" DESC);
CREATE UNIQUE INDEX "group_itinerary_items_planId_sequence_key" ON "group_itinerary_items"("planId", "sequence");
CREATE INDEX "group_itinerary_items_planId_startsAt_idx" ON "group_itinerary_items"("planId", "startsAt");
CREATE INDEX "safety_circles_ownerUserId_createdAt_idx" ON "safety_circles"("ownerUserId", "createdAt" DESC);
CREATE UNIQUE INDEX "safety_circle_members_circleId_userId_key" ON "safety_circle_members"("circleId", "userId");
CREATE INDEX "safety_circle_members_userId_joinedAt_idx" ON "safety_circle_members"("userId", "joinedAt" DESC);
CREATE INDEX "location_shares_circleId_status_startedAt_idx" ON "location_shares"("circleId", "status", "startedAt" DESC);
CREATE UNIQUE INDEX "location_share_viewers_shareId_userId_key" ON "location_share_viewers"("shareId", "userId");
CREATE INDEX "safety_check_ins_circleId_createdAt_idx" ON "safety_check_ins"("circleId", "createdAt" DESC);
CREATE INDEX "safety_check_ins_userId_createdAt_idx" ON "safety_check_ins"("userId", "createdAt" DESC);

-- Foreign keys
ALTER TABLE "groups" ADD CONSTRAINT "groups_hostUserId_fkey" FOREIGN KEY ("hostUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "group_plans" ADD CONSTRAINT "group_plans_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "group_plans" ADD CONSTRAINT "group_plans_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "group_plan_options" ADD CONSTRAINT "group_plan_options_planId_fkey" FOREIGN KEY ("planId") REFERENCES "group_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "plan_votes" ADD CONSTRAINT "plan_votes_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "group_plan_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "plan_votes" ADD CONSTRAINT "plan_votes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "group_itinerary_items" ADD CONSTRAINT "group_itinerary_items_planId_fkey" FOREIGN KEY ("planId") REFERENCES "group_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "safety_circles" ADD CONSTRAINT "safety_circles_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "safety_circle_members" ADD CONSTRAINT "safety_circle_members_circleId_fkey" FOREIGN KEY ("circleId") REFERENCES "safety_circles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "safety_circle_members" ADD CONSTRAINT "safety_circle_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "location_shares" ADD CONSTRAINT "location_shares_circleId_fkey" FOREIGN KEY ("circleId") REFERENCES "safety_circles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "location_shares" ADD CONSTRAINT "location_shares_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "location_share_viewers" ADD CONSTRAINT "location_share_viewers_shareId_fkey" FOREIGN KEY ("shareId") REFERENCES "location_shares"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "location_share_viewers" ADD CONSTRAINT "location_share_viewers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "safety_check_ins" ADD CONSTRAINT "safety_check_ins_circleId_fkey" FOREIGN KEY ("circleId") REFERENCES "safety_circles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "safety_check_ins" ADD CONSTRAINT "safety_check_ins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
