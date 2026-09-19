ALTER TABLE "Product" ADD COLUMN "primary_image" VARCHAR(500);
ALTER TABLE "Product" ADD COLUMN "additional_images" JSONB NOT NULL DEFAULT '[]';

UPDATE "Product"
SET
  "primary_image" = "images" ->> 0,
  "additional_images" = COALESCE("images" - 0, '[]'::jsonb);

ALTER TABLE "Product" ALTER COLUMN "primary_image" SET NOT NULL;
ALTER TABLE "Product" DROP COLUMN "images";