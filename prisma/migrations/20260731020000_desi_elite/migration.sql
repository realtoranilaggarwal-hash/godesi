-- CreateEnum
CREATE TYPE "EliteStatus" AS ENUM ('PENDING', 'APPROVED', 'INTERVIEW_PENDING', 'INTERVIEW_COMPLETED', 'PUBLISHED', 'REJECTED');

-- CreateEnum
CREATE TYPE "EliteBadge" AS ENUM ('BASIC', 'PREMIUM', 'FEATURED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "elitePrompt" TEXT;

-- CreateTable
CREATE TABLE "EliteEntry" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "userId" TEXT,
    "fullName" TEXT NOT NULL,
    "businessName" TEXT,
    "category" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "country" TEXT,
    "profileUrl" TEXT,
    "shortBio" TEXT NOT NULL,
    "achievements" TEXT,
    "yearsExperience" INTEGER,
    "websiteUrl" TEXT,
    "socialLinks" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "photoUrl" TEXT,
    "videoUrl" TEXT,
    "proofUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "interviewTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "nominationType" TEXT NOT NULL DEFAULT 'SELF',
    "nomineeName" TEXT,
    "nomineeContact" TEXT,
    "nominatedById" TEXT,
    "status" "EliteStatus" NOT NULL DEFAULT 'PENDING',
    "badge" "EliteBadge" NOT NULL DEFAULT 'BASIC',
    "adminNote" TEXT,
    "interviewUrl" TEXT,
    "assignedTo" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EliteEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EliteEntry_slug_key" ON "EliteEntry"("slug");

-- CreateIndex
CREATE INDEX "EliteEntry_status_badge_publishedAt_idx" ON "EliteEntry"("status", "badge", "publishedAt");

-- CreateIndex
CREATE INDEX "EliteEntry_userId_idx" ON "EliteEntry"("userId");

-- AddForeignKey
ALTER TABLE "EliteEntry" ADD CONSTRAINT "EliteEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
