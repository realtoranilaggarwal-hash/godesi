-- CreateEnum
CREATE TYPE "PropertyGroup" AS ENUM ('RESIDENTIAL', 'COMMERCIAL', 'LAND', 'NEW_PROJECT');

-- CreateEnum
CREATE TYPE "PostedByRole" AS ENUM ('OWNER', 'AGENT', 'BUILDER');

-- AlterTable
ALTER TABLE "Listing"
  ADD COLUMN "propertyGroup" "PropertyGroup",
  ADD COLUMN "propertyType" TEXT,
  ADD COLUMN "postedByRole" "PostedByRole",
  ADD COLUMN "bathrooms" INTEGER,
  ADD COLUMN "balconies" INTEGER,
  ADD COLUMN "builtUpArea" INTEGER,
  ADD COLUMN "carpetArea" INTEGER,
  ADD COLUMN "areaUnit" TEXT,
  ADD COLUMN "propertyAge" TEXT,
  ADD COLUMN "floor" INTEGER,
  ADD COLUMN "totalFloors" INTEGER,
  ADD COLUMN "facing" TEXT,
  ADD COLUMN "ownership" TEXT,
  ADD COLUMN "negotiable" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "underLoan" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "deposit" INTEGER,
  ADD COLUMN "maintenance" INTEGER,
  ADD COLUMN "parkingCar" INTEGER,
  ADD COLUMN "parkingBike" INTEGER,
  ADD COLUMN "amenities" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "utilities" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "tourUrl" TEXT,
  ADD COLUMN "mapUrl" TEXT,
  ADD COLUMN "state" TEXT,
  ADD COLUMN "country" TEXT,
  ADD COLUMN "availableFrom" TIMESTAMP(3),
  ADD COLUMN "tenantPref" TEXT,
  ADD COLUMN "nriFriendly" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "investmentDeal" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "contactName" TEXT,
  ADD COLUMN "contactPhone" TEXT,
  ADD COLUMN "contactEmail" TEXT;

-- CreateIndex
CREATE INDEX "Listing_status_propertyGroup_propertyType_idx" ON "Listing"("status", "propertyGroup", "propertyType");

-- CreateTable
CREATE TABLE "ListingLead" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "userId" TEXT,
    "channel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListingLead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ListingLead_listingId_createdAt_idx" ON "ListingLead"("listingId", "createdAt");

-- CreateIndex
CREATE INDEX "ListingLead_userId_idx" ON "ListingLead"("userId");

-- AddForeignKey
ALTER TABLE "ListingLead" ADD CONSTRAINT "ListingLead_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingLead" ADD CONSTRAINT "ListingLead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
