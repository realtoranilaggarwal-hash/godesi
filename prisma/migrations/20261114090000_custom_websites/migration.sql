ALTER TYPE "CouponScope" ADD VALUE IF NOT EXISTS 'WEBSITE';

ALTER TABLE "WebsiteProject"
  ADD COLUMN IF NOT EXISTS "tier" TEXT NOT NULL DEFAULT 'AI',
  ADD COLUMN IF NOT EXISTS "pageContent" JSONB,
  ADD COLUMN IF NOT EXISTS "designUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "previewToken" TEXT,
  ADD COLUMN IF NOT EXISTS "previewSentAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "billing" TEXT NOT NULL DEFAULT 'MONTH';

CREATE UNIQUE INDEX IF NOT EXISTS "WebsiteProject_previewToken_key" ON "WebsiteProject"("previewToken");

CREATE TABLE IF NOT EXISTS "WebsiteChangeRequest" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "doneAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WebsiteChangeRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "WebsiteChangeRequest_projectId_createdAt_idx" ON "WebsiteChangeRequest"("projectId", "createdAt");

DO $$ BEGIN
  ALTER TABLE "WebsiteChangeRequest" ADD CONSTRAINT "WebsiteChangeRequest_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "WebsiteProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
