/*
  Warnings:

  - You are about to drop the column `userId` on the `CreditAccount` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[customerProfileId]` on the table `CreditAccount` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `customerProfileId` to the `CreditAccount` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'PARTIALLY_PAID', 'FAILED', 'REFUNDED', 'CANCELLED', 'OVERDUE');

-- DropForeignKey
ALTER TABLE "CreditAccount" DROP CONSTRAINT "CreditAccount_userId_fkey";

-- DropForeignKey
ALTER TABLE "CustomerProfile" DROP CONSTRAINT "CustomerProfile_creditAccountId_fkey";

-- DropIndex
DROP INDEX "CreditAccount_userId_idx";

-- DropIndex
DROP INDEX "CreditAccount_userId_key";

-- AlterTable
ALTER TABLE "CreditAccount" DROP COLUMN "userId",
ADD COLUMN     "customerProfileId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE UNIQUE INDEX "CreditAccount_customerProfileId_key" ON "CreditAccount"("customerProfileId");

-- CreateIndex
CREATE INDEX "CreditAccount_customerProfileId_idx" ON "CreditAccount"("customerProfileId");

-- AddForeignKey
ALTER TABLE "CreditAccount" ADD CONSTRAINT "CreditAccount_customerProfileId_fkey" FOREIGN KEY ("customerProfileId") REFERENCES "CustomerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
