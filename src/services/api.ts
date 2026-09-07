import { 
  Product, 
  Announcement, 
  MediaItem, 
  CustomerMessage, 
  CompanySettings, 
  DashboardStats, 
  User 
} from '../types';
import { 
  initialProducts, 
  initialAnnouncements, 
  initialMedia, 
  initialMessages, 
  initialSettings 
} from '../data/initialData';
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
  saveLocalSettings
} from '../lib/indexedDb';

const STORAGE_KEYS = {
  PRODUCTS: 'agro_products_cache',
  ANNOUNCEMENTS: 'agro_announcements_cache',
  MEDIA: 'agro_media_cache',
  MESSAGES: 'agro_messages_cache',
  SETTINGS: 'agro_settings_cache',
  TOKEN: 'agro_admin_token',
  USER: 'agro_admin_user'
};

export const api = {
  // Authentication
  async login(identifier: string, password: string): Promise<{ success: boolean; user?: User; token?: string; message?: string }> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
        return data;
      }
      return { success: false, message: data.message || 'Identifiants invalides' };
    } catch {
      // Fallback local auth for resilience
      const validUser = (identifier === 'admin@agroterroir.com' || identifier === 'admin');
      const validPass = (password === 'admin' || password === 'admin123' || password === 'agro2025');
      if (validUser && validPass) {
        const mockUser: User = {
          id: 'usr_admin_1',
          name: 'Administrateur Général',
          email: 'admin@agroterroir.com',
          role: 'admin',
          createdAt: new Date().toISOString()
        };
        const token = 'local_session_' + Date.now();
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockUser));
        return { success: true, user: mockUser, token };
      }
      return { success: false, message: 'Identifiant ou mot de passe incorrect. (Démo: "admin" / "admin")' };
    }
  },

  async getAuthStatus(): Promise<{ isDefault: boolean; username: string; email: string; updatedAt?: string }> {
    try {
      const res = await fetch('/api/auth/status');
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // ignore
    }
    const savedCreds = localStorage.getItem('horon_admin_creds');
    if (savedCreds) {
      try {
        const parsed = JSON.parse(savedCreds);
        return { isDefault: false, username: parsed.username, email: parsed.email };
      } catch {
        // ignore
      }
    }
    return { isDefault: true, username: 'admin', email: 'admin@horonmousso.com' };
  },

  async changeCredentials(currentPassword: string, newUsername?: string, newEmail?: string, newPassword?: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch('/api/auth/change-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newUsername, newEmail, newPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('horon_admin_creds', JSON.stringify({
          username: newUsername,
          email: newEmail
        }));
        return { success: true, message: data.message || 'Identifiants modifiés avec succès' };
      }
      return { success: false, message: data.message || 'Erreur lors du changement d\'identifiants' };
    } catch {
      // Local fallback
      if (currentPassword === 'admin' || currentPassword === 'admin123') {
        localStorage.setItem('horon_admin_creds', JSON.stringify({
          username: newUsername || 'admin',
          email: newEmail || 'admin@horonmousso.com'
        }));
        return { success: true, message: 'Identifiants administrateur mis à jour' };
      }
      return { success: false, message: 'Le mot de passe actuel est incorrect.' };
    }
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
    return {
      productsCount: products.length,
      announcementsCount: announcements.length,
      photosCount: media.filter(m => m.type === 'image').length,
      videosCount: media.filter(m => m.type === 'video').length,
      messagesCount: messages.length,
      unreadMessagesCount: messages.filter(m => m.status === 'nouveau').length
    };
  },

  // Products with IndexedDB permanent local storage
  async getProducts(): Promise<Product[]> {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(data));
        await saveLocalProducts(data);
        return data;
      }
    } catch {
      // offline or server unavailable
    }
    
    // 1. Check Permanent IndexedDB
    const idbProducts = await getLocalProducts();
    if (idbProducts && idbProducts.length > 0) {
      return idbProducts;
    }

    // 2. Check localStorage fallback
    const cached = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        await saveLocalProducts(parsed);
        return parsed;
      } catch {}
    }

    // 3. Initial baseline
    await saveLocalProducts(initialProducts);
    return initialProducts;
  },

  async createProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      if (res.ok) {
        const created = await res.json();
        await saveSingleLocalProduct(created);
        return created;
      }
    } catch {
      // fallback
    }
    const current = await this.getProducts();
    const newProd: Product = {
      ...product,
      id: 'prod_' + Date.now(),
      createdAt: new Date().toISOString()
    };
    const updated = [newProd, ...current];
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
    await saveSingleLocalProduct(newProd);
    return newProd;
  },

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      if (res.ok) {
        const updated = await res.json();
        await saveSingleLocalProduct(updated);
        return updated;
      }
    } catch {
      // fallback
    }
    const current = await this.getProducts();
    const idx = current.findIndex(p => p.id === id);
    if (idx !== -1) {
      const updatedItem = { ...current[idx], ...product, updatedAt: new Date().toISOString() };
      current[idx] = updatedItem;
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(current));
      await saveSingleLocalProduct(updatedItem);
      return updatedItem;
    }
    throw new Error('Produit introuvable');
  },

  async deleteProduct(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await deleteSingleLocalProduct(id);
        return true;
      }
    } catch {
      // fallback
    }
    const current = await this.getProducts();
    const filtered = current.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
    await deleteSingleLocalProduct(id);
    return true;
  },

  // Announcements with IndexedDB permanent local storage
  async getAnnouncements(): Promise<Announcement[]> {
    try {
      const res = await fetch('/api/announcements');
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(data));
        await saveLocalAnnouncements(data);
        return data;
      }
    } catch {
      // fallback
    }

    const idbAnnouncements = await getLocalAnnouncements();
    if (idbAnnouncements && idbAnnouncements.length > 0) {
      return idbAnnouncements;
    }

    const cached = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        await saveLocalAnnouncements(parsed);
        return parsed;
      } catch {}
    }

    await saveLocalAnnouncements(initialAnnouncements);
    return initialAnnouncements;
  },

  async createAnnouncement(announcement: Omit<Announcement, 'id' | 'createdAt'>): Promise<Announcement> {
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(announcement)
      });
      if (res.ok) {
        const created = await res.json();
        await saveSingleLocalAnnouncement(created);
        return created;
      }
    } catch {
      // fallback
    }
    const current = await this.getAnnouncements();
    const newAnn: Announcement = {
      ...announcement,
      id: 'ann_' + Date.now(),
      createdAt: new Date().toISOString()
    };
    const updated = [newAnn, ...current];
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(updated));
    await saveSingleLocalAnnouncement(newAnn);
    return newAnn;
  },

  async updateAnnouncement(id: string, announcement: Partial<Announcement>): Promise<Announcement> {
    try {
      const res = await fetch(`/api/announcements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(announcement)
      });
      if (res.ok) {
        const updated = await res.json();
        await saveSingleLocalAnnouncement(updated);
        return updated;
      }
    } catch {
      // fallback
    }
    const current = await this.getAnnouncements();
    const idx = current.findIndex(a => a.id === id);
    if (idx !== -1) {
      const updatedItem = { ...current[idx], ...announcement, updatedAt: new Date().toISOString() };
      current[idx] = updatedItem;
      localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(current));
      await saveSingleLocalAnnouncement(updatedItem);
      return updatedItem;
    }
    throw new Error('Annonce introuvable');
  },

  async deleteAnnouncement(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await deleteSingleLocalAnnouncement(id);
        return true;
      }
    } catch {
      // fallback
    }
    const current = await this.getAnnouncements();
    const filtered = current.filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(filtered));
    await deleteSingleLocalAnnouncement(id);
    return true;
  },

  // Media with IndexedDB permanent local storage
  async getMedia(): Promise<MediaItem[]> {
    try {
      const res = await fetch('/api/media');
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(data));
        await saveLocalMedia(data);
        return data;
      }
    } catch {
      // fallback
    }

    const idbMedia = await getLocalMedia();
    if (idbMedia && idbMedia.length > 0) {
      return idbMedia;
    }

    const cached = localStorage.getItem(STORAGE_KEYS.MEDIA);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        await saveLocalMedia(parsed);
        return parsed;
      } catch {}
    }

    await saveLocalMedia(initialMedia);
    return initialMedia;
  },

  async createMedia(media: Omit<MediaItem, 'id' | 'createdAt'>): Promise<MediaItem> {
    try {
      const res = await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(media)
      });
      if (res.ok) {
        const created = await res.json();
        await saveSingleLocalMedia(created);
        return created;
      }
    } catch {
      // fallback
    }
    const current = await this.getMedia();
    const newMedia: MediaItem = {
      ...media,
      id: 'med_' + Date.now(),
      createdAt: new Date().toISOString()
    };
    const updated = [newMedia, ...current];
    localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(updated));
    await saveSingleLocalMedia(newMedia);
    return newMedia;
  },

  async deleteMedia(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/media/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await deleteSingleLocalMedia(id);
        return true;
      }
    } catch {
      // fallback
    }
    const current = await this.getMedia();
    const filtered = current.filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(filtered));
    await deleteSingleLocalMedia(id);
    return true;
  },

  // Messages with IndexedDB permanent local storage
  async getMessages(): Promise<CustomerMessage[]> {
    try {
      const res = await fetch('/api/messages');
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(data));
        await saveLocalMessages(data);
        return data;
      }
    } catch {
      // fallback
    }

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
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, contact, message, productReference })
      });
      if (res.ok) {
        const created = await res.json();
        await saveSingleLocalMessage(created);
        return created;
      }
    } catch {
      // fallback
    }
    const current = await this.getMessages();
    const newMsg: CustomerMessage = {
      id: 'msg_' + Date.now(),
      name,
      contact,
      message,
      productReference,
      status: 'nouveau',
      createdAt: new Date().toISOString()
    };
    const updated = [newMsg, ...current];
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(updated));
    await saveSingleLocalMessage(newMsg);
    return newMsg;
  },

  async toggleMessageStatus(id: string, status?: 'nouveau' | 'lu'): Promise<CustomerMessage> {
    try {
      const res = await fetch(`/api/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        const updated = await res.json();
        await saveSingleLocalMessage(updated);
        return updated;
      }
    } catch {
      // fallback
    }
    const current = await this.getMessages();
    const idx = current.findIndex(m => m.id === id);
    if (idx !== -1) {
      current[idx].status = status || (current[idx].status === 'nouveau' ? 'lu' : 'nouveau');
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(current));
      await saveSingleLocalMessage(current[idx]);
      return current[idx];
    }
    throw new Error('Message introuvable');
  },

  async deleteMessage(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/messages/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await deleteSingleLocalMessage(id);
        return true;
      }
    } catch {
      // fallback
    }
    const current = await this.getMessages();
    const filtered = current.filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(filtered));
    await deleteSingleLocalMessage(id);
    return true;
  },

  // Settings with IndexedDB permanent local storage
  async getSettings(): Promise<CompanySettings> {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data));
        await saveLocalSettings(data);
        return data;
      }
    } catch {
      // fallback
    }

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
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        const updated = await res.json();
        await saveLocalSettings(updated);
        return updated;
      }
    } catch {
      // fallback
    }
    const current = await this.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    await saveLocalSettings(updated);
    return updated;
  },

  async resetDemoData(): Promise<void> {
    try {
      await fetch('/api/reset-demo', { method: 'POST' });
    } catch {
      // fallback
    }
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
