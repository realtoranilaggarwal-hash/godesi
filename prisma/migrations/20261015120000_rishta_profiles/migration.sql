-- CreateEnum
CREATE TYPE "RishtaPostedBy" AS ENUM ('SELF', 'PARENT', 'SIBLING', 'RELATIVE', 'FRIEND');

-- CreateEnum
CREATE TYPE "RishtaMarital" AS ENUM ('NEVER_MARRIED', 'DIVORCED', 'WIDOWED');

-- CreateTable
CREATE TABLE "RishtaProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postedBy" "RishtaPostedBy" NOT NULL DEFAULT 'SELF',
    "displayName" TEXT NOT NULL,
    "gender" "MeetupGender" NOT NULL,
    "birthYear" INTEGER NOT NULL,
    "heightCm" INTEGER,
    "maritalHistory" "RishtaMarital" NOT NULL DEFAULT 'NEVER_MARRIED',
    "religion" TEXT,
    "community" TEXT,
    "gotra" TEXT,
    "motherTongue" TEXT,
    "education" TEXT,
    "profession" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "country" TEXT,
    "about" TEXT NOT NULL,
    "photoUrl" TEXT,
    "hidePhoto" BOOLEAN NOT NULL DEFAULT false,
    "moonSign" INTEGER,
    "nakshatra" INTEGER,
    "whatsappNumber" TEXT,
    "status" "ListingStatus" NOT NULL DEFAULT 'PENDING',
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RishtaProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RishtaProfile_userId_key" ON "RishtaProfile"("userId");

-- CreateIndex
CREATE INDEX "RishtaProfile_status_gender_idx" ON "RishtaProfile"("status", "gender");

-- AddForeignKey
ALTER TABLE "RishtaProfile" ADD CONSTRAINT "RishtaProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
