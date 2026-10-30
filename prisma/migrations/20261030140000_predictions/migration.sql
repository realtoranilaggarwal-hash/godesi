-- CreateEnum values for the prediction game
ALTER TYPE "PointsReason" ADD VALUE 'PREDICT_WIN';
ALTER TYPE "PointsReason" ADD VALUE 'PREDICT_LOSS';

-- CreateTable
CREATE TABLE "PredictionMarket" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "options" TEXT[],
    "day" TIMESTAMP(3) NOT NULL,
    "baseline" DOUBLE PRECISION,
    "final" DOUBLE PRECISION,
    "outcome" INTEGER,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PredictionMarket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PredictionPick" (
    "id" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "choice" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PredictionPick_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PredictionMarket_slug_day_key" ON "PredictionMarket"("slug", "day");

-- CreateIndex
CREATE UNIQUE INDEX "PredictionPick_marketId_userId_key" ON "PredictionPick"("marketId", "userId");

-- AddForeignKey
ALTER TABLE "PredictionPick" ADD CONSTRAINT "PredictionPick_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "PredictionMarket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PredictionPick" ADD CONSTRAINT "PredictionPick_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
