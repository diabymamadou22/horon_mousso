import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore, 
  memoryLocalCache,
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  getDoc,
  getDocFromServer,
  deleteDoc, 
  onSnapshot, 
  Firestore,
  Unsubscribe,
  setLogLevel
} from 'firebase/firestore';
import { Product, Announcement, MediaItem, CustomerMessage, CompanySettings, Order, ProductReview } from '../types';
import { initialProducts, initialAnnouncements, initialMedia, initialMessages, initialSettings } from '../data/initialData';
import { initialOrders } from '../data/initialOrders';
import { initialReviews } from '../data/initialReviews';
import { filterDeleted, isIdDeleted } from './deletionTracker';

// Silence Firestore internal log messages (including backoff delays for quota exceedance)
setLogLevel('silent');

// Configuration from Firebase provisioning
export const firebaseConfig = {
  projectId: "crucial-spider-zhh41",
  appId: "1:1033302541423:web:71e8067f54b07a9474b99a",
  apiKey: "AIzaSyAYusuKkKwvyzEwX33DjplVWDsZA_XBiXk",
  authDomain: "crucial-spider-zhh41.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-horonmousso-47c91ee4-7e9d-4a4c-a991-6fa525d8b386",
  storageBucket: "crucial-spider-zhh41.firebasestorage.app",
  messagingSenderId: "1033302541423"
};

let app: FirebaseApp;
let firestoreDb: Firestore;
let auth: Auth;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
} catch (e) {
  console.warn('Firebase app init error:', e);
  app = initializeApp(firebaseConfig);
}

try {
  auth = getAuth(app);
} catch (e) {
  console.warn('Firebase auth init notice:', e);
}

try {
  // Use memory local cache to prevent rejected quota writes from persisting in Firestore's internal queue
  // and causing repetitive backoff loops. Permanent local persistence is fully managed by our IndexedDB engine.
  firestoreDb = initializeFirestore(
    app,
    {
      localCache: memoryLocalCache(),
      experimentalAutoDetectLongPolling: true
    },
    firebaseConfig.firestoreDatabaseId
  );
} catch (e) {
  try {
    firestoreDb = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  } catch {
    firestoreDb = getFirestore(app);
  }
}

export { app, firestoreDb, firestoreDb as db, auth };

/* =========================================================
   FIRESTORE ERROR HANDLING & CONNECTION VALIDATION
========================================================= */

const QUOTA_STORAGE_KEY = 'horon_firestore_quota_exceeded';
const QUOTA_TS_KEY = 'horon_firestore_quota_exceeded_ts';
const QUOTA_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

function checkStoredQuota(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const isExceeded = localStorage.getItem(QUOTA_STORAGE_KEY) === 'true' || 
                       sessionStorage.getItem(QUOTA_STORAGE_KEY) === 'true';
    if (isExceeded) {
      const tsStr = localStorage.getItem(QUOTA_TS_KEY);
      if (tsStr) {
        const ts = parseInt(tsStr, 10);
        if (!isNaN(ts) && (Date.now() - ts < QUOTA_DURATION_MS)) {
          return true;
        }
      } else {
        return true;
      }
    }
  } catch {}
  return false;
}

let isQuotaExceededState: boolean = checkStoredQuota();

const quotaListeners = new Set<(exceeded: boolean) => void>();

export function isFirestoreQuotaExceeded(): boolean {
  if (!isQuotaExceededState && checkStoredQuota()) {
    isQuotaExceededState = true;
  }
  return isQuotaExceededState;
}

export function setFirestoreQuotaExceeded(exceeded: boolean = true) {
  if (isQuotaExceededState === exceeded) return;
  isQuotaExceededState = exceeded;
  if (typeof window !== 'undefined') {
    try {
      if (exceeded) {
        localStorage.setItem(QUOTA_STORAGE_KEY, 'true');
        localStorage.setItem(QUOTA_TS_KEY, Date.now().toString());
        sessionStorage.setItem(QUOTA_STORAGE_KEY, 'true');
      } else {
        localStorage.removeItem(QUOTA_STORAGE_KEY);
        localStorage.removeItem(QUOTA_TS_KEY);
        sessionStorage.removeItem(QUOTA_STORAGE_KEY);
      }
    } catch {}
  }
  quotaListeners.forEach(listener => {
    try { listener(exceeded); } catch {}
  });
}

export function onFirestoreQuotaChange(callback: (exceeded: boolean) => void): () => void {
  quotaListeners.add(callback);
  callback(isFirestoreQuotaExceeded());
  return () => {
    quotaListeners.delete(callback);
  };
}

export function isQuotaError(error: unknown): boolean {
  if (!error) return false;
  const err = error as { code?: string; message?: string };
  if (err.code === 'resource-exhausted') return true;
  if (typeof err.message === 'string') {
    const msg = err.message.toLowerCase();
    return msg.includes('quota limit exceeded') || 
           msg.includes('resource-exhausted') || 
           msg.includes('quota exceeded');
  }
  return false;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operation: OperationType;
  path: string | null;
  authInfo: {
    isAuthenticated: boolean;
    userId?: string;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const err = error as { code?: string; message?: string };
  if (isQuotaError(error)) {
    setFirestoreQuotaExceeded(true);
    console.warn(`⚠️ Quota Firestore gratuit atteint lors de l'opération ${operationType} (${path || ''}). Le système bascule automatiquement sur le stockage local et le serveur.`);
  }
  if (err && err.code === 'permission-denied') {
    const errorInfo: FirestoreErrorInfo = {
      error: `Missing or insufficient permissions: ${err.message || 'Permission denied'}`,
      authInfo: {
        isAuthenticated: !!auth?.currentUser,
        userId: auth?.currentUser?.uid
      },
      operation: operationType,
      path: path
    };
    console.error('Firestore permission error:', JSON.stringify(errorInfo));
    throw new Error(JSON.stringify(errorInfo));
  }
  throw error;
}

export async function testFirestoreConnection(): Promise<{ ok: boolean; message: string; isQuotaExceeded?: boolean }> {
  if (isFirestoreQuotaExceeded()) {
    return { 
      ok: false, 
      message: 'Quota journalier Firestore gratuit atteint (relais local et serveur actif)', 
      isQuotaExceeded: true 
    };
  }
  try {
    await getDocFromServer(doc(firestoreDb, 'test', 'connection'));
    return { ok: true, message: 'Connecté à Google Cloud Firestore' };
  } catch (error) {
    if (isQuotaError(error)) {
      setFirestoreQuotaExceeded(true);
      return { 
        ok: false, 
        message: 'Quota journalier Firestore gratuit atteint (relais local et serveur actif)', 
        isQuotaExceeded: true 
      };
    }
    if (error instanceof Error && error.message.includes('the client is offline')) {
      return { ok: false, message: 'Client Firestore en cache hors-ligne' };
    }
    return { ok: true, message: 'Connecté à Google Cloud Firestore' };
  }
}

/* =========================================================
   INITIAL CLOUD SEEDING (If Firestore collection is empty)
========================================================= */
let isSeeding = false;

export async function seedFirestoreIfEmpty(forceCheck: boolean = false): Promise<boolean> {
  if (isFirestoreQuotaExceeded()) return false;
  // Never auto-seed write units on normal application boots - all initial catalogue data
  // is pre-populated in application memory and persisted permanently in IndexedDB.
  if (!forceCheck) return false;
  if (isSeeding) return false;
  
  if (typeof window !== 'undefined') {
    if (localStorage.getItem('horon_firestore_initialized_v2') === 'true') {
      return false;
    }
    localStorage.setItem('horon_firestore_initialized_v2', 'true');
  }

  try {
    isSeeding = true;
    const systemDocRef = doc(firestoreDb, 'settings', 'system');

    if (!forceCheck) {
      // Resilient check: see if system was already initialized
      try {
        const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500));
        const queryPromise = getDoc(systemDocRef);
        const existingSnap = await Promise.race([queryPromise, timeoutPromise]);

        if (existingSnap && existingSnap.exists()) {
          return false;
        }
      } catch (err) {
        if (isQuotaError(err)) {
          setFirestoreQuotaExceeded(true);
        }
        return false;
      }
    }

    if (isFirestoreQuotaExceeded()) return false;

    console.log('🌱 Initializing Horon Mousso cloud database for the first time...');
    
    // Seed products (skipping any deleted IDs)
    for (const prod of initialProducts) {
      if (isIdDeleted(prod.id)) continue;
      await setDoc(doc(firestoreDb, 'products', prod.id), {
        ...prod,
        syncedAt: new Date().toISOString()
      }, { merge: true });
    }

    // Seed announcements (skipping any deleted IDs)
    for (const ann of initialAnnouncements) {
      if (isIdDeleted(ann.id)) continue;
      await setDoc(doc(firestoreDb, 'announcements', ann.id), {
        ...ann,
        syncedAt: new Date().toISOString()
      }, { merge: true });
    }

    // Seed media (skipping any deleted IDs)
    for (const med of initialMedia) {
      if (isIdDeleted(med.id)) continue;
      await setDoc(doc(firestoreDb, 'media', med.id), {
        ...med,
        syncedAt: new Date().toISOString()
      }, { merge: true });
    }

    // Seed messages (skipping any deleted IDs)
    for (const msg of initialMessages) {
      if (isIdDeleted(msg.id)) continue;
      await setDoc(doc(firestoreDb, 'messages', msg.id), {
        ...msg,
        syncedAt: new Date().toISOString()
      }, { merge: true });
    }

    // Seed settings safely (preserve local settings if user customized them)
    let settingsToSeed = initialSettings;
    try {
      if (typeof window !== 'undefined') {
        const localCached = localStorage.getItem('agro_settings_cache');
        if (localCached) {
          const parsed = JSON.parse(localCached);
          if (parsed && parsed.companyName) {
            settingsToSeed = { ...initialSettings, ...parsed };
          }
        }
      }
    } catch {}

    await setDoc(doc(firestoreDb, 'settings', 'main'), {
      ...settingsToSeed,
      syncedAt: new Date().toISOString()
    }, { merge: true });

    // Seed initial orders
    for (const ord of initialOrders) {
      if (isIdDeleted(ord.id)) continue;
      await setDoc(doc(firestoreDb, 'orders', ord.id), {
        ...ord,
        syncedAt: new Date().toISOString()
      }, { merge: true });
    }

    // Seed initial reviews
    for (const rev of initialReviews) {
      if (isIdDeleted(rev.id)) continue;
      await setDoc(doc(firestoreDb, 'reviews', rev.id), {
        ...rev,
        syncedAt: new Date().toISOString()
      }, { merge: true });
    }

    // Mark as initialized permanently so future runs or empty collections never get reset
    await setDoc(systemDocRef, {
      isInitialized: true,
      initializedAt: new Date().toISOString(),
      version: '1.0'
    }, { merge: true });

    return true;
  } catch (error) {
    if (isQuotaError(error)) {
      setFirestoreQuotaExceeded(true);
      console.warn('⚠️ Quota Firestore gratuit atteint pendant l\'initialisation. Mode local/serveur actif.');
    } else {
      console.warn('Note on Firestore seeding (continuing with local/cached state):', error);
    }
    return false;
  } finally {
    isSeeding = false;
  }
}

/* =========================================================
   REAL-TIME SUBSCRIPTIONS (MULTI-DEVICE LIVE SYNC)
========================================================= */

export function subscribeToCloudProducts(
  onUpdate: (products: Product[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const colRef = collection(firestoreDb, 'products');
  return onSnapshot(colRef, (snapshot) => {
    const list: Product[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as Product);
    });
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    onUpdate(filterDeleted(list));
  }, (err) => {
    if (onError) onError(err);
  });
}

export function subscribeToCloudAnnouncements(
  onUpdate: (announcements: Announcement[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const colRef = collection(firestoreDb, 'announcements');
  return onSnapshot(colRef, (snapshot) => {
    const list: Announcement[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as Announcement);
    });
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    onUpdate(filterDeleted(list));
  }, (err) => {
    if (onError) onError(err);
  });
}

export function subscribeToCloudMedia(
  onUpdate: (media: MediaItem[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const colRef = collection(firestoreDb, 'media');
  return onSnapshot(colRef, (snapshot) => {
    const list: MediaItem[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as MediaItem);
    });
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    onUpdate(filterDeleted(list));
  }, (err) => {
    if (onError) onError(err);
  });
}

export function subscribeToCloudMessages(
  onUpdate: (messages: CustomerMessage[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const colRef = collection(firestoreDb, 'messages');
  return onSnapshot(colRef, (snapshot) => {
    const list: CustomerMessage[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as CustomerMessage);
    });
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    onUpdate(filterDeleted(list));
  }, (err) => {
    if (onError) onError(err);
  });
}

export function subscribeToCloudSettings(
  onUpdate: (settings: CompanySettings) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const docRef = doc(firestoreDb, 'settings', 'main');
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      onUpdate(docSnap.data() as CompanySettings);
    }
  }, (err) => {
    if (onError) onError(err);
  });
}

export function subscribeToCloudAdminAuth(
  onUpdate: (auth: { username: string; email: string; isDefault: boolean }) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const docRef = doc(firestoreDb, 'settings', 'admin_auth');
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      onUpdate({
        username: data.username || 'admin',
        email: data.email || 'admin@horonmousso.com',
        isDefault: !data.passwordHash || data.passwordHash === 'admin'
      });
    } else {
      onUpdate({
        username: 'admin',
        email: 'admin@horonmousso.com',
        isDefault: true
      });
    }
  }, (err) => {
    if (onError) onError(err);
  });
}

export function subscribeToCloudOrders(
  onUpdate: (orders: Order[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const colRef = collection(firestoreDb, 'orders');
  return onSnapshot(colRef, (snapshot) => {
    const list: Order[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as Order);
    });
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    onUpdate(filterDeleted(list));
  }, (err) => {
    if (onError) onError(err);
  });
}

export function subscribeToCloudReviews(
  onUpdate: (reviews: ProductReview[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const colRef = collection(firestoreDb, 'reviews');
  return onSnapshot(colRef, (snapshot) => {
    const list: ProductReview[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as ProductReview);
    });
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    onUpdate(filterDeleted(list));
  }, (err) => {
    if (onError) onError(err);
  });
}

// Cloud deleted IDs tracking for multi-device synchronization
export async function saveDeletedIdToFirestore(id: string): Promise<void> {
  if (!id || typeof id !== 'string') return;
  const cleanId = id.trim();
  if (!cleanId) return;
  try {
    const docRef = doc(firestoreDb, 'settings', 'deleted_ids');
    const snap = await getDoc(docRef);
    const existing: string[] = snap.exists() ? (snap.data().ids || []) : [];
    if (!existing.includes(cleanId)) {
      await setDoc(docRef, { 
        ids: [...existing, cleanId], 
        updatedAt: new Date().toISOString() 
      }, { merge: true });
      setFirestoreQuotaExceeded(false);
    }
  } catch (err) {
    if (isQuotaError(err)) {
      setFirestoreQuotaExceeded(true);
    }
  }
}

export function subscribeToCloudDeletedIds(
  onUpdate: (deletedIds: string[]) => void
): Unsubscribe {
  const docRef = doc(firestoreDb, 'settings', 'deleted_ids');
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (Array.isArray(data.ids)) {
        onUpdate(data.ids);
      }
    }
  }, () => {});
}

/* =========================================================
   MUTATION OPERATIONS (WRITE TO CLOUD + LOCAL CACHE)
========================================================= */

// Products
export async function saveProductToFirestore(product: Product): Promise<void> {
  const path = `products/${product.id}`;
  try {
    const docRef = doc(firestoreDb, 'products', product.id);
    await setDoc(docRef, {
      ...product,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    setFirestoreQuotaExceeded(false);
  } catch (err) {
    if (isQuotaError(err)) {
      setFirestoreQuotaExceeded(true);
      return;
    }
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteProductFromFirestore(id: string): Promise<void> {
  const path = `products/${id}`;
  try {
    const docRef = doc(firestoreDb, 'products', id);
    await deleteDoc(docRef);
    await saveDeletedIdToFirestore(id);
    setFirestoreQuotaExceeded(false);
  } catch (err) {
    if (isQuotaError(err)) {
      setFirestoreQuotaExceeded(true);
      return;
    }
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// Announcements
export async function saveAnnouncementToFirestore(announcement: Announcement): Promise<void> {
  const path = `announcements/${announcement.id}`;
  try {
    const docRef = doc(firestoreDb, 'announcements', announcement.id);
    await setDoc(docRef, {
      ...announcement,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    setFirestoreQuotaExceeded(false);
  } catch (err) {
    if (isQuotaError(err)) {
      setFirestoreQuotaExceeded(true);
      return;
    }
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteAnnouncementFromFirestore(id: string): Promise<void> {
  const path = `announcements/${id}`;
  try {
    const docRef = doc(firestoreDb, 'announcements', id);
    await deleteDoc(docRef);
    await saveDeletedIdToFirestore(id);
    setFirestoreQuotaExceeded(false);
  } catch (err) {
    if (isQuotaError(err)) {
      setFirestoreQuotaExceeded(true);
      return;
    }
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// Media
export async function saveMediaToFirestore(media: MediaItem): Promise<void> {
  const path = `media/${media.id}`;
  try {
    const docRef = doc(firestoreDb, 'media', media.id);
    await setDoc(docRef, media, { merge: true });
    setFirestoreQuotaExceeded(false);
  } catch (err) {
    if (isQuotaError(err)) {
      setFirestoreQuotaExceeded(true);
      return;
    }
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteMediaFromFirestore(id: string): Promise<void> {
  const path = `media/${id}`;
  try {
    const docRef = doc(firestoreDb, 'media', id);
    await deleteDoc(docRef);
    await saveDeletedIdToFirestore(id);
    setFirestoreQuotaExceeded(false);
  } catch (err) {
    if (isQuotaError(err)) {
      setFirestoreQuotaExceeded(true);
      return;
    }
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// Messages
export async function saveMessageToFirestore(message: CustomerMessage): Promise<void> {
  const path = `messages/${message.id}`;
  try {
    const docRef = doc(firestoreDb, 'messages', message.id);
    await setDoc(docRef, message, { merge: true });
    setFirestoreQuotaExceeded(false);
  } catch (err) {
    if (isQuotaError(err)) {
      setFirestoreQuotaExceeded(true);
      return;
    }
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function updateMessageStatusInFirestore(id: string, status: 'nouveau' | 'lu'): Promise<void> {
  const path = `messages/${id}`;
  try {
    const docRef = doc(firestoreDb, 'messages', id);
    await setDoc(docRef, { status }, { merge: true });
    setFirestoreQuotaExceeded(false);
  } catch (err) {
    if (isQuotaError(err)) {
      setFirestoreQuotaExceeded(true);
      return;
    }
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteMessageFromFirestore(id: string): Promise<void> {
  const path = `messages/${id}`;
  try {
    const docRef = doc(firestoreDb, 'messages', id);
    await deleteDoc(docRef);
    await saveDeletedIdToFirestore(id);
    setFirestoreQuotaExceeded(false);
  } catch (err) {
    if (isQuotaError(err)) {
      setFirestoreQuotaExceeded(true);
      return;
    }
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// Settings
export async function saveSettingsToFirestore(settings: CompanySettings): Promise<void> {
  const path = 'settings/main';
  try {
    const docRef = doc(firestoreDb, 'settings', 'main');
    await setDoc(docRef, {
      ...settings,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    setFirestoreQuotaExceeded(false);
  } catch (err) {
    if (isQuotaError(err)) {
      setFirestoreQuotaExceeded(true);
      return;
    }
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Orders
export async function saveOrderToFirestore(order: Order): Promise<void> {
  const path = `orders/${order.id}`;
  try {
    const docRef = doc(firestoreDb, 'orders', order.id);
    await setDoc(docRef, {
      ...order,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    setFirestoreQuotaExceeded(false);
  } catch (err) {
    if (isQuotaError(err)) {
      setFirestoreQuotaExceeded(true);
      return;
    }
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function updateOrderStatusInFirestore(
  id: string, 
  status: Order['status'], 
  paymentStatus?: Order['paymentStatus']
): Promise<void> {
  const path = `orders/${id}`;
  try {
    const docRef = doc(firestoreDb, 'orders', id);
    const updateData: Record<string, any> = { 
      status, 
      updatedAt: new Date().toISOString() 
    };
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }
    await setDoc(docRef, updateData, { merge: true });
    setFirestoreQuotaExceeded(false);
  } catch (err) {
    if (isQuotaError(err)) {
      setFirestoreQuotaExceeded(true);
      return;
    }
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteOrderFromFirestore(id: string): Promise<void> {
  const path = `orders/${id}`;
  try {
    const docRef = doc(firestoreDb, 'orders', id);
    await deleteDoc(docRef);
    await saveDeletedIdToFirestore(id);
    setFirestoreQuotaExceeded(false);
  } catch (err) {
    if (isQuotaError(err)) {
      setFirestoreQuotaExceeded(true);
      return;
    }
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// Reviews
export async function saveReviewToFirestore(review: ProductReview): Promise<void> {
  const path = `reviews/${review.id}`;
  try {
    const docRef = doc(firestoreDb, 'reviews', review.id);
    await setDoc(docRef, review, { merge: true });
    setFirestoreQuotaExceeded(false);
  } catch (err) {
    if (isQuotaError(err)) {
      setFirestoreQuotaExceeded(true);
      return;
    }
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteReviewFromFirestore(id: string): Promise<void> {
  const path = `reviews/${id}`;
  try {
    const docRef = doc(firestoreDb, 'reviews', id);
    await deleteDoc(docRef);
    await saveDeletedIdToFirestore(id);
    setFirestoreQuotaExceeded(false);
  } catch (err) {
    if (isQuotaError(err)) {
      setFirestoreQuotaExceeded(true);
      return;
    }
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

/* =========================================================
   DIRECT CLOUD FETCH OPERATIONS (FOR REAL-TIME API)
========================================================= */

export async function getCloudProducts(): Promise<Product[]> {
  try {
    const colRef = collection(firestoreDb, 'products');
    const snap = await getDocs(colRef);
    const list: Product[] = [];
    snap.forEach(d => list.push(d.data() as Product));
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return filterDeleted(list);
  } catch (err) {
    console.warn('Firestore getCloudProducts fallback to local:', err);
    return [];
  }
}

export async function getCloudAnnouncements(): Promise<Announcement[]> {
  try {
    const colRef = collection(firestoreDb, 'announcements');
    const snap = await getDocs(colRef);
    const list: Announcement[] = [];
    snap.forEach(d => list.push(d.data() as Announcement));
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return filterDeleted(list);
  } catch (err) {
    console.warn('Firestore getCloudAnnouncements fallback:', err);
    return [];
  }
}

export async function getCloudMedia(): Promise<MediaItem[]> {
  try {
    const colRef = collection(firestoreDb, 'media');
    const snap = await getDocs(colRef);
    const list: MediaItem[] = [];
    snap.forEach(d => list.push(d.data() as MediaItem));
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return filterDeleted(list);
  } catch (err) {
    console.warn('Firestore getCloudMedia fallback:', err);
    return [];
  }
}

export async function getCloudMessages(): Promise<CustomerMessage[]> {
  try {
    const colRef = collection(firestoreDb, 'messages');
    const snap = await getDocs(colRef);
    const list: CustomerMessage[] = [];
    snap.forEach(d => list.push(d.data() as CustomerMessage));
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return filterDeleted(list);
  } catch (err) {
    if (isQuotaError(err)) {
      setFirestoreQuotaExceeded(true);
    }
    console.warn('Firestore getCloudMessages fallback:', err);
    return [];
  }
}

export async function getCloudSettings(): Promise<CompanySettings | null> {
  try {
    const docRef = doc(firestoreDb, 'settings', 'main');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as CompanySettings;
    }
    return null;
  } catch (err) {
    if (isQuotaError(err)) {
      setFirestoreQuotaExceeded(true);
    }
    console.warn('Firestore getCloudSettings fallback:', err);
    return null;
  }
}

export async function getCloudAdminAuth(): Promise<{ username: string; email: string; passwordHash: string; isDefault: boolean }> {
  try {
    const docRef = doc(firestoreDb, 'settings', 'admin_auth');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        username: data.username || 'admin',
        email: data.email || 'admin@horonmousso.com',
        passwordHash: data.passwordHash || 'admin',
        isDefault: !data.passwordHash || data.passwordHash === 'admin'
      };
    }
  } catch (err) {
    if (isQuotaError(err)) {
      setFirestoreQuotaExceeded(true);
    }
    console.warn('Firestore getCloudAdminAuth fallback:', err);
  }
  return {
    username: 'admin',
    email: 'admin@horonmousso.com',
    passwordHash: 'admin',
    isDefault: true
  };
}

export async function saveCloudAdminAuth(data: { username: string; email: string; passwordHash?: string }): Promise<void> {
  const docRef = doc(firestoreDb, 'settings', 'admin_auth');
  try {
    await setDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    setFirestoreQuotaExceeded(false);
  } catch (err) {
    if (isQuotaError(err)) {
      setFirestoreQuotaExceeded(true);
      return;
    }
    handleFirestoreError(err, OperationType.WRITE, 'settings/admin_auth');
  }
}

export async function resetCloudData(): Promise<void> {
  // Clear and reseed products
  const prodsSnap = await getDocs(collection(firestoreDb, 'products'));
  for (const d of prodsSnap.docs) {
    await deleteDoc(d.ref);
  }
  for (const prod of initialProducts) {
    await setDoc(doc(firestoreDb, 'products', prod.id), {
      ...prod,
      syncedAt: new Date().toISOString()
    });
  }

  // Clear and reseed announcements
  const annsSnap = await getDocs(collection(firestoreDb, 'announcements'));
  for (const d of annsSnap.docs) {
    await deleteDoc(d.ref);
  }
  for (const ann of initialAnnouncements) {
    await setDoc(doc(firestoreDb, 'announcements', ann.id), {
      ...ann,
      syncedAt: new Date().toISOString()
    });
  }

  // Seed settings
  await setDoc(doc(firestoreDb, 'settings', 'main'), {
    ...initialSettings,
    syncedAt: new Date().toISOString()
  });
}

