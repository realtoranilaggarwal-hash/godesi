-- AlterTable
ALTER TABLE "EventListing" ADD COLUMN     "payoutTermsAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "platformFeeMinor" INTEGER NOT NULL DEFAULT 0;

