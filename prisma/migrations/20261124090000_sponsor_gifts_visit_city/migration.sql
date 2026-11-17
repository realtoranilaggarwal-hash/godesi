-- AlterTable
ALTER TABLE "EventSponsor" ADD COLUMN "buyerGift" TEXT;

-- AlterTable
ALTER TABLE "Event" ADD COLUMN "city" TEXT,
ADD COLUMN "source" TEXT;
