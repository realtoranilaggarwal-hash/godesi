-- AlterTable
ALTER TABLE "EventListing" ADD COLUMN     "liveUrl" TEXT,
ADD COLUMN     "liveTicketOnly" BOOLEAN NOT NULL DEFAULT false;
