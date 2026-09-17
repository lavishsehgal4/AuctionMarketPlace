-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('BIDDER', 'SELLER');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "account_type" "AccountType";
