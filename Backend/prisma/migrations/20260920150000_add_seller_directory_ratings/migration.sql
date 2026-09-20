-- AlterTable
ALTER TABLE "SellerProfile"
ADD COLUMN "rating_average" DECIMAL(3,2) NOT NULL DEFAULT 0,
ADD COLUMN "rating_count" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "SellerProfile_rating_average_rating_count_idx"
ON "SellerProfile"("rating_average" DESC, "rating_count" DESC);