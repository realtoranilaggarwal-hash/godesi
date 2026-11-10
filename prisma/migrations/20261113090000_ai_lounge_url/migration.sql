-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "aiLoungeUrl" TEXT;

-- AlterTable
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "aiLoungeUrl" TEXT;
