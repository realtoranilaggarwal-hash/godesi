CREATE TYPE "EventMode" AS ENUM ('OFFLINE', 'ONLINE', 'HYBRID');
CREATE TYPE "EventFrequency" AS ENUM ('ONE_TIME', 'RECURRING');

ALTER TABLE "EventListing"
  ADD COLUMN "state" TEXT,
  ADD COLUMN "country" TEXT,
  ADD COLUMN "eventType" TEXT,
  ADD COLUMN "mode" "EventMode" NOT NULL DEFAULT 'OFFLINE',
  ADD COLUMN "onlineUrl" TEXT,
  ADD COLUMN "frequency" "EventFrequency" NOT NULL DEFAULT 'ONE_TIME',
  ADD COLUMN "recurrence" TEXT,
  ADD COLUMN "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "categorySlugs" TEXT[] DEFAULT ARRAY[]::TEXT[];

CREATE TABLE "EventSpeaker" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "photoUrl" TEXT,
  "bio" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "EventSpeaker_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EventSession" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "stage" TEXT,
  "speaker" TEXT,
  "startTime" TEXT,
  "endTime" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "EventSession_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EventSpeaker_eventId_idx" ON "EventSpeaker"("eventId");
CREATE INDEX "EventSession_eventId_idx" ON "EventSession"("eventId");

ALTER TABLE "EventSpeaker" ADD CONSTRAINT "EventSpeaker_eventId_fkey"
  FOREIGN KEY ("eventId") REFERENCES "EventListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EventSession" ADD CONSTRAINT "EventSession_eventId_fkey"
  FOREIGN KEY ("eventId") REFERENCES "EventListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
