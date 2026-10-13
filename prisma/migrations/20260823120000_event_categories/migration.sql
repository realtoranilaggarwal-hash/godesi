-- An event's own categories (garba, standup, satsang…) and the language it is
-- performed in, so /events can be browsed the way ticket sites are.
ALTER TABLE "EventListing" ADD COLUMN IF NOT EXISTS "genres" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "EventListing" ADD COLUMN IF NOT EXISTS "languages" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Both are filtered with "has some of these", which needs a GIN index.
CREATE INDEX IF NOT EXISTS "EventListing_genres_idx" ON "EventListing" USING GIN ("genres");
CREATE INDEX IF NOT EXISTS "EventListing_languages_idx" ON "EventListing" USING GIN ("languages");
