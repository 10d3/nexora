/*
  Warnings:

  - You are about to drop the column `doctorContact` on the `Prescription` table. All the data in the column will be lost.
  - You are about to drop the column `doctorName` on the `Prescription` table. All the data in the column will be lost.
  - You are about to drop the column `expiryDate` on the `Prescription` table. All the data in the column will be lost.
  - You are about to drop the column `issueDate` on the `Prescription` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Prescription` table. All the data in the column will be lost.
  - You are about to drop the column `patientEmail` on the `Prescription` table. All the data in the column will be lost.
  - You are about to drop the column `patientName` on the `Prescription` table. All the data in the column will be lost.
  - You are about to drop the column `patientPhone` on the `Prescription` table. All the data in the column will be lost.
  - Added the required column `dosage` to the `Prescription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duration` to the `Prescription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `medicationId` to the `Prescription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `patientId` to the `Prescription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prescribedById` to the `Prescription` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "HousekeepingStatus" AS ENUM ('CLEAN', 'DIRTY', 'IN_PROGRESS', 'INSPECTED', 'MAINTENANCE');

-- DropIndex
DROP INDEX "AuditLog_action_idx";

-- DropIndex
DROP INDEX "AuditLog_createdAt_idx";

-- DropIndex
DROP INDEX "AuditLog_createdById_idx";

-- DropIndex
DROP INDEX "AuditLog_modelName_recordId_idx";

-- DropIndex
DROP INDEX "AuditLog_tenantId_idx";

-- DropIndex
DROP INDEX "AuditLog_updatedById_idx";

-- DropIndex
DROP INDEX "Prescription_issueDate_expiryDate_idx";

-- DropIndex
DROP INDEX "Prescription_patientName_idx";

-- DropIndex
DROP INDEX "Prescription_tenantId_idx";

-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Prescription" DROP COLUMN "doctorContact",
DROP COLUMN "doctorName",
DROP COLUMN "expiryDate",
DROP COLUMN "issueDate",
DROP COLUMN "notes",
DROP COLUMN "patientEmail",
DROP COLUMN "patientName",
DROP COLUMN "patientPhone",
ADD COLUMN     "dosage" TEXT NOT NULL,
ADD COLUMN     "duration" INTEGER NOT NULL,
ADD COLUMN     "instructions" TEXT,
ADD COLUMN     "medicationId" TEXT NOT NULL,
ADD COLUMN     "patientId" TEXT NOT NULL,
ADD COLUMN     "prescribedById" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "HousekeepingLog" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "status" "HousekeepingStatus" NOT NULL DEFAULT 'CLEAN',
    "notes" TEXT,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HousekeepingLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "HousekeepingLog" ADD CONSTRAINT "HousekeepingLog_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HousekeepingLog" ADD CONSTRAINT "HousekeepingLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "Medication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_prescribedById_fkey" FOREIGN KEY ("prescribedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
