-- Google Photos albums and YouTube playlists become a paid perk. Free cards and
-- profiles that already have one keep showing that exact link.
ALTER TABLE "User" ADD COLUMN "keptPlaylistUrl" TEXT;
ALTER TABLE "Business" ADD COLUMN "keptAlbumUrl" TEXT;
ALTER TABLE "Business" ADD COLUMN "keptPlaylistUrl" TEXT;

UPDATE "User" SET "keptPlaylistUrl" = "playlistUrl" WHERE "playlistUrl" IS NOT NULL;
UPDATE "Business" SET "keptAlbumUrl" = "albumUrl" WHERE "albumUrl" IS NOT NULL;
UPDATE "Business" SET "keptPlaylistUrl" = "playlistUrl" WHERE "playlistUrl" IS NOT NULL;
