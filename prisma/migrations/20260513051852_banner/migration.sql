-- CreateEnum
CREATE TYPE "BannerPosition" AS ENUM ('home_top', 'home_bottom', 'sidebar');

-- CreateEnum
CREATE TYPE "BannerTag" AS ENUM ('promo', 'info', 'announcement');

-- CreateTable
CREATE TABLE "banner" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subTitle" TEXT,
    "description" TEXT,
    "bannerTag" "BannerTag",
    "alignment" TEXT NOT NULL DEFAULT 'center',
    "primaryActionText" TEXT,
    "primaryActionLink" TEXT,
    "secondaryActionText" TEXT,
    "secondaryActionLink" TEXT,
    "bannerPosition" "BannerPosition" NOT NULL DEFAULT 'home_top',
    "imageId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "image" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "altText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "image_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "banner_bannerPosition_isActive_idx" ON "banner"("bannerPosition", "isActive");

-- AddForeignKey
ALTER TABLE "banner" ADD CONSTRAINT "banner_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "image"("id") ON DELETE CASCADE ON UPDATE CASCADE;
