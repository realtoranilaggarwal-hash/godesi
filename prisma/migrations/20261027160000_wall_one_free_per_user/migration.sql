-- One free wall block per member, marked by provider='free' (credit-covered
-- $0 wall orders use provider='wall-credit' and must not trip this index).
CREATE UNIQUE INDEX "wall_one_free_order_per_user"
  ON "AdOrder" ("userId")
  WHERE "wallBlockId" IS NOT NULL AND "provider" = 'free';
