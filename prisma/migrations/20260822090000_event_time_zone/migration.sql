-- The zone an event's times were written in. Null means the old behaviour:
-- read as India time, which is how they were entered.
ALTER TABLE "EventListing" ADD COLUMN IF NOT EXISTS "timeZone" TEXT;
