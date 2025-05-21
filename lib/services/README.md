# Nexora Database Service

This directory contains the implementation of an offline-first database service using Dexie.js for the Nexora application. The database service mirrors the Prisma schema models to provide offline data access and synchronization capabilities.

## Files

- `db.service.ts` - Core database implementation using Dexie.js with tables that mirror Prisma models
- `db-helper.service.ts` - Helper service providing a simplified API and synchronization capabilities
- `index.ts` - Exports for easy access to the database services

## Features

- **Offline-First Architecture**: Store and access data locally even when offline
- **Prisma Schema Mirroring**: Database tables match the Prisma models structure
- **Automatic Synchronization**: Sync with server when online connection is restored
- **Comprehensive Model Support**: Includes all key business models (User, Tenant, CustomerProfile, Project, Task, Asset, etc.)
- **Efficient Indexing**: Optimized for query performance with appropriate indexes

## Usage

```typescript
// Import the database helper service
import { dbHelper } from '@/lib/services';

// Example: Get all projects for a tenant
async function getProjects(tenantId: string) {
  const projects = await dbHelper.getProjectsByTenant(tenantId);
  return projects;
}

// Example: Save a new customer profile
async function saveCustomer(customerData) {
  const id = await dbHelper.saveCustomerProfile(customerData);
  return id;
}

// Example: Initialize database from server for a tenant
async function initializeData(tenantId: string) {
  await dbHelper.initializeFromServer(tenantId);
}
```

## Models Supported

- User
- Tenant
- CustomerProfile
- Project
- Task
- Asset
- Order
- OrderItem
- Category
- Product

Each model includes appropriate indexes for efficient querying and relationships between models are maintained through reference fields.

## Synchronization

The database service includes mechanisms for:

1. Detecting online/offline status changes
2. Automatically syncing changes when coming back online
3. Tracking changes made while offline for later synchronization

## Implementation Notes

- The service uses Dexie.js, a wrapper around IndexedDB for better developer experience
- The database schema version is managed through Dexie's versioning system
- The helper service provides a singleton pattern for consistent access throughout the application