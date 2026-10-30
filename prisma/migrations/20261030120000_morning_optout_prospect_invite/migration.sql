-- Morning email becomes opt-out (default ON for every member).
ALTER TABLE "User" ADD COLUMN "morningOptOutAt" TIMESTAMP(3);

-- One organizer invite per prospect, ever.
ALTER TABLE "Prospect" ADD COLUMN "invitedAt" TIMESTAMP(3);
