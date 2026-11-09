-- AlterTable
ALTER TABLE "MeetupProfile" ADD COLUMN IF NOT EXISTS "openToDating" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE IF NOT EXISTS "MeetupBlock" (
    "id" TEXT NOT NULL,
    "blockerId" TEXT NOT NULL,
    "blockedId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MeetupBlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "MeetupBlock_blockedId_idx" ON "MeetupBlock"("blockedId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "MeetupBlock_blockerId_blockedId_key" ON "MeetupBlock"("blockerId", "blockedId");

-- AddForeignKey
ALTER TABLE "MeetupBlock" ADD CONSTRAINT "MeetupBlock_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetupBlock" ADD CONSTRAINT "MeetupBlock_blockedId_fkey" FOREIGN KEY ("blockedId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
