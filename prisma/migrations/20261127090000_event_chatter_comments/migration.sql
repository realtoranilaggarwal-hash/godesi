-- Comments under event pages are Chatter posts tied to the event.
-- AlterTable
ALTER TABLE "ChatterPost" ADD COLUMN     "eventId" TEXT;

-- CreateIndex
CREATE INDEX "ChatterPost_eventId_parentId_createdAt_idx" ON "ChatterPost"("eventId", "parentId", "createdAt");

-- AddForeignKey
ALTER TABLE "ChatterPost" ADD CONSTRAINT "ChatterPost_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "EventListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
