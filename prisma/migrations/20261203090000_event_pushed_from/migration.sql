-- AlterTable
ALTER TABLE "EventListing" ADD COLUMN "pushedFrom" TEXT;

-- CreateIndex
CREATE INDEX "Event_pushedFrom_idx" ON "EventListing"("pushedFrom");
