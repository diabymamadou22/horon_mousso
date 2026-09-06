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

  // Products
  async getProducts(): Promise<Product[]> {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(data));
        return data;
      }
    } catch {
      // fallback
    }
    const cached = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return cached ? JSON.parse(cached) : initialProducts;
  },

  async createProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      if (res.ok) return await res.json();
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
    return newProd;
  },

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    const current = await this.getProducts();
    const idx = current.findIndex(p => p.id === id);
    if (idx !== -1) {
      current[idx] = { ...current[idx], ...product, updatedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(current));
      return current[idx];
    }
    throw new Error('Produit introuvable');
  },

  async deleteProduct(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) return true;
    } catch {
      // fallback
    }
    const current = await this.getProducts();
    const filtered = current.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
    return true;
  },

  // Announcements
  async getAnnouncements(): Promise<Announcement[]> {
    try {
      const res = await fetch('/api/announcements');
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(data));
        return data;
      }
    } catch {
      // fallback
    }
    const cached = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
    return cached ? JSON.parse(cached) : initialAnnouncements;
  },

  async createAnnouncement(announcement: Omit<Announcement, 'id' | 'createdAt'>): Promise<Announcement> {
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(announcement)
      });
      if (res.ok) return await res.json();
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
    return newAnn;
  },

  async updateAnnouncement(id: string, announcement: Partial<Announcement>): Promise<Announcement> {
    try {
      const res = await fetch(`/api/announcements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(announcement)
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    const current = await this.getAnnouncements();
    const idx = current.findIndex(a => a.id === id);
    if (idx !== -1) {
      current[idx] = { ...current[idx], ...announcement, updatedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(current));
      return current[idx];
    }
    throw new Error('Annonce introuvable');
  },

  async deleteAnnouncement(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
      if (res.ok) return true;
    } catch {
      // fallback
    }
    const current = await this.getAnnouncements();
    const filtered = current.filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(filtered));
    return true;
  },

  // Media
  async getMedia(): Promise<MediaItem[]> {
    try {
      const res = await fetch('/api/media');
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(data));
        return data;
      }
    } catch {
      // fallback
    }
    const cached = localStorage.getItem(STORAGE_KEYS.MEDIA);
    return cached ? JSON.parse(cached) : initialMedia;
  },

  async createMedia(media: Omit<MediaItem, 'id' | 'createdAt'>): Promise<MediaItem> {
    try {
      const res = await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(media)
      });
      if (res.ok) return await res.json();
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
    return newMedia;
  },

  async deleteMedia(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/media/${id}`, { method: 'DELETE' });
      if (res.ok) return true;
    } catch {
      // fallback
    }
    const current = await this.getMedia();
    const filtered = current.filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(filtered));
    return true;
  },

  // Messages
  async getMessages(): Promise<CustomerMessage[]> {
    try {
      const res = await fetch('/api/messages');
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(data));
        return data;
      }
    } catch {
      // fallback
    }
    const cached = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    return cached ? JSON.parse(cached) : initialMessages;
  },

  async sendMessage(name: string, contact: string, message: string, productReference?: string): Promise<CustomerMessage> {
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, contact, message, productReference })
      });
      if (res.ok) return await res.json();
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
    return newMsg;
  },

  async toggleMessageStatus(id: string, status?: 'nouveau' | 'lu'): Promise<CustomerMessage> {
    try {
      const res = await fetch(`/api/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    const current = await this.getMessages();
    const idx = current.findIndex(m => m.id === id);
    if (idx !== -1) {
      current[idx].status = status || (current[idx].status === 'nouveau' ? 'lu' : 'nouveau');
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(current));
      return current[idx];
    }
    throw new Error('Message introuvable');
  },

  async deleteMessage(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/messages/${id}`, { method: 'DELETE' });
      if (res.ok) return true;
    } catch {
      // fallback
    }
    const current = await this.getMessages();
    const filtered = current.filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(filtered));
    return true;
  },

  // Settings
  async getSettings(): Promise<CompanySettings> {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data));
        return data;
      }
    } catch {
      // fallback
    }
    const cached = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return cached ? JSON.parse(cached) : initialSettings;
  },

  async updateSettings(settings: Partial<CompanySettings>): Promise<CompanySettings> {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    const current = await this.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
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
  }
};
