-- Public Google Photos album links: members show a full gallery without using Godesi storage.
ALTER TABLE "Listing" ADD COLUMN "albumUrl" TEXT;
ALTER TABLE "Business" ADD COLUMN "albumUrl" TEXT;
