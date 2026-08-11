-- Organisers can show a public Google Photos album instead of uploading photos.
ALTER TABLE "Event" ADD COLUMN "albumUrl" TEXT;
