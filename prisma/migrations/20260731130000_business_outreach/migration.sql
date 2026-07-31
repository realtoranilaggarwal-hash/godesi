-- Owner-invite outreach on unclaimed starter listings.
ALTER TABLE "Business" ADD COLUMN     "invitedAt" TIMESTAMP(3),
ADD COLUMN     "inviteChannel" TEXT,
ADD COLUMN     "inviteNote" TEXT;
