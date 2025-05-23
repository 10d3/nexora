/*
  Warnings:

  - You are about to drop the column `appointmentId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `bookingId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `reservationId` on the `Order` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_appointmentId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_reservationId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_productId_fkey";

-- DropIndex
DROP INDEX "Order_appointmentId_idx";

-- DropIndex
DROP INDEX "Order_bookingId_idx";

-- DropIndex
DROP INDEX "Order_reservationId_idx";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "appointmentId",
DROP COLUMN "bookingId",
DROP COLUMN "reservationId";

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "appointmentId" TEXT,
ADD COLUMN     "bookingId" TEXT,
ADD COLUMN     "reservationId" TEXT,
ALTER COLUMN "productId" DROP NOT NULL,
ALTER COLUMN "orderId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "OrderItem_reservationId_idx" ON "OrderItem"("reservationId");

-- CreateIndex
CREATE INDEX "OrderItem_bookingId_idx" ON "OrderItem"("bookingId");

-- CreateIndex
CREATE INDEX "OrderItem_appointmentId_idx" ON "OrderItem"("appointmentId");

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
