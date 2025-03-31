-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'VIEW';
ALTER TYPE "AuditAction" ADD VALUE 'LOGIN';
ALTER TYPE "AuditAction" ADD VALUE 'LOGOUT';
ALTER TYPE "AuditAction" ADD VALUE 'EXPORT';
ALTER TYPE "AuditAction" ADD VALUE 'IMPORT';
ALTER TYPE "AuditAction" ADD VALUE 'PRINT';
ALTER TYPE "AuditAction" ADD VALUE 'EMAIL';
ALTER TYPE "AuditAction" ADD VALUE 'DOWNLOAD';
ALTER TYPE "AuditAction" ADD VALUE 'UPLOAD';
ALTER TYPE "AuditAction" ADD VALUE 'APPROVE';
ALTER TYPE "AuditAction" ADD VALUE 'REJECT';
ALTER TYPE "AuditAction" ADD VALUE 'CANCEL';
ALTER TYPE "AuditAction" ADD VALUE 'COMPLETE';
ALTER TYPE "AuditAction" ADD VALUE 'ASSIGN';
ALTER TYPE "AuditAction" ADD VALUE 'TRANSFER';
ALTER TYPE "AuditAction" ADD VALUE 'PAYMENT';
ALTER TYPE "AuditAction" ADD VALUE 'REFUND';
ALTER TYPE "AuditAction" ADD VALUE 'ARCHIVE';
ALTER TYPE "AuditAction" ADD VALUE 'UNARCHIVE';
ALTER TYPE "AuditAction" ADD VALUE 'LOCK';
ALTER TYPE "AuditAction" ADD VALUE 'UNLOCK';
ALTER TYPE "AuditAction" ADD VALUE 'ENABLE';
ALTER TYPE "AuditAction" ADD VALUE 'DISABLE';
ALTER TYPE "AuditAction" ADD VALUE 'REGISTER';
ALTER TYPE "AuditAction" ADD VALUE 'DEREGISTER';
ALTER TYPE "AuditAction" ADD VALUE 'SUBSCRIBE';
ALTER TYPE "AuditAction" ADD VALUE 'UNSUBSCRIBE';
ALTER TYPE "AuditAction" ADD VALUE 'VERIFY';
ALTER TYPE "AuditAction" ADD VALUE 'RESET_PASSWORD';
ALTER TYPE "AuditAction" ADD VALUE 'CHANGE_ROLE';
ALTER TYPE "AuditAction" ADD VALUE 'CHANGE_PERMISSION';
ALTER TYPE "AuditAction" ADD VALUE 'CHANGE_STATUS';
ALTER TYPE "AuditAction" ADD VALUE 'GENERATE_REPORT';
ALTER TYPE "AuditAction" ADD VALUE 'SCHEDULE';
ALTER TYPE "AuditAction" ADD VALUE 'RESCHEDULE';

-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "errorMessage" TEXT,
ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "status" TEXT,
ADD COLUMN     "userAgent" TEXT;

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_modelName_idx" ON "AuditLog"("modelName");

-- CreateIndex
CREATE INDEX "AuditLog_recordId_idx" ON "AuditLog"("recordId");

-- CreateIndex
CREATE INDEX "AuditLog_tenantId_idx" ON "AuditLog"("tenantId");

-- CreateIndex
CREATE INDEX "AuditLog_createdById_idx" ON "AuditLog"("createdById");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_status_idx" ON "AuditLog"("status");
