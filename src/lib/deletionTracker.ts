/**
 * Permanent Deletion Tracker for Horon Mousso
 * Guarantees that any item (product, announcement, media, message, order, review)
 * deleted by the user stays permanently deleted across all reboots, reloads,
 * offline caches, and cloud sync events.
 */

const STORAGE_KEY = 'horon_deleted_ids';
const memoryDeletedIds = new Set<string>();

// Initialize from localStorage immediately
if (typeof window !== 'undefined') {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach(id => {
          if (typeof id === 'string' && id.trim()) {
            memoryDeletedIds.add(id.trim());
          }
        });
      }
    }
  } catch (e) {
    console.warn('Failed to parse deleted IDs from localStorage:', e);
  }
}

const listeners = new Set<(deletedIds: string[]) => void>();

export function onDeletedIdsChange(callback: (deletedIds: string[]) => void): () => void {
  listeners.add(callback);
  callback(Array.from(memoryDeletedIds));
  return () => {
    listeners.delete(callback);
  };
}

function notifyListeners() {
  const list = Array.from(memoryDeletedIds);
  listeners.forEach(cb => {
    try { cb(list); } catch {}
  });
}

/**
 * Sync deleted IDs from Cloud Firestore or SSE across devices
 */
export function syncDeletedIdsFromCloud(ids: string[]): boolean {
  if (!Array.isArray(ids)) return false;
  let changed = false;
  ids.forEach(id => {
    if (typeof id === 'string' && id.trim() && !memoryDeletedIds.has(id.trim())) {
      memoryDeletedIds.add(id.trim());
      changed = true;
    }
  });
  if (changed) {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(memoryDeletedIds)));
      } catch {}
    }
    notifyListeners();
  }
  return changed;
}

/**
 * Check if an ID has been deleted
 */
export function isIdDeleted(id: string | undefined | null): boolean {
  if (!id) return false;
  return memoryDeletedIds.has(id);
}

/**
 * Filter an array of items to remove any that have been marked as deleted
 */
export function filterDeleted<T extends { id?: string }>(items: T[]): T[] {
  if (!Array.isArray(items)) return [];
  return items.filter(item => item && item.id && !memoryDeletedIds.has(item.id));
}

/**
 * Get all deleted IDs as an array
 */
export function getDeletedIds(): string[] {
  return Array.from(memoryDeletedIds);
}

/**
 * Mark an ID as permanently deleted across all storage layers
 */
export async function markIdAsDeleted(id: string): Promise<void> {
  if (!id || typeof id !== 'string') return;
  const cleanId = id.trim();
  if (!cleanId) return;

  memoryDeletedIds.add(cleanId);
  notifyListeners();

  // 1. Save to localStorage
  if (typeof window !== 'undefined') {
    try {
      const arr = Array.from(memoryDeletedIds);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    } catch (e) {
      console.warn('Failed to save deleted ID to localStorage:', e);
    }
  }

  // 2. Sync to Server
  try {
    await fetch('/api/deleted-ids', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: cleanId })
    });
  } catch {
    // offline or server unavailable, local persistence is maintained
  }
}

/**
 * Initialize and sync deleted IDs from server and local storage
 */
export async function initDeletionTracker(): Promise<void> {
  // Sync from server if available
  try {
    const res = await fetch('/api/deleted-ids');
    if (res.ok) {
      const serverIds = await res.json();
      if (Array.isArray(serverIds)) {
        serverIds.forEach(id => {
          if (typeof id === 'string' && id.trim()) {
            memoryDeletedIds.add(id.trim());
          }
        });
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(memoryDeletedIds)));
        }
      }
    }
  } catch {
    // server offline
  }
}

/**
 * Clear deletion tracker (only used when explicitly resetting demo)
 */
export function clearDeletedIds(): void {
  memoryDeletedIds.clear();
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }
}
