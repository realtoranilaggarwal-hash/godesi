-- Featured tier, paid terms and the contact switch.
ALTER TABLE "Business"
  ADD COLUMN "featuredRank" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "featuredUntil" TIMESTAMP(3),
  ADD COLUMN "hideContact" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "EliteEntry"
  ADD COLUMN "rankCents" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "eliteUntil" TIMESTAMP(3);

ALTER TABLE "UpiRequest"
  ADD COLUMN "months" INTEGER NOT NULL DEFAULT 1;

CREATE INDEX "EliteEntry_status_badge_rankCents_idx"
  ON "EliteEntry"("status", "badge", "rankCents");

-- Existing paid members keep their placement: rank from the plan they hold.
UPDATE "Business" AS b
SET "featuredRank" = CASE WHEN u."plan" = 'PREMIUM' THEN 2 ELSE 1 END,
    "featuredUntil" = u."planExpiresAt"
FROM "User" AS u
WHERE b."ownerId" = u."id"
  AND u."plan" <> 'FREE'
  AND (u."planExpiresAt" IS NULL OR u."planExpiresAt" > NOW());

-- Elite spend already made keeps its placement until a term is sold.
UPDATE "EliteEntry" SET "rankCents" = "paidCents";
