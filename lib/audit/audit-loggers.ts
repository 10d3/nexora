/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { AuditAction } from "@prisma/client";
import { auth } from "../auth";

export type AuditLogParams = {
  action: AuditAction;
  modelName: string;
  recordId?: string;
  oldData?: Record<string, any>;
  newData?: Record<string, any>;
  metadata?: Record<string, any>;
  status?: "success" | "failure";
  errorMessage?: string;
  duration?: number;
};

/**
 * Logs an audit entry for server actions
 */
export async function logAudit({
  action,
  modelName,
  recordId = "",
  oldData,
  newData,
  metadata,
  status = "success",
  errorMessage,
  duration,
}: AuditLogParams) {
  try {
    const startTime = Date.now();
    const session = await auth();
    const userId = session?.user?.id;
    const tenantId = session?.user?.tenantId || metadata?.tenantId;

    if (!tenantId) {
      console.error("Audit log error: No tenant ID provided");
      return;
    }

    // Get IP and user agent if available
    const headersList = await headers();
    const ipAddress =
      headersList.get("x-forwarded-for") || headersList.get("x-real-ip");
    const userAgent = headersList.get("user-agent");

    // Calculate duration if not provided
    const actualDuration = duration || Date.now() - startTime;

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        action,
        modelName,
        recordId,
        oldData: oldData ? (oldData as any) : undefined,
        newData: newData ? (newData as any) : undefined,
        metadata: metadata ? (metadata as any) : undefined,
        ipAddress: ipAddress || undefined,
        userAgent: userAgent || undefined,
        status,
        errorMessage: errorMessage || undefined,
        duration: actualDuration,
        createdById: userId || undefined,
        updatedById: userId || undefined,
        tenantId: tenantId as string,
      },
    });
  } catch (auditError) {
    // Log to console but don't throw - we don't want audit failures to break functionality
    console.error("Failed to create audit log:", auditError);
  }
}

/**
 * Higher-order function to wrap server actions with audit logging
 */
export async function withAudit<T, Args extends any[]>(
  actionFn: (...args: Args) => Promise<T>,
  options: {
    action: AuditAction;
    modelName: string;
    getRecordId?: (result: T, ...args: Args) => string | undefined;
    getOldData?: (result: T, ...args: Args) => Record<string, any> | undefined;
    getNewData?: (result: T, ...args: Args) => Record<string, any> | undefined;
    getMetadata?: (result: T, ...args: Args) => Record<string, any> | undefined;
    getTenantId?: (...args: Args) => string | undefined;
  }
) {
  return async (...args: Args): Promise<T> => {
    const startTime = Date.now();
    let result: T;

    try {
      // Execute the original function
      result = await actionFn(...args);

      // Extract data for audit log
      const recordId = options.getRecordId
        ? options.getRecordId(result, ...args)
        : undefined;
      const oldData = options.getOldData
        ? options.getOldData(result, ...args)
        : undefined;
      const newData = options.getNewData
        ? options.getNewData(result, ...args)
        : undefined;
      const metadata = options.getMetadata
        ? options.getMetadata(result, ...args)
        : undefined;
      const tenantId = options.getTenantId
        ? options.getTenantId(...args)
        : undefined;

      // Calculate duration
      const duration = Date.now() - startTime;

      // Log successful action
      await logAudit({
        action: options.action,
        modelName: options.modelName,
        recordId: recordId,
        oldData,
        newData,
        metadata: { ...metadata, tenantId },
        status: "success",
        duration,
      });

      return result;
    } catch (error) {
      // Calculate duration
      const duration = Date.now() - startTime;

      // Log failed action
      await logAudit({
        action: options.action,
        modelName: options.modelName,
        metadata: {
          args: JSON.stringify(args),
          tenantId: options.getTenantId
            ? options.getTenantId(...args)
            : undefined,
        },
        status: "failure",
        errorMessage: error instanceof Error ? error.message : String(error),
        duration,
      });

      // Re-throw the error
      throw error;
    }
  };
}