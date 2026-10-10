-- AlterTable
ALTER TABLE "User" ADD COLUMN "offerInterests" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "offerPhone" TEXT,
ADD COLUMN "offerInterestsAt" TIMESTAMP(3);
