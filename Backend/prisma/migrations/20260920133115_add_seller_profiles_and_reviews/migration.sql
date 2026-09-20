-- CreateTable
CREATE TABLE "SellerProfile" (
    "id" UUID NOT NULL,
    "seller_id" UUID NOT NULL,
    "bio" TEXT,
    "banner_url" VARCHAR(500),
    "website_url" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SellerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SellerReview" (
    "id" UUID NOT NULL,
    "seller_id" UUID NOT NULL,
    "reviewer_id" UUID NOT NULL,
    "auction_id" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SellerReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SellerProfile_seller_id_key" ON "SellerProfile"("seller_id");

-- CreateIndex
CREATE UNIQUE INDEX "SellerReview_auction_id_key" ON "SellerReview"("auction_id");

-- CreateIndex
CREATE INDEX "SellerReview_seller_id_created_at_idx" ON "SellerReview"("seller_id", "created_at");

-- CreateIndex
CREATE INDEX "SellerReview_reviewer_id_created_at_idx" ON "SellerReview"("reviewer_id", "created_at");

-- AddForeignKey
ALTER TABLE "SellerProfile" ADD CONSTRAINT "SellerProfile_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellerReview" ADD CONSTRAINT "SellerReview_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellerReview" ADD CONSTRAINT "SellerReview_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellerReview" ADD CONSTRAINT "SellerReview_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "Auction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
