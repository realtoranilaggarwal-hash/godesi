-- CreateTable
CREATE TABLE "PromoEvent" (
    "id" TEXT NOT NULL,
    "campaign" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "source" TEXT,
    "city" TEXT,
    "name" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "business" TEXT,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromoEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PromoEvent_campaign_kind_target_idx" ON "PromoEvent"("campaign", "kind", "target");
