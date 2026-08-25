-- Staff the admin chooses to show as the team on /about, with the title to
-- print and the order to print them in. Off by default: nobody appears on the
-- public site until an admin ticks them.
ALTER TABLE "User" ADD COLUMN "teamPublic" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "teamTitle" TEXT;
ALTER TABLE "User" ADD COLUMN "teamRank" INTEGER NOT NULL DEFAULT 0;
