-- One free wall block per member: the second simultaneous free claim fails.
CREATE UNIQUE INDEX "wall_one_free_order_per_user"
  ON "AdOrder" ("userId")
  WHERE "wallBlockId" IS NOT NULL AND "amountMinor" = 0;
