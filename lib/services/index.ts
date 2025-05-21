/**
 * Database Services Index
 *
 * This file exports the database services for offline-first functionality
 * using Dexie.js to mirror the Prisma schema models.
 */

// Export the database service and its types
export * from "./db.service";

// Export the database helper service for simplified API access
export { dbHelper, DbHelperService } from "./db-helper.service";

// Export the sync service for offline-first server actions
export { syncService, SyncService } from "./sync.service";

// Default export for convenience
import db from "./db.service";
export default db;
