CREATE TABLE "HelpClip" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "note" TEXT,
    "categorySlug" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "plays" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HelpClip_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "HelpClip_active_categorySlug_sortOrder_idx" ON "HelpClip"("active", "categorySlug", "sortOrder");
