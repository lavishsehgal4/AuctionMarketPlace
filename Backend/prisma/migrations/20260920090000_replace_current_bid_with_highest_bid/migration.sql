ALTER TABLE "Auction" ADD COLUMN IF NOT EXISTS "highest_bid_id" UUID;

WITH ranked_bids AS (
  SELECT DISTINCT ON ("auction_id") "auction_id", "id"
  FROM "Bid"
  ORDER BY "auction_id", "amount" DESC, "placed_at" ASC
)
UPDATE "Auction" AS auction
SET "highest_bid_id" = ranked_bids."id"
FROM ranked_bids
WHERE ranked_bids."auction_id" = auction."id";

ALTER TABLE "Auction" DROP COLUMN "current_bid";

CREATE UNIQUE INDEX "Auction_highest_bid_id_key" ON "Auction"("highest_bid_id");
CREATE INDEX "Bid_auction_id_amount_idx" ON "Bid"("auction_id", "amount");

ALTER TABLE "Auction"
ADD CONSTRAINT "Auction_highest_bid_id_fkey"
FOREIGN KEY ("highest_bid_id") REFERENCES "Bid"("id")
ON DELETE SET NULL ON UPDATE CASCADE;