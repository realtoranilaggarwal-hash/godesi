ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "categorySlug" TEXT;
CREATE INDEX IF NOT EXISTS "Listing_kind_categorySlug_idx" ON "Listing"("kind", "categorySlug");
