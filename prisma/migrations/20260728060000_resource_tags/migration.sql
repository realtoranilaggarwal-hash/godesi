ALTER TABLE "ResourceLink"
  ADD COLUMN "description" TEXT,
  ADD COLUMN "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

UPDATE "ResourceLink" SET "tags" = ARRAY["tag"] WHERE "tag" IS NOT NULL AND "tag" <> '';

ALTER TABLE "ResourceLink" DROP COLUMN "tag";
