CREATE TABLE "VisitorPing" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "city" TEXT,
    "region" TEXT,
    "country" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisitorPing_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "VisitorPing_createdAt_idx" ON "VisitorPing"("createdAt");
