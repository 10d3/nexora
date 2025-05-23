/*
  Warnings:

  - You are about to drop the column `roomId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `tableId` on the `Order` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_roomId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_tableId_fkey";

-- DropIndex
DROP INDEX "Order_roomId_idx";

-- DropIndex
DROP INDEX "Order_tableId_idx";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "roomId",
DROP COLUMN "tableId";
