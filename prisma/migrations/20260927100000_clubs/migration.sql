-- CreateEnum
CREATE TYPE "ClubVisibility" AS ENUM ('PUBLIC', 'PRIVATE');
CREATE TYPE "ClubRole" AS ENUM ('ORGANIZER', 'MEMBER');
CREATE TYPE "ClubMemberStatus" AS ENUM ('PENDING', 'ACTIVE');
CREATE TYPE "ContributionMode" AS ENUM ('NONE', 'SUGGESTED', 'CUSTOM');
CREATE TYPE "RsvpAnswer" AS ENUM ('YES', 'MAYBE', 'NO');

-- AlterTable
ALTER TABLE "EventListing"
  ADD COLUMN "clubId" TEXT,
  ADD COLUMN "contributionMode" "ContributionMode" NOT NULL DEFAULT 'NONE',
  ADD COLUMN "contributionMinor" INTEGER,
  ADD COLUMN "contributionNote" TEXT,
  ADD COLUMN "bringOptions" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "participateOptions" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "Club" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "imageUrl" TEXT,
  "category" TEXT NOT NULL,
  "city" TEXT,
  "state" TEXT,
  "country" TEXT,
  "online" BOOLEAN NOT NULL DEFAULT false,
  "rules" TEXT,
  "playlistUrl" TEXT,
  "websiteUrl" TEXT,
  "whatsappUrl" TEXT,
  "visibility" "ClubVisibility" NOT NULL DEFAULT 'PUBLIC',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdById" TEXT NOT NULL,
  CONSTRAINT "Club_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ClubMember" (
  "id" TEXT NOT NULL,
  "clubId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "role" "ClubRole" NOT NULL DEFAULT 'MEMBER',
  "status" "ClubMemberStatus" NOT NULL DEFAULT 'ACTIVE',
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ClubMember_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EventRsvp" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "answer" "RsvpAnswer" NOT NULL DEFAULT 'YES',
  "bringing" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "bringingNote" TEXT,
  "participating" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "amountMinor" INTEGER,
  "guests" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EventRsvp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Club_slug_key" ON "Club"("slug");
CREATE INDEX "Club_category_idx" ON "Club"("category");
CREATE INDEX "Club_city_idx" ON "Club"("city");
CREATE UNIQUE INDEX "ClubMember_clubId_userId_key" ON "ClubMember"("clubId", "userId");
CREATE INDEX "ClubMember_userId_idx" ON "ClubMember"("userId");
CREATE UNIQUE INDEX "EventRsvp_eventId_userId_key" ON "EventRsvp"("eventId", "userId");
CREATE INDEX "EventRsvp_userId_idx" ON "EventRsvp"("userId");
CREATE INDEX "EventListing_clubId_idx" ON "EventListing"("clubId");

-- AddForeignKey
ALTER TABLE "EventListing" ADD CONSTRAINT "EventListing_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Club" ADD CONSTRAINT "Club_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClubMember" ADD CONSTRAINT "ClubMember_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClubMember" ADD CONSTRAINT "ClubMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EventRsvp" ADD CONSTRAINT "EventRsvp_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "EventListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EventRsvp" ADD CONSTRAINT "EventRsvp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
