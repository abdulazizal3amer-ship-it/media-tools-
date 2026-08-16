-- CreateEnum
CREATE TYPE "DiscountSource" AS ENUM ('MOCK', 'EXTERNAL_SYSTEM');

-- CreateEnum
CREATE TYPE "CampaignObjective" AS ENUM ('AWARENESS', 'PROMOTE_DISCOUNT', 'STORE_VISITS', 'ONLINE_VISITS');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'PENDING_PAYMENT', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'REJECTED', 'FAILED');

-- CreateEnum
CREATE TYPE "CreativeSource" AS ENUM ('AI', 'MERCHANT_UPLOAD');

-- CreateEnum
CREATE TYPE "MarketingChannel" AS ENUM ('INSTAGRAM', 'FACEBOOK', 'GOOGLE', 'TIKTOK', 'SNAPCHAT', 'WHATSAPP', 'EMAIL');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED');

-- CreateEnum
CREATE TYPE "ConnectionStatus" AS ENUM ('NOT_CONNECTED', 'CONNECTED', 'ERROR', 'EXPIRED');

-- CreateEnum
CREATE TYPE "LaunchTaskStatus" AS ENUM ('PENDING', 'RUNNING', 'DONE', 'FAILED');

-- CreateTable
CREATE TABLE "Merchant" (
    "id" TEXT NOT NULL,
    "crNumber" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Merchant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Branch" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "district" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Discount" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "products" TEXT[],
    "discountPercent" INTEGER NOT NULL,
    "priceBefore" DECIMAL(10,2) NOT NULL,
    "priceAfter" DECIMAL(10,2) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "branchNames" TEXT[],
    "city" TEXT NOT NULL,
    "source" "DiscountSource" NOT NULL DEFAULT 'MOCK',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Discount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "discountId" TEXT,
    "objective" "CampaignObjective" NOT NULL DEFAULT 'PROMOTE_DISCOUNT',
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "packageCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "launchedAt" TIMESTAMP(3),
    "elapsedSeconds" INTEGER,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreativeVariant" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "source" "CreativeSource" NOT NULL DEFAULT 'AI',
    "tag" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "selected" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreativeVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AudienceTargeting" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "radiusKm" INTEGER NOT NULL DEFAULT 5,
    "ageRanges" TEXT[],
    "gender" TEXT NOT NULL DEFAULT 'all',
    "interests" TEXT[],
    "useOwnCustomerBase" BOOLEAN NOT NULL DEFAULT false,
    "baseChannels" JSONB,

    CONSTRAINT "AudienceTargeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketingPackage" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "mediaSpend" DECIMAL(10,2) NOT NULL,
    "platformFee" DECIMAL(10,2) NOT NULL,
    "description" TEXT NOT NULL,
    "reachMin" INTEGER NOT NULL,
    "reachMax" INTEGER NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "channels" TEXT[],
    "recommended" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MarketingPackage_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "CampaignChannelAllocation" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "channel" "MarketingChannel" NOT NULL,
    "sharePercent" INTEGER NOT NULL,
    "budgetAmount" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "CampaignChannelAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "method" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "provider" TEXT,
    "providerRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChannelConnection" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "provider" "MarketingChannel" NOT NULL,
    "status" "ConnectionStatus" NOT NULL DEFAULT 'NOT_CONNECTED',
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "externalAccountId" TEXT,
    "externalAccountName" TEXT,
    "pageId" TEXT,
    "instagramActorId" TEXT,
    "connectedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "ChannelConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LaunchTask" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "status" "LaunchTaskStatus" NOT NULL DEFAULT 'PENDING',
    "sortOrder" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "LaunchTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerformanceMetric" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "channel" "MarketingChannel" NOT NULL,
    "reach" INTEGER NOT NULL DEFAULT 0,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "engagement" INTEGER NOT NULL DEFAULT 0,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PerformanceMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLogEntry" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLogEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_crNumber_key" ON "Merchant"("crNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_phone_key" ON "Merchant"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Discount_externalId_key" ON "Discount"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "AudienceTargeting_campaignId_key" ON "AudienceTargeting"("campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_campaignId_key" ON "Payment"("campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "ChannelConnection_merchantId_provider_key" ON "ChannelConnection"("merchantId", "provider");

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Discount" ADD CONSTRAINT "Discount_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "Discount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_packageCode_fkey" FOREIGN KEY ("packageCode") REFERENCES "MarketingPackage"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreativeVariant" ADD CONSTRAINT "CreativeVariant_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudienceTargeting" ADD CONSTRAINT "AudienceTargeting_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignChannelAllocation" ADD CONSTRAINT "CampaignChannelAllocation_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelConnection" ADD CONSTRAINT "ChannelConnection_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaunchTask" ADD CONSTRAINT "LaunchTask_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceMetric" ADD CONSTRAINT "PerformanceMetric_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLogEntry" ADD CONSTRAINT "ActivityLogEntry_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
