-- CreateEnum
CREATE TYPE "ShareStatus" AS ENUM ('SENT', 'FAILED', 'SKIPPED');

-- CreateTable
CREATE TABLE "AutoShareSetting" (
    "key" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutoShareSetting_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "ShareLog" (
    "id" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "status" "ShareStatus" NOT NULL DEFAULT 'SENT',
    "detail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShareLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ShareLog_createdAt_idx" ON "ShareLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ShareLog_channel_subject_key" ON "ShareLog"("channel", "subject");

