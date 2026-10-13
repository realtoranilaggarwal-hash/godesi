-- CreateTable
CREATE TABLE "PartnerKit" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "standeePdfUrl" TEXT,
    "printerUrl" TEXT,
    "banner160Url" TEXT,
    "banner728Url" TEXT,
    "note" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnerKit_pkey" PRIMARY KEY ("id")
);

