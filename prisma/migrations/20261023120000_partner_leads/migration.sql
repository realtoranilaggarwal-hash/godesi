-- Agent requests from GoDesi network sites
CREATE TABLE "PartnerLead" (
    "id" TEXT NOT NULL,
    "site" TEXT NOT NULL,
    "intent" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'real-estate',
    "city" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "handledAt" TIMESTAMP(3),

    CONSTRAINT "PartnerLead_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PartnerLead_createdAt_idx" ON "PartnerLead"("createdAt");
