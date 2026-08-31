-- The business's own words and own logo, read from its own website, offered to
-- the owner on the call. Nothing here is published without the owner's yes.
ALTER TABLE "Prospect" ADD COLUMN "draftAbout" TEXT;
ALTER TABLE "Prospect" ADD COLUMN "draftLogoUrl" TEXT;
