-- Leads captured on the shareable digital business card (/card/<slug>)
CREATE TABLE "CardLead" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CardLead_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CardLead_businessId_createdAt_idx" ON "CardLead"("businessId", "createdAt");

ALTER TABLE "CardLead" ADD CONSTRAINT "CardLead_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
