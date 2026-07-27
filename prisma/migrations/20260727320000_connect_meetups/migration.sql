CREATE TYPE "MeetupGender" AS ENUM ('WOMAN', 'MAN', 'OTHER');
CREATE TYPE "MeetupMarital" AS ENUM ('SINGLE', 'MARRIED', 'PREFER_NOT_SAY');

CREATE TABLE "MeetupProfile" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  "age" INTEGER NOT NULL,
  "gender" "MeetupGender" NOT NULL,
  "marital" "MeetupMarital" NOT NULL DEFAULT 'PREFER_NOT_SAY',
  "city" TEXT NOT NULL,
  "state" TEXT,
  "intents" TEXT NOT NULL,
  "bio" TEXT NOT NULL,
  "whatsappNumber" TEXT,
  "status" "ListingStatus" NOT NULL DEFAULT 'PENDING',
  "visible" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "MeetupProfile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MeetupProfile_userId_key" ON "MeetupProfile"("userId");
CREATE INDEX "MeetupProfile_status_city_idx" ON "MeetupProfile"("status", "city");

CREATE TABLE "MeetupReport" (
  "id" TEXT NOT NULL,
  "profileId" TEXT NOT NULL,
  "reporterId" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "MeetupReport_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MeetupReport_profileId_reporterId_key" ON "MeetupReport"("profileId", "reporterId");
CREATE INDEX "MeetupReport_profileId_idx" ON "MeetupReport"("profileId");

ALTER TABLE "MeetupProfile" ADD CONSTRAINT "MeetupProfile_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MeetupReport" ADD CONSTRAINT "MeetupReport_profileId_fkey"
  FOREIGN KEY ("profileId") REFERENCES "MeetupProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MeetupReport" ADD CONSTRAINT "MeetupReport_reporterId_fkey"
  FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
