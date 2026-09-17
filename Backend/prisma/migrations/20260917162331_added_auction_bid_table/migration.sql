-- CreateEnum
CREATE TYPE "AuctionStatus" AS ENUM ('SCHEDULED', 'ACTIVE', 'ENDED', 'UNSOLD', 'CANCELLED');

-- CreateTable
CREATE TABLE "Auction" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "seller_id" UUID NOT NULL,
    "starting_price" DECIMAL(12,2) NOT NULL,
    "current_bid" DECIMAL(12,2) NOT NULL,
    "min_bid_increment" DECIMAL(12,2) NOT NULL DEFAULT 1,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "status" "AuctionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "winner_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Auction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bid" (
    "id" UUID NOT NULL,
    "auction_id" UUID NOT NULL,
    "bidder_id" UUID NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "placed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bid_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Auction_product_id_key" ON "Auction"("product_id");

-- CreateIndex
CREATE INDEX "Auction_seller_id_idx" ON "Auction"("seller_id");

-- CreateIndex
CREATE INDEX "Auction_winner_id_idx" ON "Auction"("winner_id");

-- CreateIndex
CREATE INDEX "Auction_status_start_time_idx" ON "Auction"("status", "start_time");

-- CreateIndex
CREATE INDEX "Auction_status_end_time_idx" ON "Auction"("status", "end_time");

-- CreateIndex
CREATE INDEX "Bid_auction_id_placed_at_idx" ON "Bid"("auction_id", "placed_at");

-- CreateIndex
CREATE INDEX "Bid_bidder_id_auction_id_placed_at_idx" ON "Bid"("bidder_id", "auction_id", "placed_at");

-- AddForeignKey
ALTER TABLE "Auction" ADD CONSTRAINT "Auction_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auction" ADD CONSTRAINT "Auction_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auction" ADD CONSTRAINT "Auction_winner_id_fkey" FOREIGN KEY ("winner_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "Auction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_bidder_id_fkey" FOREIGN KEY ("bidder_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
