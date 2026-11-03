-- CreateTable
CREATE TABLE "SearchMiss" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT '',
    "page" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "lastResults" INTEGER NOT NULL DEFAULT 0,
    "firstAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchMiss_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SearchMiss_query_city_page_key" ON "SearchMiss"("query", "city", "page");

-- CreateIndex
CREATE INDEX "SearchMiss_lastAt_idx" ON "SearchMiss"("lastAt");
