-- A business card holds several showcase videos; the existing single link
-- becomes the first of them so nothing already saved is lost.
ALTER TABLE "Business" ADD COLUMN "videoUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];

UPDATE "Business"
SET "videoUrls" = ARRAY["videoUrl"]
WHERE "videoUrl" IS NOT NULL AND "videoUrl" <> '';
