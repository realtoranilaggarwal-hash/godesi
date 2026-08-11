-- Personal profiles: public handle, avatar, bio and location.
ALTER TABLE "User" ADD COLUMN "username" TEXT;
ALTER TABLE "User" ADD COLUMN "avatarUrl" TEXT;
ALTER TABLE "User" ADD COLUMN "bio" TEXT;
ALTER TABLE "User" ADD COLUMN "location" TEXT;

CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
