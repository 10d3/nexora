/*
  Warnings:

  - The `deliveryStatus` column on the `Delivery` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `duration` on the `PrescriptionItem` table. All the data in the column will be lost.
  - You are about to drop the column `frequency` on the `PrescriptionItem` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[supplierId,productId,tenantId]` on the table `SupplierProduct` will be added. If there are existing duplicate values, this will fail.
  - Made the column `projectId` on table `Task` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING', 'IN_TRANSIT', 'DELIVERED', 'FAILED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "FulfillmentStatus" ADD VALUE 'READY_FOR_PICKUP';
ALTER TYPE "FulfillmentStatus" ADD VALUE 'READY_FOR_DELIVERY';
ALTER TYPE "FulfillmentStatus" ADD VALUE 'DELIVERED';
ALTER TYPE "FulfillmentStatus" ADD VALUE 'RETURNED_TO_STOCK';
ALTER TYPE "FulfillmentStatus" ADD VALUE 'LOST';

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_projectId_fkey";

-- AlterTable
ALTER TABLE "AuditLog" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "CustomerProfile" ADD COLUMN     "customerSince" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "guestId" TEXT,
ADD COLUMN     "lastVisit" TIMESTAMP(3),
ADD COLUMN     "loyaltyPoints" INTEGER DEFAULT 0,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "preferences" JSONB,
ADD COLUMN     "tags" TEXT,
ADD COLUMN     "totalSpent" DOUBLE PRECISION DEFAULT 0;

-- AlterTable
ALTER TABLE "Delivery" DROP COLUMN "deliveryStatus",
ADD COLUMN     "deliveryStatus" "DeliveryStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "PrescriptionItem" DROP COLUMN "duration",
DROP COLUMN "frequency",
ADD COLUMN     "durationDays" INTEGER,
ADD COLUMN     "frequencyTimesPerDay" INTEGER;

-- AlterTable
ALTER TABLE "Task" ALTER COLUMN "projectId" SET NOT NULL;

-- CreateTable
CREATE TABLE "_CustomerProfileToPrescription" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CustomerProfileToPrescription_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CustomerProfileToReservation" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CustomerProfileToReservation_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CustomerProfileToPrescription_B_index" ON "_CustomerProfileToPrescription"("B");

-- CreateIndex
CREATE INDEX "_CustomerProfileToReservation_B_index" ON "_CustomerProfileToReservation"("B");

-- CreateIndex
CREATE INDEX "CustomerProfile_lastVisit_idx" ON "CustomerProfile"("lastVisit");

-- CreateIndex
CREATE INDEX "CustomerProfile_totalSpent_idx" ON "CustomerProfile"("totalSpent");

-- CreateIndex
CREATE INDEX "CustomerProfile_customerSince_idx" ON "CustomerProfile"("customerSince");

-- CreateIndex
CREATE INDEX "Delivery_deliveryStatus_idx" ON "Delivery"("deliveryStatus");

-- CreateIndex
CREATE INDEX "Order_customerProfileId_idx" ON "Order"("customerProfileId");

-- CreateIndex
CREATE INDEX "Order_completedAt_idx" ON "Order"("completedAt");

-- CreateIndex
CREATE INDEX "Order_completedBy_idx" ON "Order"("completedBy");

-- CreateIndex
CREATE UNIQUE INDEX "SupplierProduct_supplierId_productId_tenantId_key" ON "SupplierProduct"("supplierId", "productId", "tenantId");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerProfile" ADD CONSTRAINT "CustomerProfile_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CustomerProfileToPrescription" ADD CONSTRAINT "_CustomerProfileToPrescription_A_fkey" FOREIGN KEY ("A") REFERENCES "CustomerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CustomerProfileToPrescription" ADD CONSTRAINT "_CustomerProfileToPrescription_B_fkey" FOREIGN KEY ("B") REFERENCES "Prescription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CustomerProfileToReservation" ADD CONSTRAINT "_CustomerProfileToReservation_A_fkey" FOREIGN KEY ("A") REFERENCES "CustomerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CustomerProfileToReservation" ADD CONSTRAINT "_CustomerProfileToReservation_B_fkey" FOREIGN KEY ("B") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
