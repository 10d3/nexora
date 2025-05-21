# Nexora Sync Service

## Overview

The Sync Service provides offline-first functionality for server actions in the Nexora application. It handles:

- Executing actions against the local database when offline
- Queuing actions for later synchronization when online
- Executing actions against the server when online
- Updating the local database with server responses
- Automatic synchronization of queued actions when connectivity is restored

## Implementation

The implementation follows a simple pattern that wraps server actions with a sync service that handles online/offline routing:

```typescript
export async function someAction(params) { 
  return syncService.executeAction( 
    'someAction', 
    params, 
    async (params) => { 
      // Your existing server action code 
    } 
  ); 
} 
```

## Key Features

- **Automatic online/offline detection**: The service detects network status changes and adapts accordingly
- **Action queuing**: When offline, actions are stored in IndexedDB for later execution
- **Transparent API**: Components can use the same API regardless of online status
- **Type safety**: Full TypeScript support for action parameters and return values
- **Conflict resolution**: Simple last-write-wins strategy for data synchronization
- **Error handling**: Proper error handling and retry mechanisms

## Usage

### Wrapping Server Actions

To add offline support to a server action, wrap it with the sync service:

```typescript
// Original server action
export async function getProducts(businessType: string, tenantId: string) {
  try {
    const products = await prisma.product.findMany({
      // query parameters
    });
    return { products };
  } catch (error) {
    return { error: "Failed to fetch products" };
  }
}

// Wrapped with sync service for offline support
export async function getProducts(businessType: string, tenantId: string) {
  return syncService.executeAction(
    'getProducts',
    { businessType, tenantId },
    async (params) => {
      try {
        const products = await prisma.product.findMany({
          // query parameters using params
        });
        return { products };
      } catch (error) {
        return { error: "Failed to fetch products" };
      }
    }
  );
}
```

### Using Wrapped Actions in Components

Components can use the wrapped actions exactly as they would use regular server actions:

```typescript
import { getProducts } from '@/lib/actions/action.wrapper';

// In a component
const { products, error } = await getProducts('restaurant', tenantId);
```

## Synchronization Process

When the application goes offline:

1. Actions are executed against the local IndexedDB database
2. Actions are queued for later synchronization

When the application comes back online:

1. Queued actions are executed against the server
2. The local database is updated with server responses
3. Conflicts are resolved using a last-write-wins strategy

## Database Schema

The sync service uses a dedicated table in IndexedDB to store queued actions:

```typescript
export interface IQueuedAction {
  id: string;      // Unique identifier for the action
  name: string;    // Name of the action (e.g., 'getProducts')
  params: any;     // Parameters passed to the action
  timestamp: Date; // When the action was queued
  retries: number; // Number of retry attempts
}
```

## Implementation Notes

- The service uses Dexie.js for IndexedDB access
- Network status is detected using the browser's `navigator.onLine` property
- The service is implemented as a singleton for consistent state management
- Actions are queued with a unique ID to prevent duplicates