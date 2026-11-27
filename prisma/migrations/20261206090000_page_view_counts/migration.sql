-- CreateTable
CREATE TABLE "PageViewCount" (
    "path" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageViewCount_pkey" PRIMARY KEY ("path")
);
