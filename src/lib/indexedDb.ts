import { openDB, IDBPDatabase } from 'idb';
import { Product, Announcement, MediaItem, CustomerMessage, CompanySettings, CartItem, Order, ProductReview, PromoBanner } from '../types';

const DB_NAME = 'horon_mousso_permanent_db';
const DB_VERSION = 3;

let dbPromise: Promise<IDBPDatabase> | null = null;

export function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('products')) {
          db.createObjectStore('products', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('announcements')) {
          db.createObjectStore('announcements', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('media')) {
          db.createObjectStore('media', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('messages')) {
          db.createObjectStore('messages', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('cart')) {
          db.createObjectStore('cart', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('offline_orders')) {
          db.createObjectStore('offline_orders', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('orders')) {
          db.createObjectStore('orders', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('reviews')) {
          db.createObjectStore('reviews', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('hero_banners')) {
          db.createObjectStore('hero_banners', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('sync_metadata')) {
          db.createObjectStore('sync_metadata', { keyPath: 'key' });
        }
      },
    });
  }
  return dbPromise;
}

/* =========================================================
   PRODUCTS (INDEXEDDB PERMANENT LOCAL CACHE)
========================================================= */

export async function getLocalProducts(): Promise<Product[]> {
  try {
    const db = await getDB();
    const prods = await db.getAll('products');
    return prods.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.warn('IndexedDB getLocalProducts fallback:', err);
    return [];
  }
}

export async function saveLocalProducts(products: Product[]): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction('products', 'readwrite');
    // Clear and batch re-insert
    await tx.store.clear();
    for (const prod of products) {
      await tx.store.put(prod);
    }
    await tx.done;
  } catch (err) {
    console.warn('IndexedDB saveLocalProducts fallback:', err);
  }
}

export async function saveSingleLocalProduct(product: Product): Promise<void> {
  try {
    const db = await getDB();
    await db.put('products', product);
  } catch (err) {
    console.warn('IndexedDB saveSingleLocalProduct fallback:', err);
  }
}

export async function deleteSingleLocalProduct(id: string): Promise<void> {
  try {
    const db = await getDB();
    await db.delete('products', id);
  } catch (err) {
    console.warn('IndexedDB deleteSingleLocalProduct fallback:', err);
  }
}

/* =========================================================
   ANNOUNCEMENTS (INDEXEDDB PERMANENT LOCAL CACHE)
========================================================= */

export async function getLocalAnnouncements(): Promise<Announcement[]> {
  try {
    const db = await getDB();
    const items = await db.getAll('announcements');
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.warn('IndexedDB getLocalAnnouncements fallback:', err);
    return [];
  }
}

export async function saveLocalAnnouncements(announcements: Announcement[]): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction('announcements', 'readwrite');
    await tx.store.clear();
    for (const ann of announcements) {
      await tx.store.put(ann);
    }
    await tx.done;
  } catch (err) {
    console.warn('IndexedDB saveLocalAnnouncements fallback:', err);
  }
}

export async function saveSingleLocalAnnouncement(ann: Announcement): Promise<void> {
  try {
    const db = await getDB();
    await db.put('announcements', ann);
  } catch (err) {
    console.warn('IndexedDB saveSingleLocalAnnouncement fallback:', err);
  }
}

export async function deleteSingleLocalAnnouncement(id: string): Promise<void> {
  try {
    const db = await getDB();
    await db.delete('announcements', id);
  } catch (err) {
    console.warn('IndexedDB deleteSingleLocalAnnouncement fallback:', err);
  }
}

/* =========================================================
   MEDIA (INDEXEDDB PERMANENT LOCAL CACHE)
========================================================= */

export async function getLocalMedia(): Promise<MediaItem[]> {
  try {
    const db = await getDB();
    const media = await db.getAll('media');
    return media.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.warn('IndexedDB getLocalMedia fallback:', err);
    return [];
  }
}

export async function saveLocalMedia(mediaList: MediaItem[]): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction('media', 'readwrite');
    await tx.store.clear();
    for (const med of mediaList) {
      await tx.store.put(med);
    }
    await tx.done;
  } catch (err) {
    console.warn('IndexedDB saveLocalMedia fallback:', err);
  }
}

export async function saveSingleLocalMedia(media: MediaItem): Promise<void> {
  try {
    const db = await getDB();
    await db.put('media', media);
  } catch (err) {
    console.warn('IndexedDB saveSingleLocalMedia fallback:', err);
  }
}

export async function deleteSingleLocalMedia(id: string): Promise<void> {
  try {
    const db = await getDB();
    await db.delete('media', id);
  } catch (err) {
    console.warn('IndexedDB deleteSingleLocalMedia fallback:', err);
  }
}

/* =========================================================
   MESSAGES & CUSTOMER LEADS (INDEXEDDB PERMANENT LOCAL CACHE)
========================================================= */

export async function getLocalMessages(): Promise<CustomerMessage[]> {
  try {
    const db = await getDB();
    const msgs = await db.getAll('messages');
    return msgs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.warn('IndexedDB getLocalMessages fallback:', err);
    return [];
  }
}

export async function saveLocalMessages(messages: CustomerMessage[]): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction('messages', 'readwrite');
    await tx.store.clear();
    for (const msg of messages) {
      await tx.store.put(msg);
    }
    await tx.done;
  } catch (err) {
    console.warn('IndexedDB saveLocalMessages fallback:', err);
  }
}

export async function saveSingleLocalMessage(message: CustomerMessage): Promise<void> {
  try {
    const db = await getDB();
    await db.put('messages', message);
  } catch (err) {
    console.warn('IndexedDB saveSingleLocalMessage fallback:', err);
  }
}

export async function deleteSingleLocalMessage(id: string): Promise<void> {
  try {
    const db = await getDB();
    await db.delete('messages', id);
  } catch (err) {
    console.warn('IndexedDB deleteSingleLocalMessage fallback:', err);
  }
}

/* =========================================================
   SETTINGS (INDEXEDDB PERMANENT LOCAL CACHE)
========================================================= */

export async function getLocalSettings(): Promise<CompanySettings | null> {
  try {
    const db = await getDB();
    const settings = await db.get('settings', 'settings_main');
    return settings || null;
  } catch (err) {
    console.warn('IndexedDB getLocalSettings fallback:', err);
    return null;
  }
}

export async function saveLocalSettings(settings: CompanySettings): Promise<void> {
  try {
    const db = await getDB();
    await db.put('settings', { ...settings, id: 'settings_main' });
  } catch (err) {
    console.warn('IndexedDB saveLocalSettings fallback:', err);
  }
}

/* =========================================================
   CART & OFFLINE ORDERS (INDEXEDDB PERMANENT STORAGE)
========================================================= */

export async function getLocalCart(): Promise<CartItem[]> {
  try {
    const db = await getDB();
    return await db.getAll('cart');
  } catch (err) {
    console.warn('IndexedDB getLocalCart fallback:', err);
    return [];
  }
}

export async function saveLocalCart(cartItems: CartItem[]): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction('cart', 'readwrite');
    await tx.store.clear();
    for (const item of cartItems) {
      await tx.store.put(item);
    }
    await tx.done;
  } catch (err) {
    console.warn('IndexedDB saveLocalCart fallback:', err);
  }
}

export async function saveOfflineOrder(order: Record<string, unknown>): Promise<void> {
  try {
    const db = await getDB();
    await db.put('offline_orders', order);
  } catch (err) {
    console.warn('IndexedDB saveOfflineOrder fallback:', err);
  }
}

export async function getOfflineOrders(): Promise<Record<string, unknown>[]> {
  try {
    const db = await getDB();
    return await db.getAll('offline_orders');
  } catch (err) {
    console.warn('IndexedDB getOfflineOrders fallback:', err);
    return [];
  }
}

/* =========================================================
   ORDERS & REVIEWS (INDEXEDDB PERMANENT STORAGE)
========================================================= */

export async function getLocalOrders(): Promise<Order[]> {
  try {
    const db = await getDB();
    const orders = await db.getAll('orders');
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.warn('IndexedDB getLocalOrders fallback:', err);
    return [];
  }
}

export async function saveLocalOrders(orders: Order[]): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction('orders', 'readwrite');
    await tx.store.clear();
    for (const order of orders) {
      await tx.store.put(order);
    }
    await tx.done;
  } catch (err) {
    console.warn('IndexedDB saveLocalOrders fallback:', err);
  }
}

export async function saveSingleLocalOrder(order: Order): Promise<void> {
  try {
    const db = await getDB();
    await db.put('orders', order);
  } catch (err) {
    console.warn('IndexedDB saveSingleLocalOrder fallback:', err);
  }
}

export async function deleteSingleLocalOrder(id: string): Promise<void> {
  try {
    const db = await getDB();
    await db.delete('orders', id);
  } catch (err) {
    console.warn('IndexedDB deleteSingleLocalOrder fallback:', err);
  }
}

export async function getLocalReviews(): Promise<ProductReview[]> {
  try {
    const db = await getDB();
    const revs = await db.getAll('reviews');
    return revs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.warn('IndexedDB getLocalReviews fallback:', err);
    return [];
  }
}

export async function saveLocalReviews(reviews: ProductReview[]): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction('reviews', 'readwrite');
    await tx.store.clear();
    for (const rev of reviews) {
      await tx.store.put(rev);
    }
    await tx.done;
  } catch (err) {
    console.warn('IndexedDB saveLocalReviews fallback:', err);
  }
}

export async function deleteSingleLocalReview(id: string): Promise<void> {
  try {
    const db = await getDB();
    await db.delete('reviews', id);
  } catch (err) {
    console.warn('IndexedDB deleteSingleLocalReview fallback:', err);
  }
}

/* =========================================================
   HERO BANNERS (INDEXEDDB PERMANENT LOCAL CACHE)
========================================================= */

export async function getLocalHeroBanners(): Promise<PromoBanner[]> {
  try {
    const db = await getDB();
    const banners = await db.getAll('hero_banners');
    return banners.sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch (err) {
    console.warn('IndexedDB getLocalHeroBanners fallback:', err);
    return [];
  }
}

export async function saveLocalHeroBanners(banners: PromoBanner[]): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction('hero_banners', 'readwrite');
    await tx.store.clear();
    for (const banner of banners) {
      await tx.store.put(banner);
    }
    await tx.done;
  } catch (err) {
    console.warn('IndexedDB saveLocalHeroBanners fallback:', err);
  }
}

export async function saveSingleLocalHeroBanner(banner: PromoBanner): Promise<void> {
  try {
    const db = await getDB();
    await db.put('hero_banners', banner);
  } catch (err) {
    console.warn('IndexedDB saveSingleLocalHeroBanner fallback:', err);
  }
}

export async function deleteSingleLocalHeroBanner(id: string): Promise<void> {
  try {
    const db = await getDB();
    await db.delete('hero_banners', id);
  } catch (err) {
    console.warn('IndexedDB deleteSingleLocalHeroBanner fallback:', err);
  }
}

/* =========================================================
   STORAGE STATS HELPER
========================================================= */

export async function getIndexedDBStats(): Promise<{
  products: number;
  announcements: number;
  media: number;
  messages: number;
  cartItems: number;
  isAvailable: boolean;
}> {
  try {
    const db = await getDB();
    const [pCount, aCount, mCount, msgCount, cCount] = await Promise.all([
      db.count('products'),
      db.count('announcements'),
      db.count('media'),
      db.count('messages'),
      db.count('cart'),
    ]);
    return {
      products: pCount,
      announcements: aCount,
      media: mCount,
      messages: msgCount,
      cartItems: cCount,
      isAvailable: true,
    };
  } catch {
    return {
      products: 0,
      announcements: 0,
      media: 0,
      messages: 0,
      cartItems: 0,
      isAvailable: false,
    };
  }
}
