import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  getDoc,
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

// Suppress transient backend unreachable notices in environments where offline caching or long-polling handles connection
setLogLevel('error');

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

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
} catch (e) {
  console.warn('Firebase app init error:', e);
  app = initializeApp(firebaseConfig);
}

try {
  // Initialize Firestore with auto-detect long polling and persistent offline cache
  firestoreDb = initializeFirestore(
    app,
    {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      }),
      experimentalAutoDetectLongPolling: true
    },
    firebaseConfig.firestoreDatabaseId
  );
} catch (e) {
  // Fallback if already initialized or persistent cache not supported in browser environment (e.g. Safari private)
  try {
    firestoreDb = initializeFirestore(
      app,
      { experimentalAutoDetectLongPolling: true },
      firebaseConfig.firestoreDatabaseId
    );
  } catch (err) {
    try {
      firestoreDb = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    } catch {
      firestoreDb = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    }
  }
}

export { app, firestoreDb };

/* =========================================================
   INITIAL CLOUD SEEDING (If Firestore collection is empty)
========================================================= */
let isSeeding = false;

export async function seedFirestoreIfEmpty(): Promise<boolean> {
  if (isSeeding) return false;
  if (typeof window !== 'undefined' && sessionStorage.getItem('horon_firestore_seeded')) {
    return false;
  }
  
  try {
    isSeeding = true;
    const systemDocRef = doc(firestoreDb, 'settings', 'system');

    // Resilient check: see if system was already initialized
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3500));
    const queryPromise = getDoc(systemDocRef);
    const existingSnap = await Promise.race([queryPromise, timeoutPromise]);

    if (existingSnap && existingSnap.exists()) {
      // Already initialized, never overwrite user data
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('horon_firestore_seeded', 'true');
      }
      return false;
    }

    console.log('🌱 Initializing Horon Mousso cloud database for the first time...');
    
    // Seed products
    for (const prod of initialProducts) {
      await setDoc(doc(firestoreDb, 'products', prod.id), {
        ...prod,
        syncedAt: new Date().toISOString()
      });
    }

    // Seed announcements
    for (const ann of initialAnnouncements) {
      await setDoc(doc(firestoreDb, 'announcements', ann.id), {
        ...ann,
        syncedAt: new Date().toISOString()
      });
    }

    // Seed media
    for (const med of initialMedia) {
      await setDoc(doc(firestoreDb, 'media', med.id), {
        ...med,
        syncedAt: new Date().toISOString()
      });
    }

    // Seed messages
    for (const msg of initialMessages) {
      await setDoc(doc(firestoreDb, 'messages', msg.id), {
        ...msg,
        syncedAt: new Date().toISOString()
      });
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
      await setDoc(doc(firestoreDb, 'orders', ord.id), {
        ...ord,
        syncedAt: new Date().toISOString()
      }, { merge: true });
    }

    // Seed initial reviews
    for (const rev of initialReviews) {
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
    });

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('horon_firestore_seeded', 'true');
    }
    return true;
  } catch (error) {
    console.warn('Note on Firestore seeding (continuing with local/cached state):', error);
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
    if (snapshot.empty) {
      // Do not overwrite local products if collection is unseeded or empty
      return;
    }
    const list: Product[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as Product);
    });
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    onUpdate(list);
  }, (err) => {
    // Graceful handling when offline: SDK automatically serves from local cache
    if (onError) onError(err);
  });
}

export function subscribeToCloudAnnouncements(
  onUpdate: (announcements: Announcement[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const colRef = collection(firestoreDb, 'announcements');
  return onSnapshot(colRef, (snapshot) => {
    if (snapshot.empty) {
      return;
    }
    const list: Announcement[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as Announcement);
    });
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    onUpdate(list);
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
    if (snapshot.empty) {
      return;
    }
    const list: MediaItem[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as MediaItem);
    });
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    onUpdate(list);
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
    onUpdate(list);
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
    if (snapshot.empty) {
      return;
    }
    const list: Order[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as Order);
    });
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    onUpdate(list);
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
    if (snapshot.empty) {
      return;
    }
    const list: ProductReview[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as ProductReview);
    });
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    onUpdate(list);
  }, (err) => {
    if (onError) onError(err);
  });
}

/* =========================================================
   MUTATION OPERATIONS (WRITE TO CLOUD + LOCAL CACHE)
========================================================= */

// Products
export async function saveProductToFirestore(product: Product): Promise<void> {
  const docRef = doc(firestoreDb, 'products', product.id);
  await setDoc(docRef, {
    ...product,
    updatedAt: new Date().toISOString()
  }, { merge: true });
}

export async function deleteProductFromFirestore(id: string): Promise<void> {
  const docRef = doc(firestoreDb, 'products', id);
  await deleteDoc(docRef);
}

// Announcements
export async function saveAnnouncementToFirestore(announcement: Announcement): Promise<void> {
  const docRef = doc(firestoreDb, 'announcements', announcement.id);
  await setDoc(docRef, {
    ...announcement,
    updatedAt: new Date().toISOString()
  }, { merge: true });
}

export async function deleteAnnouncementFromFirestore(id: string): Promise<void> {
  const docRef = doc(firestoreDb, 'announcements', id);
  await deleteDoc(docRef);
}

// Media
export async function saveMediaToFirestore(media: MediaItem): Promise<void> {
  const docRef = doc(firestoreDb, 'media', media.id);
  await setDoc(docRef, media, { merge: true });
}

export async function deleteMediaFromFirestore(id: string): Promise<void> {
  const docRef = doc(firestoreDb, 'media', id);
  await deleteDoc(docRef);
}

// Messages
export async function saveMessageToFirestore(message: CustomerMessage): Promise<void> {
  const docRef = doc(firestoreDb, 'messages', message.id);
  await setDoc(docRef, message, { merge: true });
}

export async function updateMessageStatusInFirestore(id: string, status: 'nouveau' | 'lu'): Promise<void> {
  const docRef = doc(firestoreDb, 'messages', id);
  await setDoc(docRef, { status }, { merge: true });
}

export async function deleteMessageFromFirestore(id: string): Promise<void> {
  const docRef = doc(firestoreDb, 'messages', id);
  await deleteDoc(docRef);
}

// Settings
export async function saveSettingsToFirestore(settings: CompanySettings): Promise<void> {
  const docRef = doc(firestoreDb, 'settings', 'main');
  await setDoc(docRef, {
    ...settings,
    updatedAt: new Date().toISOString()
  }, { merge: true });
}

// Orders
export async function saveOrderToFirestore(order: Order): Promise<void> {
  const docRef = doc(firestoreDb, 'orders', order.id);
  await setDoc(docRef, {
    ...order,
    updatedAt: new Date().toISOString()
  }, { merge: true });
}

export async function updateOrderStatusInFirestore(
  id: string, 
  status: Order['status'], 
  paymentStatus?: Order['paymentStatus']
): Promise<void> {
  const docRef = doc(firestoreDb, 'orders', id);
  const updateData: Record<string, any> = { 
    status, 
    updatedAt: new Date().toISOString() 
  };
  if (paymentStatus) {
    updateData.paymentStatus = paymentStatus;
  }
  await setDoc(docRef, updateData, { merge: true });
}

export async function deleteOrderFromFirestore(id: string): Promise<void> {
  const docRef = doc(firestoreDb, 'orders', id);
  await deleteDoc(docRef);
}

// Reviews
export async function saveReviewToFirestore(review: ProductReview): Promise<void> {
  const docRef = doc(firestoreDb, 'reviews', review.id);
  await setDoc(docRef, review, { merge: true });
}

export async function deleteReviewFromFirestore(id: string): Promise<void> {
  const docRef = doc(firestoreDb, 'reviews', id);
  await deleteDoc(docRef);
}

/* =========================================================
   DIRECT CLOUD FETCH OPERATIONS (FOR REAL-TIME API)
========================================================= */

export async function getCloudProducts(): Promise<Product[]> {
  try {
    const colRef = collection(firestoreDb, 'products');
    const snap = await getDocs(colRef);
    if (snap.empty) {
      // Seed if empty
      await seedFirestoreIfEmpty();
      const freshSnap = await getDocs(colRef);
      const list: Product[] = [];
      freshSnap.forEach(d => list.push(d.data() as Product));
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return list.length > 0 ? list : initialProducts;
    }
    const list: Product[] = [];
    snap.forEach(d => list.push(d.data() as Product));
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  } catch (err) {
    console.warn('Firestore getCloudProducts fallback to local:', err);
    return [];
  }
}

export async function getCloudAnnouncements(): Promise<Announcement[]> {
  try {
    const colRef = collection(firestoreDb, 'announcements');
    const snap = await getDocs(colRef);
    if (snap.empty) {
      return initialAnnouncements;
    }
    const list: Announcement[] = [];
    snap.forEach(d => list.push(d.data() as Announcement));
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  } catch (err) {
    console.warn('Firestore getCloudAnnouncements fallback:', err);
    return [];
  }
}

export async function getCloudMedia(): Promise<MediaItem[]> {
  try {
    const colRef = collection(firestoreDb, 'media');
    const snap = await getDocs(colRef);
    if (snap.empty) {
      return initialMedia;
    }
    const list: MediaItem[] = [];
    snap.forEach(d => list.push(d.data() as MediaItem));
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
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
    return list;
  } catch (err) {
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
  await setDoc(docRef, {
    ...data,
    updatedAt: new Date().toISOString()
  }, { merge: true });
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

