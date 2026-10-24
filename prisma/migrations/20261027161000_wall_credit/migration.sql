-- Ad-spend credit toward wall bricks: how much of a wall order was covered.
ALTER TABLE "AdOrder" ADD COLUMN "wallCreditMinor" INTEGER NOT NULL DEFAULT 0;

-- Free claims are marked by provider='free' now (credit-covered $0 orders use
-- provider='wall-credit'), so the one-free-brick index tracks that instead.
DROP INDEX IF EXISTS "wall_one_free_order_per_user";
CREATE UNIQUE INDEX "wall_one_free_order_per_user"
  ON "AdOrder" ("userId")
  WHERE "wallBlockId" IS NOT NULL AND "provider" = 'free';
