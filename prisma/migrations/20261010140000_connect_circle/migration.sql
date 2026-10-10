-- AlterTable
ALTER TABLE "MeetupProfile" ADD COLUMN "interests" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "ageRange" TEXT,
ADD COLUMN "meetRadiusMiles" INTEGER;
