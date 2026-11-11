ALTER TABLE "Event"
  ADD COLUMN IF NOT EXISTS "referrer" TEXT,
  ADD COLUMN IF NOT EXISTS "path" TEXT;

CREATE INDEX IF NOT EXISTS "Event_businessId_createdAt_idx" ON "Event"("businessId", "createdAt");
