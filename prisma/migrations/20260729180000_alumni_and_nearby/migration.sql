CREATE TABLE "AlumniRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "degree" TEXT,
    "fieldOfStudy" TEXT,
    "city" TEXT,
    "endYear" INTEGER,
    "current" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlumniRecord_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AlumniRecord_slug_endYear_idx" ON "AlumniRecord"("slug", "endYear");
CREATE INDEX "AlumniRecord_userId_idx" ON "AlumniRecord"("userId");

ALTER TABLE "AlumniRecord" ADD CONSTRAINT "AlumniRecord_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MeetupProfile" ADD COLUMN "latitude" DOUBLE PRECISION;
ALTER TABLE "MeetupProfile" ADD COLUMN "longitude" DOUBLE PRECISION;
ALTER TABLE "MeetupProfile" ADD COLUMN "locationSharedAt" TIMESTAMP(3);
ALTER TABLE "MeetupProfile" ADD COLUMN "visiting" BOOLEAN NOT NULL DEFAULT false;
