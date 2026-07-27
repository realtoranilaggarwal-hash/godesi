-- Money moves to the currency's minor unit (paise, cents) so fractional
-- prices such as $5.99 survive a round trip. Existing rows held whole
-- major units, so they are multiplied by 100.

ALTER TABLE "AdOrder" RENAME COLUMN "amount" TO "amountMinor";
UPDATE "AdOrder" SET "amountMinor" = "amountMinor" * 100;

ALTER TABLE "Payment" RENAME COLUMN "amount" TO "amountMinor";
UPDATE "Payment" SET "amountMinor" = "amountMinor" * 100;

ALTER TABLE "Ticket" RENAME COLUMN "amount" TO "amountMinor";
UPDATE "Ticket" SET "amountMinor" = "amountMinor" * 100;
