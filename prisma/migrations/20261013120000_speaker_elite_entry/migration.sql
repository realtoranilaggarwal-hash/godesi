-- AlterTable
ALTER TABLE "EventSpeaker" ADD COLUMN "eliteEntryId" TEXT;

-- CreateIndex
CREATE INDEX "EventSpeaker_eliteEntryId_idx" ON "EventSpeaker"("eliteEntryId");

-- AddForeignKey
ALTER TABLE "EventSpeaker" ADD CONSTRAINT "EventSpeaker_eliteEntryId_fkey" FOREIGN KEY ("eliteEntryId") REFERENCES "EliteEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
