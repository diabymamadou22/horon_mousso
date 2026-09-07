import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, doc, setDoc, getDocs, collection } from 'firebase/firestore';
import { firebaseConfig } from '../src/lib/firebase';
import { 
  initialProducts, 
  initialAnnouncements, 
  initialMedia, 
  initialMessages, 
  initialSettings 
} from '../src/data/initialData';

async function runSeed() {
  console.log('Connecting to Firestore project:', firebaseConfig.projectId, 'database:', firebaseConfig.firestoreDatabaseId);
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  const db = initializeFirestore(app, {}, firebaseConfig.firestoreDatabaseId);

  console.log(`Seeding ${initialProducts.length} products...`);
  for (const prod of initialProducts) {
    await setDoc(doc(db, 'products', prod.id), {
      ...prod,
      syncedAt: new Date().toISOString()
    }, { merge: true });
  }

  console.log(`Seeding ${initialAnnouncements.length} announcements...`);
  for (const ann of initialAnnouncements) {
    await setDoc(doc(db, 'announcements', ann.id), {
      ...ann,
      syncedAt: new Date().toISOString()
    }, { merge: true });
  }

  console.log(`Seeding ${initialMedia.length} media...`);
  for (const med of initialMedia) {
    await setDoc(doc(db, 'media', med.id), {
      ...med,
      syncedAt: new Date().toISOString()
    }, { merge: true });
  }

  console.log(`Seeding ${initialMessages.length} messages...`);
  for (const msg of initialMessages) {
    await setDoc(doc(db, 'messages', msg.id), {
      ...msg,
      syncedAt: new Date().toISOString()
    }, { merge: true });
  }

  console.log('Seeding settings/main...');
  await setDoc(doc(db, 'settings', 'main'), {
    ...initialSettings,
    syncedAt: new Date().toISOString()
  }, { merge: true });

  console.log('Seeding default admin auth credentials in settings/admin_auth...');
  await setDoc(doc(db, 'settings', 'admin_auth'), {
    username: 'admin',
    email: 'admin@horonmousso.com',
    passwordHash: 'admin', // default demo pass
    updatedAt: new Date().toISOString()
  }, { merge: true });

  const productsSnap = await getDocs(collection(db, 'products'));
  console.log(`✅ Success! Firestore currently has ${productsSnap.docs.length} products.`);
  process.exit(0);
}

runSeed().catch(err => {
  console.error('❌ Seeding error:', err);
  process.exit(1);
});
