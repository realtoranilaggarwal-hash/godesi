-- AlterTable
ALTER TABLE "EliteEntry" ADD COLUMN "storySheet" JSONB,
ADD COLUMN "interviewAt" TIMESTAMP(3),
ADD COLUMN "interviewPlace" TEXT;
