import { 
  Product, 
  Announcement, 
  MediaItem, 
  CustomerMessage, 
  CompanySettings, 
  DashboardStats, 
  User,
  Order,
  OrderStatus,
  PaymentStatus,
  ProductReview,
  PromoBanner
} from '../types';
import { 
  initialProducts, 
  initialAnnouncements, 
  initialMedia, 
  initialMessages, 
  initialSettings 
} from '../data/initialData';
import { initialOrders } from '../data/initialOrders';
import { initialReviews } from '../data/initialReviews';
import {
  getLocalProducts,
  saveLocalProducts,
  saveSingleLocalProduct,
  deleteSingleLocalProduct,
  getLocalAnnouncements,
  saveLocalAnnouncements,
  saveSingleLocalAnnouncement,
  deleteSingleLocalAnnouncement,
  getLocalMedia,
  saveLocalMedia,
  saveSingleLocalMedia,
  deleteSingleLocalMedia,
  getLocalMessages,
  saveLocalMessages,
  saveSingleLocalMessage,
  deleteSingleLocalMessage,
  getLocalSettings,
  saveLocalSettings,
  getLocalOrders,
  saveLocalOrders,
  saveSingleLocalOrder,
  deleteSingleLocalOrder,
  getLocalReviews,
  saveLocalReviews,
  deleteSingleLocalReview
} from '../lib/indexedDb';
import { filterDeleted, markIdAsDeleted, initDeletionTracker, clearDeletedIds } from '../lib/deletionTracker';
import {
  getCloudProducts,
  getCloudAnnouncements,
  getCloudMedia,
  getCloudMessages,
  getCloudSettings,
  getCloudOrders,
  getCloudReviews,
  getCloudAdminAuth,
  saveCloudAdminAuth,
  saveProductToFirestore,
  deleteProductFromFirestore,
  saveAnnouncementToFirestore,
  deleteAnnouncementFromFirestore,
  saveMediaToFirestore,
  deleteMediaFromFirestore,
  saveMessageToFirestore,
  updateMessageStatusInFirestore,
  deleteMessageFromFirestore,
  saveSettingsToFirestore,
  getCloudHeroBanners,
  saveHeroBannerToFirestore,
  saveAllHeroBannersToFirestore,
  deleteHeroBannerFromFirestore,
  saveOrderToFirestore,
  updateOrderStatusInFirestore,
  deleteOrderFromFirestore,
  saveReviewToFirestore,
  deleteReviewFromFirestore,
  resetCloudData
} from '../lib/firebase';

export const STORAGE_KEYS = {
  PRODUCTS: 'agro_products_cache',
  ANNOUNCEMENTS: 'agro_announcements_cache',
  MEDIA: 'agro_media_cache',
  MESSAGES: 'agro_messages_cache',
  SETTINGS: 'agro_settings_cache',
  ORDERS: 'agro_orders_cache',
  REVIEWS: 'agro_reviews_cache',
  TOKEN: 'agro_admin_token',
  USER: 'agro_admin_user'
};

if (typeof window !== 'undefined') {
  initDeletionTracker();
}

export const api = {
  // Authentication - Multi-device cloud backed with strict session protection
  async login(passwordOrIdentifier: string, optionalPassword?: string): Promise<{ success: boolean; user?: User; token?: string; message?: string }> {
    const password = (optionalPassword !== undefined ? optionalPassword : passwordOrIdentifier).trim();

    // 1. Try Express API if server is running
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          sessionStorage.setItem('horon_admin_session', JSON.stringify(data.user));
          localStorage.removeItem(STORAGE_KEYS.USER); // Ensure no persistent leak
          return data;
        }
      }
    } catch {
      // Running on static hosting like Vercel or offline
    }

    // 2. Cloud Firestore Auth (for multi-device sync across Vercel, phones, and PCs)
    try {
      const cloudAuth = await getCloudAdminAuth();
      const validPassword = (
        password === cloudAuth.passwordHash ||
        (cloudAuth.isDefault && (password === '00223' || password === 'admin' || password === 'admin123'))
      );

      if (validPassword) {
        const user: User = {
          id: 'usr_admin_1',
          name: 'Administrateur Général',
          email: cloudAuth.email || 'admin@horonmousso.com',
          role: 'admin',
          createdAt: new Date().toISOString()
        };
        const token = 'cloud_token_' + Date.now();
        sessionStorage.setItem('horon_admin_session', JSON.stringify(user));
        localStorage.removeItem(STORAGE_KEYS.USER); // Ensure no persistent leak
        return { success: true, user, token };
      }
    } catch (e) {
      console.warn('Erreur vérification cloud auth:', e);
    }

    // 3. Fallback default check (00223)
    if (password === '00223' || password === 'admin') {
      const mockUser: User = {
        id: 'usr_admin_1',
        name: 'Administrateur Général',
        email: 'admin@horonmousso.com',
        role: 'admin',
        createdAt: new Date().toISOString()
      };
      const token = 'local_session_' + Date.now();
      sessionStorage.setItem('horon_admin_session', JSON.stringify(mockUser));
      localStorage.removeItem(STORAGE_KEYS.USER);
      return { success: true, user: mockUser, token };
    }

    return { success: false, message: 'Mot de passe incorrect.' };
  },

  async getAuthStatus(): Promise<{ isDefault: boolean; username: string; email: string; updatedAt?: string }> {
    try {
      const res = await fetch('/api/auth/status');
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Vercel / offline
    }

    // Check Cloud Firestore for active credentials
    try {
      const cloudAuth = await getCloudAdminAuth();
      return cloudAuth;
    } catch {
      return { isDefault: true, username: 'admin', email: 'admin@horonmousso.com' };
    }
  },

  async changeCredentials(currentPassword: string, newPassword: string, newUsername?: string, newEmail?: string): Promise<{ success: boolean; message: string }> {
    // 1. Check current credentials from cloud
    const cloudAuth = await getCloudAdminAuth();
    const isCurrentValid = (
      currentPassword === cloudAuth.passwordHash ||
      (cloudAuth.isDefault && (currentPassword === '00223' || currentPassword === 'admin' || currentPassword === 'admin123'))
    );

    if (!isCurrentValid) {
      return { success: false, message: 'Le mot de passe actuel est incorrect.' };
    }

    if (!newPassword || newPassword.trim().length < 3) {
      return { success: false, message: 'Le nouveau mot de passe doit comporter au moins 3 caractères.' };
    }

    const payload = {
      username: newUsername || cloudAuth.username,
      email: newEmail || cloudAuth.email,
      passwordHash: newPassword.trim()
    };

    // Save to Cloud Firestore so all other devices receive the update immediately
    try {
      await saveCloudAdminAuth(payload);
    } catch (e) {
      console.warn('Erreur sauvegarde auth Firestore:', e);
    }

    // Also attempt local server if running
    try {
      await fetch('/api/auth/change-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newUsername, newEmail, newPassword })
      });
    } catch {
      // ignore
    }

    localStorage.setItem('horon_admin_creds', JSON.stringify({
      username: payload.username,
      email: payload.email
    }));

    return { success: true, message: 'Mot de passe administrateur mis à jour sur tous les appareils' };
  },

  getCurrentUser(): User | null {
    // Only return session user (cleared when closing tab or returning to portal)
    try {
      const sessionData = sessionStorage.getItem('horon_admin_session');
      if (sessionData) {
        return JSON.parse(sessionData);
      }
    } catch {
      // ignore
    }
    // Clean up any historical permanent localStorage user to prevent visitor access
    localStorage.removeItem(STORAGE_KEYS.USER);
    return null;
  },

  logout() {
    sessionStorage.removeItem('horon_admin_session');
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  // Stats
  async getStats(): Promise<DashboardStats> {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) return await res.json();
    } catch {
      // ignore fallback
    }
    const products = await this.getProducts();
    const announcements = await this.getAnnouncements();
    const media = await this.getMedia();
    const messages = await this.getMessages();
    const orders = await this.getOrders();
    const pendingOrdersCount = orders.filter(o => o.status === 'en_attente' || o.status === 'en_preparation').length;
    const totalRevenue = orders
      .filter(o => o.status !== 'annulee')
      .reduce((sum, o) => sum + (o.total || 0), 0);

    return {
      productsCount: products.length,
      announcementsCount: announcements.length,
      photosCount: media.filter(m => m.type === 'image').length,
      videosCount: media.filter(m => m.type === 'video').length,
      messagesCount: messages.length,
      unreadMessagesCount: messages.filter(m => m.status === 'nouveau').length,
      ordersCount: orders.length,
      pendingOrdersCount,
      totalRevenue
    };
  },

  /* =========================================================
     PRODUCTS - CLOUD FIRESTORE MULTI-DEVICE SYNC
  ========================================================= */
  async getProducts(): Promise<Product[]> {
    // 1. Cloud Firestore (Single Source of Truth across all devices)
    try {
      const cloudProducts = await getCloudProducts();
      if (Array.isArray(cloudProducts) && cloudProducts.length > 0) {
        const filtered = filterDeleted(cloudProducts);
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
        await saveLocalProducts(filtered);
        return filtered;
      }
    } catch (e) {
      console.warn('Erreur lecture cloud Firestore products:', e);
    }

    // 2. Try local server API if running
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const filtered = filterDeleted(data);
          localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
          await saveLocalProducts(filtered);
          return filtered;
        }
      }
    } catch {
      // Vercel / offline
    }
    
    // 3. Permanent IndexedDB
    const idbProducts = await getLocalProducts();
    if (idbProducts && idbProducts.length > 0) {
      const filtered = filterDeleted(idbProducts);
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
      return filtered;
    }

    // 4. LocalStorage fallback
    const cached = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          const filtered = filterDeleted(parsed);
          await saveLocalProducts(filtered);
          return filtered;
        }
      } catch {}
    }

    // 5. Initial baseline - only if not already initialized
    if (typeof window !== 'undefined' && localStorage.getItem('horon_db_initialized')) {
      return [];
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('horon_db_initialized', 'true');
    }
    const filteredBaseline = filterDeleted(initialProducts);
    await saveLocalProducts(filteredBaseline);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filteredBaseline));
    return filteredBaseline;
  },

  async createProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    const newId = 'prod_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const newProd: Product = {
      ...product,
      id: newId,
      createdAt: new Date().toISOString()
    };

    // 1. Save to Cloud Firestore
    try {
      await saveProductToFirestore(newProd);
    } catch (e) {
      console.warn('Note sauvegarde Firestore product (relais local actif):', e);
    }

    // 2. Save to local IndexedDB and cache
    try {
      await saveSingleLocalProduct(newProd);
    } catch {}

    try {
      const cached = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      const currentList: Product[] = cached ? JSON.parse(cached) : [];
      const updated = [newProd, ...currentList.filter(p => p.id !== newId)];
      try {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
      } catch {
        // Safe fallback if localStorage quota reached
      }
    } catch {}

    // 3. Sync with local server
    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProd)
      });
    } catch {}

    return newProd;
  },

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    const current = await this.getProducts();
    const existing = current.find(p => p.id === id);
    const updatedItem: Product = {
      ...(existing || {} as Product),
      ...product,
      id,
      updatedAt: new Date().toISOString(),
      createdAt: existing?.createdAt || new Date().toISOString()
    };

    // 1. Save to Cloud Firestore
    try {
      await saveProductToFirestore(updatedItem);
    } catch (e) {
      console.warn('Erreur mise à jour Firestore product:', e);
    }

    // 2. Update local caches
    await saveSingleLocalProduct(updatedItem);
    const updatedList = current.map(p => p.id === id ? updatedItem : p);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updatedList));

    // 3. Optional local server sync
    try {
      await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem)
      });
    } catch {}

    return updatedItem;
  },

  async deleteProduct(id: string): Promise<boolean> {
    // 0. Track deletion permanently
    await markIdAsDeleted(id);

    // 1. Delete from Cloud Firestore
    try {
      await deleteProductFromFirestore(id);
    } catch (e) {
      console.warn('Erreur suppression Firestore product:', e);
    }

    // 2. Delete from local caches
    await deleteSingleLocalProduct(id);
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((p: Product) => p.id !== id);
          localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
        }
      }
    } catch {}

    // 3. Delete from local server
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
    } catch {}

    return true;
  },

  /* =========================================================
     ANNOUNCEMENTS - CLOUD FIRESTORE MULTI-DEVICE SYNC
  ========================================================= */
  async getAnnouncements(): Promise<Announcement[]> {
    try {
      const cloudAnnouncements = await getCloudAnnouncements();
      if (Array.isArray(cloudAnnouncements) && cloudAnnouncements.length > 0) {
        const filtered = filterDeleted(cloudAnnouncements);
        localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(filtered));
        await saveLocalAnnouncements(filtered);
        return filtered;
      }
    } catch (e) {
      console.warn('Erreur cloud announcements:', e);
    }

    try {
      const res = await fetch('/api/announcements');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const filtered = filterDeleted(data);
          localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(filtered));
          await saveLocalAnnouncements(filtered);
          return filtered;
        }
      }
    } catch {}

    const idbAnnouncements = await getLocalAnnouncements();
    if (idbAnnouncements && idbAnnouncements.length > 0) {
      const filtered = filterDeleted(idbAnnouncements);
      localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(filtered));
      return filtered;
    }

    const cached = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          const filtered = filterDeleted(parsed);
          return filtered;
        }
      } catch {}
    }

    if (typeof window !== 'undefined' && localStorage.getItem('horon_db_initialized')) {
      return [];
    }
    const filteredBaseline = filterDeleted(initialAnnouncements);
    await saveLocalAnnouncements(filteredBaseline);
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(filteredBaseline));
    return filteredBaseline;
  },

  async createAnnouncement(announcement: Omit<Announcement, 'id' | 'createdAt'>): Promise<Announcement> {
    const newId = 'ann_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const newAnn: Announcement = {
      ...announcement,
      id: newId,
      createdAt: new Date().toISOString(),
      date: announcement.date || new Date().toISOString().split('T')[0]
    };

    try {
      await saveAnnouncementToFirestore(newAnn);
    } catch (e) {
      console.warn('Note Firestore create announcement:', e);
    }

    try {
      await saveSingleLocalAnnouncement(newAnn);
    } catch {}

    try {
      const cached = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
      const currentList: Announcement[] = cached ? JSON.parse(cached) : [];
      const updated = [newAnn, ...currentList.filter(a => a.id !== newId)];
      try {
        localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(updated));
      } catch {}
    } catch {}

    try {
      await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAnn)
      });
    } catch {}

    return newAnn;
  },

  async updateAnnouncement(id: string, announcement: Partial<Announcement>): Promise<Announcement> {
    const current = await this.getAnnouncements();
    const existing = current.find(a => a.id === id);
    const updatedItem: Announcement = {
      ...(existing || {} as Announcement),
      ...announcement,
      id,
      updatedAt: new Date().toISOString(),
      createdAt: existing?.createdAt || new Date().toISOString()
    };

    try {
      await saveAnnouncementToFirestore(updatedItem);
    } catch (e) {
      console.warn('Erreur Firestore update announcement:', e);
    }

    await saveSingleLocalAnnouncement(updatedItem);
    const updatedList = current.map(a => a.id === id ? updatedItem : a);
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(updatedList));

    try {
      await fetch(`/api/announcements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem)
      });
    } catch {}

    return updatedItem;
  },

  async deleteAnnouncement(id: string): Promise<boolean> {
    await markIdAsDeleted(id);

    try {
      await deleteAnnouncementFromFirestore(id);
    } catch (e) {
      console.warn('Erreur Firestore delete announcement:', e);
    }

    await deleteSingleLocalAnnouncement(id);
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((a: Announcement) => a.id !== id);
          localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(filtered));
        }
      }
    } catch {}

    try {
      await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
    } catch {}

    return true;
  },

  /* =========================================================
     MEDIA - CLOUD FIRESTORE MULTI-DEVICE SYNC
  ========================================================= */
  async getMedia(): Promise<MediaItem[]> {
    try {
      const cloudMedia = await getCloudMedia();
      if (Array.isArray(cloudMedia)) {
        const filtered = filterDeleted(cloudMedia);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(filtered));
        }
        await saveLocalMedia(filtered);
        return filtered;
      }
    } catch (e) {
      console.warn('Erreur cloud media:', e);
    }

    try {
      const res = await fetch('/api/media');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const filtered = filterDeleted(data);
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(filtered));
          }
          await saveLocalMedia(filtered);
          return filtered;
        }
      }
    } catch {}

    const idbMedia = await getLocalMedia();
    if (Array.isArray(idbMedia)) {
      const filtered = filterDeleted(idbMedia);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(filtered));
      }
      return filtered;
    }

    const cached = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.MEDIA) : null;
    if (cached !== null) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          const filtered = filterDeleted(parsed);
          await saveLocalMedia(filtered);
          return filtered;
        }
      } catch {}
    }

    const filteredBaseline = filterDeleted(initialMedia);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(filteredBaseline));
    }
    await saveLocalMedia(filteredBaseline);
    return filteredBaseline;
  },

  async createMedia(media: Omit<MediaItem, 'id' | 'createdAt'>): Promise<MediaItem> {
    const newId = 'med_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const newMedia: MediaItem = {
      ...media,
      id: newId,
      createdAt: new Date().toISOString(),
      productId: media.productId || media.relatedProductId || undefined,
      announcementId: media.announcementId || media.relatedAnnouncementId || undefined
    };

    try {
      await saveMediaToFirestore(newMedia);
    } catch (e) {
      console.warn('Note Firestore create media:', e);
    }

    try {
      await saveSingleLocalMedia(newMedia);
    } catch {}

    try {
      const cached = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.MEDIA) : null;
      const currentList: MediaItem[] = cached ? JSON.parse(cached) : [];
      const updated = [newMedia, ...currentList.filter(m => m.id !== newId)];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(updated));
        } catch {}
      }
    } catch {}

    try {
      await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMedia)
      });
    } catch {}

    return newMedia;
  },

  async deleteMedia(id: string): Promise<boolean> {
    await markIdAsDeleted(id);

    try {
      await deleteMediaFromFirestore(id);
    } catch (e) {
      console.warn('Erreur Firestore delete media:', e);
    }

    await deleteSingleLocalMedia(id);
    try {
      const cached = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.MEDIA) : null;
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((m: MediaItem) => m.id !== id);
          localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(filtered));
        }
      }
    } catch {}

    try {
      await fetch(`/api/media/${id}`, { method: 'DELETE' });
    } catch {}

    return true;
  },

  async deleteAllMedia(): Promise<boolean> {
    // 1. Get all current media items and mark all IDs as permanently deleted
    try {
      const current = await this.getMedia();
      for (const item of current) {
        if (item && item.id) {
          await markIdAsDeleted(item.id);
          try {
            await deleteMediaFromFirestore(item.id);
          } catch {}
        }
      }
    } catch {}

    // 2. Also ensure all initial baseline media IDs are marked as permanently deleted
    const baselineIds = ['med_1', 'med_2', 'med_3', 'med_4', 'med_5', 'med_6', 'med_7'];
    for (const id of baselineIds) {
      await markIdAsDeleted(id);
      try {
        await deleteMediaFromFirestore(id);
      } catch {}
    }

    // 3. Clear local storage & IndexedDB
    try {
      await saveLocalMedia([]);
    } catch {}
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify([]));
      } catch {}
    }

    // 4. Clear server database
    try {
      await fetch('/api/media', { method: 'DELETE' });
    } catch {}

    return true;
  },

  /* =========================================================
     MESSAGES & COMMANDES - CLOUD FIRESTORE MULTI-DEVICE SYNC
  ========================================================= */
  async getMessages(): Promise<CustomerMessage[]> {
    try {
      const cloudMessages = await getCloudMessages();
      if (Array.isArray(cloudMessages) && cloudMessages.length > 0) {
        const filtered = filterDeleted(cloudMessages);
        localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(filtered));
        await saveLocalMessages(filtered);
        return filtered;
      }
    } catch (e) {
      console.warn('Erreur cloud messages:', e);
    }

    try {
      const res = await fetch('/api/messages');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const filtered = filterDeleted(data);
          localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(filtered));
          await saveLocalMessages(filtered);
          return filtered;
        }
      }
    } catch {}

    const idbMessages = await getLocalMessages();
    if (idbMessages && idbMessages.length > 0) {
      const filtered = filterDeleted(idbMessages);
      return filtered;
    }

    const cached = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          const filtered = filterDeleted(parsed);
          await saveLocalMessages(filtered);
          return filtered;
        }
      } catch {}
    }

    if (typeof window !== 'undefined' && localStorage.getItem('horon_db_initialized')) {
      return [];
    }
    const filteredBaseline = filterDeleted(initialMessages);
    await saveLocalMessages(filteredBaseline);
    return filteredBaseline;
  },

  async sendMessage(name: string, contact: string, message: string, productReference?: string): Promise<CustomerMessage> {
    const newId = 'msg_' + Date.now();
    const newMsg: CustomerMessage = {
      id: newId,
      name,
      contact,
      message,
      productReference,
      status: 'nouveau',
      createdAt: new Date().toISOString()
    };

    try {
      await saveMessageToFirestore(newMsg);
    } catch (e) {
      console.warn('Erreur Firestore send message:', e);
    }

    await saveSingleLocalMessage(newMsg);
    try {
      const current = await this.getMessages();
      const updated = [newMsg, ...current.filter(m => m.id !== newId)];
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(updated));
    } catch {}

    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMsg)
      });
    } catch {}

    return newMsg;
  },

  async toggleMessageStatus(id: string, status?: 'nouveau' | 'lu'): Promise<CustomerMessage> {
    const current = await this.getMessages();
    const existing = current.find(m => m.id === id);
    const targetStatus = status || (existing?.status === 'lu' ? 'nouveau' : 'lu');

    try {
      await updateMessageStatusInFirestore(id, targetStatus);
    } catch (e) {
      console.warn('Erreur Firestore toggle message:', e);
    }

    const updatedItem: CustomerMessage = {
      ...(existing || {} as CustomerMessage),
      id,
      status: targetStatus
    };

    await saveSingleLocalMessage(updatedItem);
    const updatedList = current.map(m => m.id === id ? updatedItem : m);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(updatedList));

    try {
      await fetch(`/api/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus })
      });
    } catch {}

    return updatedItem;
  },

  async deleteMessage(id: string): Promise<boolean> {
    await markIdAsDeleted(id);

    try {
      await deleteMessageFromFirestore(id);
    } catch (e) {
      console.warn('Erreur Firestore delete message:', e);
    }

    await deleteSingleLocalMessage(id);
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((m: CustomerMessage) => m.id !== id);
          localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(filtered));
        }
      }
    } catch {}

    try {
      await fetch(`/api/messages/${id}`, { method: 'DELETE' });
    } catch {}

    return true;
  },

  /* =========================================================
     SETTINGS - CLOUD FIRESTORE MULTI-DEVICE SYNC
  ========================================================= */
  async getSettings(): Promise<CompanySettings> {
    try {
      const cloudSettings = await getCloudSettings();
      if (cloudSettings && cloudSettings.companyName) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(cloudSettings));
        await saveLocalSettings(cloudSettings);
        return cloudSettings;
      }
    } catch (e) {
      console.warn('Erreur cloud settings:', e);
    }

    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data));
        await saveLocalSettings(data);
        return data;
      }
    } catch {}

    const idbSettings = await getLocalSettings();
    if (idbSettings) {
      return idbSettings;
    }

    const cached = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        await saveLocalSettings(parsed);
        return parsed;
      } catch {}
    }

    await saveLocalSettings(initialSettings);
    return initialSettings;
  },

  async updateSettings(settings: Partial<CompanySettings>): Promise<CompanySettings> {
    const current = await this.getSettings();
    const updated: CompanySettings = { ...current, ...settings };

    try {
      await saveSettingsToFirestore(updated);
    } catch (e) {
      console.warn('Erreur Firestore update settings:', e);
    }

    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    await saveLocalSettings(updated);

    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch {}

    return updated;
  },

  /* =========================================================
     HERO BANNERS (DEDICATED CLOUD + LOCAL CACHE SYNC)
  ========================================================= */
  async getHeroBanners(): Promise<PromoBanner[]> {
    try {
      const cloudBanners = await getCloudHeroBanners();
      if (Array.isArray(cloudBanners) && cloudBanners.length > 0) {
        return cloudBanners;
      }
    } catch (e) {
      console.warn('Erreur cloud banners:', e);
    }
    const settings = await this.getSettings();
    return settings.heroBanners || [];
  },

  async saveHeroBanners(banners: PromoBanner[]): Promise<PromoBanner[]> {
    try {
      await saveAllHeroBannersToFirestore(banners);
    } catch (e) {
      console.warn('Erreur Firestore saveAllHeroBanners:', e);
    }

    // Also update settings to guarantee full local/cloud consistency
    await this.updateSettings({ heroBanners: banners });
    return banners;
  },

  async deleteHeroBanner(id: string): Promise<boolean> {
    await markIdAsDeleted(id);
    try {
      await deleteHeroBannerFromFirestore(id);
    } catch (e) {
      console.warn('Erreur Firestore deleteHeroBanner:', e);
    }
    const settings = await this.getSettings();
    const updated = (settings.heroBanners || []).filter(b => b.id !== id);
    await this.updateSettings({ heroBanners: updated });
    return true;
  },

  /* =========================================================
     ORDERS & DELIVERIES (CLOUD + LOCAL PERSISTENCE)
  ========================================================= */
  async getOrders(): Promise<Order[]> {
    // 1. Cloud Firestore (Single Source of Truth across all devices)
    try {
      const cloudOrders = await getCloudOrders();
      if (Array.isArray(cloudOrders) && cloudOrders.length > 0) {
        const filtered = filterDeleted(cloudOrders);
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(filtered));
        await saveLocalOrders(filtered);
        return filtered;
      }
    } catch (e) {
      console.warn('Erreur cloud orders:', e);
    }

    // 2. Try local server API
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const filtered = filterDeleted(data);
          localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(filtered));
          await saveLocalOrders(filtered);
          return filtered;
        }
      }
    } catch {}

    // 3. IndexedDB
    const idbOrders = await getLocalOrders();
    if (idbOrders && idbOrders.length > 0) {
      const filtered = filterDeleted(idbOrders);
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(filtered));
      return filtered;
    }

    // 4. LocalStorage
    const cached = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          const filtered = filterDeleted(parsed);
          await saveLocalOrders(filtered);
          return filtered;
        }
      } catch {}
    }

    if (typeof window !== 'undefined' && localStorage.getItem('horon_db_initialized')) {
      return [];
    }
    const filteredBaseline = filterDeleted(initialOrders);
    await saveLocalOrders(filteredBaseline);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(filteredBaseline));
    return filteredBaseline;
  },

  async createOrder(order: Order): Promise<Order> {
    try {
      await saveOrderToFirestore(order);
    } catch (e) {
      console.warn('Erreur Firestore save order:', e);
    }

    await saveSingleLocalOrder(order);
    const current = await this.getOrders();
    const updated = [order, ...current.filter(o => o.id !== order.id)];
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
    await saveLocalOrders(updated);

    // Also send to express server if online
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
    } catch {}

    return order;
  },

  async updateOrderStatus(
    id: string, 
    status: OrderStatus, 
    paymentStatus?: PaymentStatus
  ): Promise<Order | null> {
    try {
      await updateOrderStatusInFirestore(id, status, paymentStatus);
    } catch (e) {
      console.warn('Erreur Firestore update order status:', e);
    }

    const current = await this.getOrders();
    const index = current.findIndex(o => o.id === id);
    if (index === -1) return null;

    const updatedOrder: Order = {
      ...current[index],
      status,
      ...(paymentStatus ? { paymentStatus } : {}),
      updatedAt: new Date().toISOString()
    };
    current[index] = updatedOrder;
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(current));
    await saveLocalOrders(current);

    try {
      await fetch(`/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, paymentStatus })
      });
    } catch {}

    return updatedOrder;
  },

  async deleteOrder(id: string): Promise<boolean> {
    await markIdAsDeleted(id);

    try {
      await deleteOrderFromFirestore(id);
    } catch (e) {
      console.warn('Erreur Firestore delete order:', e);
    }

    await deleteSingleLocalOrder(id);
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((o: Order) => o.id !== id);
          localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(filtered));
          await saveLocalOrders(filtered);
        }
      }
    } catch {}

    try {
      await fetch(`/api/orders/${id}`, { method: 'DELETE' });
    } catch {}

    return true;
  },

  /* =========================================================
     CUSTOMER REVIEWS & RATINGS (SOCIAL PROOF)
  ========================================================= */
  async getReviews(productId?: string): Promise<ProductReview[]> {
    let allReviews: ProductReview[] = [];

    // 1. Cloud Firestore (Single Source of Truth across all devices)
    try {
      const cloudReviews = await getCloudReviews();
      if (Array.isArray(cloudReviews) && cloudReviews.length > 0) {
        allReviews = filterDeleted(cloudReviews);
        localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(allReviews));
        await saveLocalReviews(allReviews);
        if (productId) {
          return allReviews.filter(r => r.productId === productId);
        }
        return allReviews;
      }
    } catch (e) {
      console.warn('Erreur cloud reviews:', e);
    }

    // 2. Try local server API
    try {
      const res = await fetch('/api/reviews');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          allReviews = filterDeleted(data);
          localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(allReviews));
          await saveLocalReviews(allReviews);
        }
      }
    } catch {}

    // 2. IndexedDB
    if (allReviews.length === 0) {
      const idbReviews = await getLocalReviews();
      if (idbReviews && idbReviews.length > 0) {
        allReviews = filterDeleted(idbReviews);
        localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(allReviews));
      }
    }

    // 3. LocalStorage
    if (allReviews.length === 0) {
      const cached = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            allReviews = filterDeleted(parsed);
            await saveLocalReviews(allReviews);
          }
        } catch {}
      }
    }

    // 4. Default fallback
    if (allReviews.length === 0) {
      if (typeof window !== 'undefined' && localStorage.getItem('horon_db_initialized')) {
        return [];
      }
      allReviews = filterDeleted(initialReviews);
      await saveLocalReviews(allReviews);
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(allReviews));
    }

    if (productId) {
      return allReviews.filter(r => r.productId === productId);
    }
    return allReviews;
  },

  async createReview(review: ProductReview): Promise<ProductReview> {
    try {
      await saveReviewToFirestore(review);
    } catch (e) {
      console.warn('Erreur Firestore save review:', e);
    }

    const current = await this.getReviews();
    const updated = [review, ...current.filter(r => r.id !== review.id)];
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(updated));
    await saveLocalReviews(updated);

    try {
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review)
      });
    } catch {}

    return review;
  },

  async deleteReview(id: string): Promise<boolean> {
    await markIdAsDeleted(id);

    try {
      await deleteReviewFromFirestore(id);
    } catch (e) {
      console.warn('Erreur Firestore delete review:', e);
    }

    await deleteSingleLocalReview(id);
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((r: ProductReview) => r.id !== id);
          localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(filtered));
          await saveLocalReviews(filtered);
        }
      }
    } catch {}

    try {
      await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
    } catch {}

    return true;
  },

  /* =========================================================
     RESET TO INITIAL BASELINE (CLOUD + LOCAL)
  ========================================================= */
  async resetDemoData(): Promise<void> {
    clearDeletedIds();

    try {
      await resetCloudData();
    } catch (e) {
      console.warn('Erreur reset cloud Firestore:', e);
    }

    try {
      await fetch('/api/reset-demo', { method: 'POST' });
    } catch {}

    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(initialProducts));
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(initialAnnouncements));
    localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(initialMedia));
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(initialMessages));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(initialSettings));

    await saveLocalProducts(initialProducts);
    await saveLocalAnnouncements(initialAnnouncements);
    await saveLocalMedia(initialMedia);
    await saveLocalMessages(initialMessages);
    await saveLocalSettings(initialSettings);
  }
};
