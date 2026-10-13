-- The public page a hand-added starter listing was read from, so the card can
-- credit it and the desk cannot add the same page twice.
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "sourceUrl" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "Business_sourceUrl_key" ON "Business"("sourceUrl");
