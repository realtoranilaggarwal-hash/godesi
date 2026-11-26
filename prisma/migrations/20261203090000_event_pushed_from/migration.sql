-- AlterTable
ALTER TABLE "Event" ADD COLUMN "pushedFrom" TEXT;

-- CreateIndex
CREATE INDEX "Event_pushedFrom_idx" ON "Event"("pushedFrom");
