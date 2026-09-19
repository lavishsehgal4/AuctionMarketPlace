ALTER TABLE "Auction" ADD COLUMN "bid_count" INTEGER NOT NULL DEFAULT 0;

UPDATE "Auction" AS auction
SET "bid_count" = bid_totals."count"
FROM (
  SELECT "auction_id", COUNT(*)::INTEGER AS "count"
  FROM "Bid"
  GROUP BY "auction_id"
) AS bid_totals
WHERE bid_totals."auction_id" = auction."id";