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
  deleteDoc, 
  onSnapshot, 
  Firestore,
  Unsubscribe,
  setLogLevel
} from 'firebase/firestore';
import { Product, Announcement, MediaItem, CustomerMessage, CompanySettings } from '../types';
import { initialProducts, initialAnnouncements, initialMedia, initialMessages, initialSettings } from '../data/initialData';

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
  // Initialize Firestore with force long polling to bypass reverse-proxy WebChannel streaming drops
  // and persistent offline cache for local persistence
  firestoreDb = initializeFirestore(
    app,
    {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      }),
      experimentalAutoDetectLongPolling: true,
      experimentalForceLongPolling: true
    },
    firebaseConfig.firestoreDatabaseId
  );
} catch (e) {
  // Fallback if already initialized or persistent cache not supported in browser environment
  try {
    firestoreDb = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  } catch (err) {
    firestoreDb = getFirestore(app);
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
    const productsRef = collection(firestoreDb, 'products');

    // Resilient timeout: If connection is slow or offline, do not hang application startup
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3500));
    const queryPromise = getDocs(productsRef);
    const existingSnap = await Promise.race([queryPromise, timeoutPromise]);

    if (!existingSnap) {
      // Server timed out or offline, proceed smoothly with local/cached data
      return false;
    }

    if (existingSnap.empty) {
      console.log('🌱 Firestore empty: seeding initial Horon Mousso data to cloud...');
      
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

      // Seed settings
      await setDoc(doc(firestoreDb, 'settings', 'main'), {
        ...initialSettings,
        syncedAt: new Date().toISOString()
      });

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('horon_firestore_seeded', 'true');
      }
      return true;
    } else {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('horon_firestore_seeded', 'true');
      }
    }
    return false;
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
