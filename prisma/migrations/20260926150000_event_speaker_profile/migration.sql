ALTER TABLE "EventSpeaker" ADD COLUMN "userId" TEXT;
CREATE INDEX "EventSpeaker_userId_idx" ON "EventSpeaker"("userId");
ALTER TABLE "EventSpeaker" ADD CONSTRAINT "EventSpeaker_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
