-- CreateEnum
CREATE TYPE "GigTier" AS ENUM ('BASIC', 'STANDARD', 'PREMIUM');

-- AlterTable
ALTER TABLE "Gig" ADD COLUMN     "faq" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "ratingCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "ratingSum" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "GigOrder" ADD COLUMN     "packageId" TEXT,
ADD COLUMN     "packageName" TEXT,
ADD COLUMN     "revisions" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "deliveryDays" INTEGER NOT NULL DEFAULT 3;

-- Existing orders keep the delivery they were sold with.
UPDATE "GigOrder" o SET "deliveryDays" = g."deliveryDays" FROM "Gig" g WHERE g."id" = o."gigId";

-- CreateTable
CREATE TABLE "GigPackage" (
    "id" TEXT NOT NULL,
    "gigId" TEXT NOT NULL,
    "tier" "GigTier" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "includes" TEXT,
    "priceMinor" INTEGER NOT NULL,
    "deliveryDays" INTEGER NOT NULL,
    "revisions" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "GigPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GigReview" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "gigId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "reply" TEXT,
    "repliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GigReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GigPackage_gigId_tier_key" ON "GigPackage"("gigId", "tier");

-- CreateIndex
CREATE UNIQUE INDEX "GigReview_orderId_key" ON "GigReview"("orderId");

-- CreateIndex
CREATE INDEX "GigReview_gigId_createdAt_idx" ON "GigReview"("gigId", "createdAt");

-- AddForeignKey
ALTER TABLE "GigPackage" ADD CONSTRAINT "GigPackage_gigId_fkey" FOREIGN KEY ("gigId") REFERENCES "Gig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GigReview" ADD CONSTRAINT "GigReview_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "GigOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GigReview" ADD CONSTRAINT "GigReview_gigId_fkey" FOREIGN KEY ("gigId") REFERENCES "Gig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GigReview" ADD CONSTRAINT "GigReview_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GigOrder" ADD CONSTRAINT "GigOrder_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "GigPackage"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- Backfill: every existing gig becomes a single Basic package.
INSERT INTO "GigPackage" ("id", "gigId", "tier", "name", "description", "includes", "priceMinor", "deliveryDays", "revisions")
SELECT 'gpk_' || "id", "id", 'BASIC', 'Basic', LEFT("description", 200), "includes", "priceMinor", "deliveryDays", 0
FROM "Gig";
