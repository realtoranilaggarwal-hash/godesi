-- AlterTable
ALTER TABLE "Prospect" ADD COLUMN     "wellnessPitchedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "wellnessLaunchSentAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "WellnessProduct" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "imageUrl" TEXT,
    "merchantName" TEXT NOT NULL,
    "description" TEXT,
    "regularUrl" TEXT,
    "affiliateUrl" TEXT,
    "category" TEXT NOT NULL,
    "disclosureText" TEXT NOT NULL DEFAULT 'GoDesi may earn a commission when you purchase through certain links. This does not increase your purchase price.',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WellnessProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WellnessEbook" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "coverUrl" TEXT,
    "pdfUrl" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WellnessEbook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EbookDownload" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ebookId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EbookDownload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WellnessArticle" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "metaDescription" TEXT NOT NULL,
    "coverImage" TEXT,
    "body" TEXT NOT NULL,
    "sources" TEXT NOT NULL,
    "disclaimer" TEXT,
    "productCategories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WellnessArticle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WellnessProduct_slug_key" ON "WellnessProduct"("slug");

-- CreateIndex
CREATE INDEX "WellnessProduct_active_category_idx" ON "WellnessProduct"("active", "category");

-- CreateIndex
CREATE UNIQUE INDEX "WellnessEbook_slug_key" ON "WellnessEbook"("slug");

-- CreateIndex
CREATE INDEX "EbookDownload_ebookId_idx" ON "EbookDownload"("ebookId");

-- CreateIndex
CREATE UNIQUE INDEX "EbookDownload_userId_ebookId_key" ON "EbookDownload"("userId", "ebookId");

-- CreateIndex
CREATE UNIQUE INDEX "WellnessArticle_slug_key" ON "WellnessArticle"("slug");

-- CreateIndex
CREATE INDEX "WellnessArticle_active_sortOrder_idx" ON "WellnessArticle"("active", "sortOrder");

-- AddForeignKey
ALTER TABLE "EbookDownload" ADD CONSTRAINT "EbookDownload_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EbookDownload" ADD CONSTRAINT "EbookDownload_ebookId_fkey" FOREIGN KEY ("ebookId") REFERENCES "WellnessEbook"("id") ON DELETE CASCADE ON UPDATE CASCADE;
