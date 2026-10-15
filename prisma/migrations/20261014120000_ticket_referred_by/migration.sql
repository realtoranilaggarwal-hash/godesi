-- AlterTable
ALTER TABLE "EventListing" ADD COLUMN "askReferredBy" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN "referredBy" TEXT;
