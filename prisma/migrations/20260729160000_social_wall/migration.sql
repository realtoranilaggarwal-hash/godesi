CREATE TYPE "SocialPlatform" AS ENUM ('X', 'INSTAGRAM', 'FACEBOOK', 'LINKEDIN', 'YOUTUBE', 'THREADS');

CREATE TABLE "SocialPost" (
    "id" TEXT NOT NULL,
    "platform" "SocialPlatform" NOT NULL DEFAULT 'X',
    "url" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "handle" TEXT,
    "avatarUrl" TEXT,
    "text" TEXT NOT NULL,
    "imageUrl" TEXT,
    "postedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocialPost_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SocialPost_url_key" ON "SocialPost"("url");
CREATE INDEX "SocialPost_active_postedAt_idx" ON "SocialPost"("active", "postedAt");
