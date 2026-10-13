-- CreateTable
CREATE TABLE "WallTopic" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "emoji" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WallTopic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WallTopic_active_sortOrder_idx" ON "WallTopic"("active", "sortOrder");

-- Starting topics, so the wall is populated the moment it ships.
INSERT INTO "WallTopic" ("id", "label", "query", "emoji", "sortOrder") VALUES
  ('wallseed01', 'I love Modi', 'i love modi', '🇮🇳', 10),
  ('wallseed02', 'H-1B visa', 'h1b visa', '🛂', 20),
  ('wallseed03', 'Desi in New Jersey', 'desi indian community new jersey', '🌉', 30),
  ('wallseed04', 'Desi events', 'desi indian community events usa', '🎉', 40),
  ('wallseed05', 'Desi investments', 'nri investment india', '📈', 50),
  ('wallseed06', 'Desi in USA', 'indian community usa', '🇺🇸', 60),
  ('wallseed07', 'Indian weddings', 'indian wedding', '💍', 70),
  ('wallseed08', 'Desi business', 'indian american business owners', '🏪', 80),
  ('wallseed09', 'Real estate', 'indian american real estate housing', '🏡', 90),
  ('wallseed10', 'Bollywood', 'bollywood', '🎬', 100),
  ('wallseed11', 'Cricket', 'cricket india', '🏏', 110),
  ('wallseed12', 'Festivals', 'diwali navratri holi celebration', '🪔', 120);
