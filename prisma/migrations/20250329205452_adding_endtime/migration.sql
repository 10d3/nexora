-- DropIndex
DROP INDEX "Reservation_reservationTime_idx";

-- DropIndex
DROP INDEX "Reservation_status_idx";

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "endTime" TIMESTAMP(3),
ALTER COLUMN "status" SET DEFAULT 'PENDING';
