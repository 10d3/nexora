/*
  Warnings:

  - You are about to drop the column `appointmentId` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `bookingId` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `reservationId` on the `OrderItem` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_appointmentId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_reservationId_fkey";

-- DropIndex
DROP INDEX "OrderItem_appointmentId_idx";

-- DropIndex
DROP INDEX "OrderItem_bookingId_idx";

-- DropIndex
DROP INDEX "OrderItem_reservationId_idx";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "appointmentId" TEXT,
ADD COLUMN     "bookingId" TEXT,
ADD COLUMN     "reservationId" TEXT;

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "appointmentId",
DROP COLUMN "bookingId",
DROP COLUMN "reservationId",
ADD COLUMN     "menuId" TEXT,
ADD COLUMN     "roomId" TEXT;

-- CreateIndex
CREATE INDEX "Order_reservationId_idx" ON "Order"("reservationId");

-- CreateIndex
CREATE INDEX "Order_bookingId_idx" ON "Order"("bookingId");

-- CreateIndex
CREATE INDEX "Order_appointmentId_idx" ON "Order"("appointmentId");

-- CreateIndex
CREATE INDEX "OrderItem_roomId_idx" ON "OrderItem"("roomId");

-- CreateIndex
CREATE INDEX "OrderItem_menuId_idx" ON "OrderItem"("menuId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "MenuItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;
