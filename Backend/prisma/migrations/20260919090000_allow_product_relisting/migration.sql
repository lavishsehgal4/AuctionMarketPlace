DROP INDEX "Auction_product_id_key";

CREATE UNIQUE INDEX "Auction_product_id_active_or_scheduled_key"
ON "Auction"("product_id")
WHERE "status" IN ('SCHEDULED', 'ACTIVE');

CREATE INDEX "Auction_product_id_status_idx" ON "Auction"("product_id", "status");