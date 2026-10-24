-- Paid seats in GoDesi courses (/course). PAID unlocks the lessons.
CREATE TABLE "CourseEnrollment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseSlug" TEXT NOT NULL,
    "amountMinor" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "provider" TEXT NOT NULL DEFAULT 'stripe',
    "reference" TEXT,
    "status" "AdOrderStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseEnrollment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CourseEnrollment_reference_key" ON "CourseEnrollment"("reference");
CREATE UNIQUE INDEX "CourseEnrollment_userId_courseSlug_key" ON "CourseEnrollment"("userId", "courseSlug");
CREATE INDEX "CourseEnrollment_courseSlug_idx" ON "CourseEnrollment"("courseSlug");

ALTER TABLE "CourseEnrollment" ADD CONSTRAINT "CourseEnrollment_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
