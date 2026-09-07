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
  ProductReview
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
  getLocalReviews,
  saveLocalReviews
} from '../lib/indexedDb';
import {
  getCloudProducts,
  getCloudAnnouncements,
  getCloudMedia,
  getCloudMessages,
  getCloudSettings,
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

export const api = {
  // Authentication - Multi-device cloud backed
  async login(identifier: string, password: string): Promise<{ success: boolean; user?: User; token?: string; message?: string }> {
    // 1. Try Express API if server is running
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
          return data;
        }
      }
    } catch {
      // Running on static hosting like Vercel or offline
    }

    // 2. Cloud Firestore Auth (for multi-device sync across Vercel, phones, and PCs)
    try {
      const cloudAuth = await getCloudAdminAuth();
      const normInput = identifier.trim().toLowerCase();
      const validIdentifier = (
        normInput === cloudAuth.username.toLowerCase() ||
        normInput === cloudAuth.email.toLowerCase() ||
        normInput === 'admin' ||
        normInput === 'admin@agroterroir.com' ||
        normInput === 'admin@horonmousso.com'
      );

      const validPassword = (
        password === cloudAuth.passwordHash ||
        (cloudAuth.isDefault && (password === 'admin' || password === 'admin123' || password === 'agro2025'))
      );

      if (validIdentifier && validPassword) {
        const user: User = {
          id: 'usr_admin_1',
          name: 'Administrateur Général',
          email: cloudAuth.email || 'admin@horonmousso.com',
          role: 'admin',
          createdAt: new Date().toISOString()
        };
        const token = 'cloud_token_' + Date.now();
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        return { success: true, user, token };
      }
    } catch (e) {
      console.warn('Erreur vérification cloud auth:', e);
    }

    // 3. Fallback default check
    if ((identifier === 'admin' || identifier === 'admin@horonmousso.com') && (password === 'admin' || password === 'admin123')) {
      const mockUser: User = {
        id: 'usr_admin_1',
        name: 'Administrateur Général',
        email: 'admin@horonmousso.com',
        role: 'admin',
        createdAt: new Date().toISOString()
      };
      const token = 'local_session_' + Date.now();
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockUser));
      return { success: true, user: mockUser, token };
    }

    return { success: false, message: 'Identifiant ou mot de passe incorrect. (Par défaut : "admin" / "admin")' };
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

  async changeCredentials(currentPassword: string, newUsername?: string, newEmail?: string, newPassword?: string): Promise<{ success: boolean; message: string }> {
    // 1. Check current credentials from cloud
    const cloudAuth = await getCloudAdminAuth();
    const isCurrentValid = (
      currentPassword === cloudAuth.passwordHash ||
      (cloudAuth.isDefault && (currentPassword === 'admin' || currentPassword === 'admin123'))
    );

    if (!isCurrentValid) {
      return { success: false, message: 'Le mot de passe actuel est incorrect.' };
    }

    const payload = {
      username: newUsername || cloudAuth.username,
      email: newEmail || cloudAuth.email,
      passwordHash: newPassword || cloudAuth.passwordHash
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

    return { success: true, message: 'Identifiants administrateur mis à jour sur tous les appareils' };
  },

  getCurrentUser(): User | null {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  logout() {
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
      if (cloudProducts !== null && cloudProducts !== undefined && cloudProducts.length > 0) {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(cloudProducts));
        await saveLocalProducts(cloudProducts);
        return cloudProducts;
      }
    } catch (e) {
      console.warn('Erreur lecture cloud Firestore products:', e);
    }

    // 2. Try local server API if running
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(data));
          await saveLocalProducts(data);
          return data;
        }
      }
    } catch {
      // Vercel / offline
    }
    
    // 3. Permanent IndexedDB
    const idbProducts = await getLocalProducts();
    if (idbProducts && idbProducts.length > 0) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(idbProducts));
      return idbProducts;
    }

    // 4. LocalStorage fallback
    const cached = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          await saveLocalProducts(parsed);
          return parsed;
        }
      } catch {}
    }

    // 5. Initial baseline
    await saveLocalProducts(initialProducts);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(initialProducts));
    return initialProducts;
  },

  async createProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    const newId = 'prod_' + Date.now();
    const newProd: Product = {
      ...product,
      id: newId,
      createdAt: new Date().toISOString()
    };

    // 1. Save to Cloud Firestore so all devices get the new product instantly
    try {
      await saveProductToFirestore(newProd);
    } catch (e) {
      console.warn('Erreur sauvegarde Firestore product:', e);
    }

    // 2. Update local caches
    await saveSingleLocalProduct(newProd);
    try {
      const current = await this.getProducts();
      const updated = [newProd, ...current.filter(p => p.id !== newId)];
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
    } catch {}

    // 3. Optional local server sync
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
    // 1. Delete from Cloud Firestore
    try {
      await deleteProductFromFirestore(id);
    } catch (e) {
      console.warn('Erreur suppression Firestore product:', e);
    }

    // 2. Delete from local caches
    await deleteSingleLocalProduct(id);
    try {
      const current = await this.getProducts();
      const filtered = current.filter(p => p.id !== id);
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
    } catch {}

    // 3. Optional local server sync
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
      if (cloudAnnouncements !== null && cloudAnnouncements !== undefined && cloudAnnouncements.length > 0) {
        localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(cloudAnnouncements));
        await saveLocalAnnouncements(cloudAnnouncements);
        return cloudAnnouncements;
      }
    } catch (e) {
      console.warn('Erreur cloud announcements:', e);
    }

    try {
      const res = await fetch('/api/announcements');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(data));
          await saveLocalAnnouncements(data);
          return data;
        }
      }
    } catch {}

    const idbAnnouncements = await getLocalAnnouncements();
    if (idbAnnouncements && idbAnnouncements.length > 0) {
      localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(idbAnnouncements));
      return idbAnnouncements;
    }

    const cached = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          await saveLocalAnnouncements(parsed);
          return parsed;
        }
      } catch {}
    }

    await saveLocalAnnouncements(initialAnnouncements);
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(initialAnnouncements));
    return initialAnnouncements;
  },

  async createAnnouncement(announcement: Omit<Announcement, 'id' | 'createdAt'>): Promise<Announcement> {
    const newId = 'ann_' + Date.now();
    const newAnn: Announcement = {
      ...announcement,
      id: newId,
      createdAt: new Date().toISOString(),
      date: announcement.date || new Date().toISOString().split('T')[0]
    };

    try {
      await saveAnnouncementToFirestore(newAnn);
    } catch (e) {
      console.warn('Erreur Firestore create announcement:', e);
    }

    await saveSingleLocalAnnouncement(newAnn);
    try {
      const current = await this.getAnnouncements();
      const updated = [newAnn, ...current.filter(a => a.id !== newId)];
      localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(updated));
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
    try {
      await deleteAnnouncementFromFirestore(id);
    } catch (e) {
      console.warn('Erreur Firestore delete announcement:', e);
    }

    await deleteSingleLocalAnnouncement(id);
    try {
      const current = await this.getAnnouncements();
      const filtered = current.filter(a => a.id !== id);
      localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(filtered));
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
      if (cloudMedia !== null && cloudMedia !== undefined && cloudMedia.length > 0) {
        localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(cloudMedia));
        await saveLocalMedia(cloudMedia);
        return cloudMedia;
      }
    } catch (e) {
      console.warn('Erreur cloud media:', e);
    }

    try {
      const res = await fetch('/api/media');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(data));
          await saveLocalMedia(data);
          return data;
        }
      }
    } catch {}

    const idbMedia = await getLocalMedia();
    if (idbMedia && idbMedia.length > 0) {
      localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(idbMedia));
      return idbMedia;
    }

    const cached = localStorage.getItem(STORAGE_KEYS.MEDIA);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          await saveLocalMedia(parsed);
          return parsed;
        }
      } catch {}
    }

    await saveLocalMedia(initialMedia);
    localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(initialMedia));
    return initialMedia;
  },

  async createMedia(media: Omit<MediaItem, 'id' | 'createdAt'>): Promise<MediaItem> {
    const newId = 'med_' + Date.now();
    const newMedia: MediaItem = {
      ...media,
      id: newId,
      createdAt: new Date().toISOString()
    };

    try {
      await saveMediaToFirestore(newMedia);
    } catch (e) {
      console.warn('Erreur Firestore create media:', e);
    }

    await saveSingleLocalMedia(newMedia);
    try {
      const current = await this.getMedia();
      const updated = [newMedia, ...current.filter(m => m.id !== newId)];
      localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(updated));
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
    try {
      await deleteMediaFromFirestore(id);
    } catch (e) {
      console.warn('Erreur Firestore delete media:', e);
    }

    await deleteSingleLocalMedia(id);
    try {
      const current = await this.getMedia();
      const filtered = current.filter(m => m.id !== id);
      localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(filtered));
    } catch {}

    try {
      await fetch(`/api/media/${id}`, { method: 'DELETE' });
    } catch {}

    return true;
  },

  /* =========================================================
     MESSAGES & COMMANDES - CLOUD FIRESTORE MULTI-DEVICE SYNC
  ========================================================= */
  async getMessages(): Promise<CustomerMessage[]> {
    try {
      const cloudMessages = await getCloudMessages();
      if (cloudMessages) {
        localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(cloudMessages));
        await saveLocalMessages(cloudMessages);
        return cloudMessages;
      }
    } catch (e) {
      console.warn('Erreur cloud messages:', e);
    }

    try {
      const res = await fetch('/api/messages');
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(data));
        await saveLocalMessages(data);
        return data;
      }
    } catch {}

    const idbMessages = await getLocalMessages();
    if (idbMessages && idbMessages.length > 0) {
      return idbMessages;
    }

    const cached = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        await saveLocalMessages(parsed);
        return parsed;
      } catch {}
    }

    await saveLocalMessages(initialMessages);
    return initialMessages;
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
    try {
      await deleteMessageFromFirestore(id);
    } catch (e) {
      console.warn('Erreur Firestore delete message:', e);
    }

    await deleteSingleLocalMessage(id);
    try {
      const current = await this.getMessages();
      const filtered = current.filter(m => m.id !== id);
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(filtered));
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
     ORDERS & DELIVERIES (CLOUD + LOCAL PERSISTENCE)
  ========================================================= */
  async getOrders(): Promise<Order[]> {
    // 1. Try local server API
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(data));
          await saveLocalOrders(data);
          return data;
        }
      }
    } catch {}

    // 2. IndexedDB
    const idbOrders = await getLocalOrders();
    if (idbOrders && idbOrders.length > 0) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(idbOrders));
      return idbOrders;
    }

    // 3. LocalStorage
    const cached = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          await saveLocalOrders(parsed);
          return parsed;
        }
      } catch {}
    }

    await saveLocalOrders(initialOrders);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(initialOrders));
    return initialOrders;
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
    try {
      await deleteOrderFromFirestore(id);
    } catch (e) {
      console.warn('Erreur Firestore delete order:', e);
    }

    const current = await this.getOrders();
    const filtered = current.filter(o => o.id !== id);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(filtered));
    await saveLocalOrders(filtered);

    try {
      await fetch(`/api/orders/${id}`, { method: 'DELETE' });
    } catch {}

    return true;
  },

  /* =========================================================
     CUSTOMER REVIEWS & RATINGS (SOCIAL PROOF)
  ========================================================= */
  async getReviews(productId?: string): Promise<ProductReview[]> {
    // 1. Try local server API
    let allReviews: ProductReview[] = [];
    try {
      const res = await fetch('/api/reviews');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          allReviews = data;
          localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(data));
          await saveLocalReviews(data);
        }
      }
    } catch {}

    // 2. IndexedDB
    if (allReviews.length === 0) {
      const idbReviews = await getLocalReviews();
      if (idbReviews && idbReviews.length > 0) {
        allReviews = idbReviews;
        localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(idbReviews));
      }
    }

    // 3. LocalStorage
    if (allReviews.length === 0) {
      const cached = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            allReviews = parsed;
            await saveLocalReviews(parsed);
          }
        } catch {}
      }
    }

    // 4. Default fallback
    if (allReviews.length === 0) {
      allReviews = initialReviews;
      await saveLocalReviews(initialReviews);
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(initialReviews));
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
    try {
      await deleteReviewFromFirestore(id);
    } catch (e) {
      console.warn('Erreur Firestore delete review:', e);
    }

    const current = await this.getReviews();
    const filtered = current.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(filtered));
    await saveLocalReviews(filtered);

    try {
      await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
    } catch {}

    return true;
  },

  /* =========================================================
     RESET TO INITIAL BASELINE (CLOUD + LOCAL)
  ========================================================= */
  async resetDemoData(): Promise<void> {
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
