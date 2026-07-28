ALTER TYPE "PointsReason" ADD VALUE 'FOUNDING_MEMBER';
ALTER TYPE "PointsReason" ADD VALUE 'FOUNDING_BONUS';

ALTER TABLE "User" ADD COLUMN "foundingNumber" INTEGER;
CREATE UNIQUE INDEX "User_foundingNumber_key" ON "User"("foundingNumber");

-- Existing members join the founding thousand in the order they signed up.
WITH ranked AS (
  SELECT "id", ROW_NUMBER() OVER (ORDER BY "createdAt", "id") AS seat
  FROM "User"
)
UPDATE "User" AS u
SET "foundingNumber" = ranked.seat
FROM ranked
WHERE ranked."id" = u."id" AND ranked.seat <= 1000;
