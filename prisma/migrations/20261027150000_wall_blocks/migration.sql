CREATE TABLE "WallBlock" (
    "id" TEXT NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "w" INTEGER NOT NULL,
    "h" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "linkUrl" TEXT NOT NULL,
    "status" "BannerStatus" NOT NULL DEFAULT 'DRAFT',
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "advertiserId" TEXT,
    CONSTRAINT "WallBlock_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "AdOrder" ADD COLUMN "wallBlockId" TEXT;
ALTER TABLE "WallBlock" ADD CONSTRAINT "WallBlock_advertiserId_fkey" FOREIGN KEY ("advertiserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AdOrder" ADD CONSTRAINT "AdOrder_wallBlockId_fkey" FOREIGN KEY ("wallBlockId") REFERENCES "WallBlock"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "WallBlock_status_idx" ON "WallBlock"("status");
