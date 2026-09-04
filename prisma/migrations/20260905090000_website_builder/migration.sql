-- CreateEnum
CREATE TYPE "WebsiteProjectStatus" AS ENUM ('DRAFT', 'PREVIEW', 'APPROVED', 'PAID', 'LIVE', 'CANCELLED');

-- CreateTable
CREATE TABLE "WebsiteProject" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "status" "WebsiteProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "businessName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "whatsapp" TEXT,
    "address" TEXT,
    "domain" TEXT,
    "sources" JSONB NOT NULL,
    "found" JSONB,
    "uploads" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "goals" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "wish" TEXT,
    "content" JSONB,
    "designSeed" INTEGER NOT NULL DEFAULT 0,
    "changeNotes" TEXT,
    "powerUps" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "quoted" JSONB,
    "setupMinor" INTEGER,
    "monthlyMinor" INTEGER,
    "stripeSessionId" TEXT,
    "stripeSubscriptionId" TEXT,
    "paidAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "liveUrl" TEXT,
    "staffNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebsiteProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebsitePowerUp" (
    "key" TEXT NOT NULL,
    "monthlyUsd" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebsitePowerUp_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "WebsiteProject_stripeSessionId_key" ON "WebsiteProject"("stripeSessionId");

-- CreateIndex
CREATE INDEX "WebsiteProject_status_createdAt_idx" ON "WebsiteProject"("status", "createdAt");

-- CreateIndex
CREATE INDEX "WebsiteProject_userId_idx" ON "WebsiteProject"("userId");

-- AddForeignKey
ALTER TABLE "WebsiteProject" ADD CONSTRAINT "WebsiteProject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
