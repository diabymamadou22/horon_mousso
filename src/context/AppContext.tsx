import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { 
  Product, 
  Announcement, 
  MediaItem, 
  CustomerMessage, 
  CompanySettings, 
  DashboardStats, 
  User,
  CartItem,
  SyncStatus 
} from '../types';
import { api } from '../services/api';
import { initialSettings } from '../data/initialData';
import { parsePriceToNumber, formatFCFA } from '../utils/cartUtils';
import {
  getLocalProducts,
  saveLocalProducts,
  getLocalAnnouncements,
  saveLocalAnnouncements,
  getLocalMedia,
  saveLocalMedia,
  getLocalMessages,
  saveLocalMessages,
  getLocalSettings,
  saveLocalSettings,
  getLocalCart,
  saveLocalCart,
  saveOfflineOrder
} from '../lib/indexedDb';
import {
  seedFirestoreIfEmpty,
  subscribeToCloudProducts,
  subscribeToCloudAnnouncements,
  subscribeToCloudMedia,
  subscribeToCloudMessages,
  subscribeToCloudSettings,
  saveProductToFirestore,
  deleteProductFromFirestore,
  saveAnnouncementToFirestore,
  deleteAnnouncementFromFirestore,
  saveMediaToFirestore,
  deleteMediaFromFirestore,
  saveMessageToFirestore,
  updateMessageStatusInFirestore,
  deleteMessageFromFirestore,
  saveSettingsToFirestore
} from '../lib/firebase';

export type PublicTab = 'accueil' | 'produits' | 'actualites' | 'galerie' | 'a_propos' | 'contact';
export type AdminTab = 'dashboard' | 'produits' | 'annonces' | 'medias' | 'messages' | 'parametres';

interface Toast {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
}

interface CustomerOrderDetails {
  name: string;
  phone: string;
  address: string;
  deliveryType: 'livraison' | 'retrait';
  paymentMethod: string;
  notes?: string;
}

interface AppContextType {
  // Public data
  products: Product[];
  announcements: Announcement[];
  media: MediaItem[];
  messages: CustomerMessage[];
  settings: CompanySettings;
  stats: DashboardStats | null;
  isLoading: boolean;

  // Shopping Cart
  cart: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number, format?: string) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotalCount: number;
  cartTotalAmount: number;
  submitCartOrderWhatsApp: (details: CustomerOrderDetails) => Promise<boolean>;

  // Public navigation
  activeTab: PublicTab;
  setActiveTab: (tab: PublicTab) => void;
  selectedProductId: string | null;
  openProductDetail: (id: string) => void;
  closeProductDetail: () => void;
  selectedAnnouncementId: string | null;
  openAnnouncementDetail: (id: string) => void;
  closeAnnouncementDetail: () => void;
  selectedMedia: MediaItem | null;
  openMediaPreview: (media: MediaItem | null) => void;

  // Admin state & navigation
  isAdminMode: boolean;
  setIsAdminMode: (isOpen: boolean) => void;
  adminTab: AdminTab;
  setAdminTab: (tab: AdminTab) => void;
  currentUser: User | null;
  login: (id: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  authStatus: { isDefault: boolean; username: string; email: string } | null;
  changeAdminCredentials: (currentPass: string, newUsername?: string, newEmail?: string, newPass?: string) => Promise<{ success: boolean; message: string }>;

  // CRUD actions
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<Product>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<boolean>;

  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'createdAt'>) => Promise<Announcement>;
  updateAnnouncement: (id: string, announcement: Partial<Announcement>) => Promise<Announcement>;
  deleteAnnouncement: (id: string) => Promise<boolean>;

  addMedia: (media: Omit<MediaItem, 'id' | 'createdAt'>) => Promise<MediaItem>;
  deleteMedia: (id: string) => Promise<boolean>;

  sendContactMessage: (name: string, contact: string, message: string, productRef?: string) => Promise<boolean>;
  toggleMessageStatus: (id: string) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;

  updateSettings: (newSettings: Partial<CompanySettings>) => Promise<void>;
  resetDemoData: () => Promise<void>;

  // Multi-Device & Offline/Online Sync State
  syncStatus: SyncStatus;
  forceSync: () => Promise<void>;

  // Toasts
  toasts: Toast[];
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Helpers
  openOrderWhatsApp: (product?: Product) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [messages, setMessages] = useState<CustomerMessage[]>([]);
  const [settings, setSettings] = useState<CompanySettings>(initialSettings);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Multi-Device & Online/Offline Database Sync State
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    cloudConnected: false,
    localCacheActive: true,
    lastSyncTime: null,
    mode: 'cloud_and_local'
  });

  // Cart State
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('horon_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Initial load from permanent IndexedDB for cart
  useEffect(() => {
    getLocalCart().then(cachedCart => {
      if (cachedCart && cachedCart.length > 0) {
        setCart(cachedCart);
      }
    }).catch(err => console.warn('IndexedDB cart load fallback:', err));
  }, []);

  // Sync cart to permanent IndexedDB and localStorage
  useEffect(() => {
    try {
      localStorage.setItem('horon_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Erreur sauvegarde panier local:', e);
    }
    saveLocalCart(cart).catch(err => console.warn('IndexedDB cart save fallback:', err));
  }, [cart]);

  // Auth Security Status
  const [authStatus, setAuthStatus] = useState<{ isDefault: boolean; username: string; email: string } | null>(null);

  const checkAuthStatus = useCallback(async () => {
    try {
      const status = await api.getAuthStatus();
      setAuthStatus(status);
    } catch (err) {
      console.error('Erreur auth status:', err);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Cart calculation
  const cartTotalCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const cartTotalAmount = useMemo(() => {
    return cart.reduce((total, item) => total + (item.unitPriceNumeric * item.quantity), 0);
  }, [cart]);

  const addToCart = (product: Product, quantity: number = 1, format?: string) => {
    const chosenFormat = format || product.format?.split(',')[0]?.trim() || 'Standard';
    const itemId = `${product.id}_${chosenFormat.replace(/\s+/g, '_')}`;
    const unitPrice = parsePriceToNumber(product.price);

    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.id === itemId);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity
        };
        return next;
      } else {
        return [
          ...prev,
          {
            id: itemId,
            productId: product.id,
            product,
            format: chosenFormat,
            quantity,
            unitPriceNumeric: unitPrice
          }
        ];
      }
    });

    showToast(`« ${product.name} » ajouté au panier (${quantity}x)`, 'success');
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
    showToast('Article retiré du panier', 'info');
  };

  const updateCartQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart(prev => prev.map(item => item.id === cartItemId ? { ...item, quantity } : item));
  };

  const clearCart = () => {
    setCart([]);
    try {
      localStorage.removeItem('horon_cart');
    } catch {
      // ignore
    }
  };

  // Submit order via WhatsApp and save to customer messages
  const submitCartOrderWhatsApp = async (details: CustomerOrderDetails): Promise<boolean> => {
    if (cart.length === 0) {
      showToast('Votre panier est vide', 'error');
      return false;
    }

    const rawNumber = settings.whatsapp || settings.phone || '';
    const cleanNumber = rawNumber.replace(/[^0-9]/g, '');

    const itemsSummary = cart.map((item, idx) => {
      const pricePart = item.unitPriceNumeric > 0 ? ` : ${formatFCFA(item.unitPriceNumeric * item.quantity)}` : '';
      return `${idx + 1}. *${item.quantity}x ${item.product.name}* (${item.format})${pricePart}`;
    }).join('\n');

    const totalStr = cartTotalAmount > 0 ? `\n*Total estimé :* ${formatFCFA(cartTotalAmount)}` : '';

    const orderMsg = 
`*NOUVELLE COMMANDE - HORON MOUSSO* 🌿
----------------------------------------
${itemsSummary}
${totalStr}

👤 *Client :* ${details.name}
📞 *Téléphone :* ${details.phone}
📍 *Mode :* ${details.deliveryType === 'retrait' ? 'Retrait en Atelier / Boutique' : 'Livraison à domicile / bureau'}
🏠 *Adresse :* ${details.address}
💳 *Paiement souhaité :* ${details.paymentMethod}
${details.notes ? `📝 *Remarques :* ${details.notes}` : ''}

Merci de confirmer la prise en charge et le délai !`;

    // Save record to database for admin tracking (both Cloud Firestore and Local Server)
    const orderMessagePayload: CustomerMessage = {
      id: 'msg_' + Date.now(),
      name: details.name,
      contact: details.phone,
      message: `[COMMANDE PANIER] Mode: ${details.deliveryType} | Adresse: ${details.address} | Paiement: ${details.paymentMethod}\n\nArticles:\n${itemsSummary}\nTotal: ${formatFCFA(cartTotalAmount)}${details.notes ? '\nNote: ' + details.notes : ''}`,
      productReference: `Commande Panier (${cart.length} articles)`,
      status: 'nouveau',
      createdAt: new Date().toISOString()
    };

    try {
      // 1. Cloud Firestore Real-time multi-device sync
      await saveMessageToFirestore(orderMessagePayload);
    } catch (e) {
      console.warn('Note sur sauvegarde Firestore commande:', e);
    }

    try {
      // 2. Local Express server backup
      await api.sendMessage(
        orderMessagePayload.name,
        orderMessagePayload.contact,
        orderMessagePayload.message,
        orderMessagePayload.productReference
      );
    } catch (e) {
      console.error('Erreur enregistrement commande messages serveur local:', e);
    }

    try {
      // 3. Permanent IndexedDB local order archiving
      await saveOfflineOrder({
        id: orderMessagePayload.id,
        name: orderMessagePayload.name,
        contact: orderMessagePayload.contact,
        createdAt: orderMessagePayload.createdAt,
        cartItems: cart,
        details,
        totalAmount: cartTotalAmount
      });
    } catch (e) {
      console.warn('Note sur sauvegarde IndexedDB commande:', e);
    }

    // Open WhatsApp
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(orderMsg)}`;
    window.open(url, '_blank');

    showToast('Commande transmise sur WhatsApp avec succès !', 'success');
    clearCart();
    setIsCartOpen(false);
    return true;
  };

  const changeAdminCredentials = async (currentPass: string, newUsername?: string, newEmail?: string, newPass?: string) => {
    const res = await api.changeCredentials(currentPass, newUsername, newEmail, newPass);
    if (res.success) {
      showToast(res.message, 'success');
      await checkAuthStatus();
    } else {
      showToast(res.message, 'error');
    }
    return res;
  };

  // Navigation
  const [activeTab, setActiveTabState] = useState<PublicTab>('accueil');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  // Admin Navigation & Auth
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(() => api.getCurrentUser());

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Sync URL hash for clean navigation
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash.startsWith('admin')) {
        setIsAdminMode(true);
        const sub = hash.split('/')[1] as AdminTab;
        if (sub && ['dashboard', 'produits', 'annonces', 'medias', 'messages', 'parametres'].includes(sub)) {
          setAdminTab(sub);
        }
      } else if (['accueil', 'produits', 'actualites', 'galerie', 'a_propos', 'contact'].includes(hash)) {
        setIsAdminMode(false);
        setActiveTabState(hash as PublicTab);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const setActiveTab = (tab: PublicTab) => {
    setActiveTabState(tab);
    setIsAdminMode(false);
    setSelectedProductId(null);
    setSelectedAnnouncementId(null);
    window.location.hash = tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openProductDetail = (id: string) => {
    setSelectedProductId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeProductDetail = () => {
    setSelectedProductId(null);
  };

  const openAnnouncementDetail = (id: string) => {
    setSelectedAnnouncementId(id);
  };

  const closeAnnouncementDetail = () => {
    setSelectedAnnouncementId(null);
  };

  const openMediaPreview = (m: MediaItem | null) => {
    setSelectedMedia(m);
  };

  // Network status listener (Online / Offline)
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: true, mode: 'cloud_and_local' }));
      showToast('Connexion rétablie : synchronisation en ligne active', 'info');
    };
    const handleOffline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: false, mode: 'local_only' }));
      showToast('Mode hors-ligne : données sauvegardées localement', 'info');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showToast]);

  // Firestore Real-Time Subscriptions for Multi-Device synchronization
  useEffect(() => {
    let unsubs: (() => void)[] = [];

    const initializeCloudSync = async () => {
      try {
        // 1. Live Products Subscription
        const unsubProds = subscribeToCloudProducts((cloudProds) => {
          if (cloudProds && cloudProds.length > 0) {
            setProducts(cloudProds);
            try { localStorage.setItem('horon_cache_products', JSON.stringify(cloudProds)); } catch {}
            saveLocalProducts(cloudProds).catch(() => {});
            setSyncStatus(prev => ({
              ...prev,
              cloudConnected: true,
              lastSyncTime: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            }));
          }
        });

        // 2. Live Announcements Subscription
        const unsubAnns = subscribeToCloudAnnouncements((cloudAnns) => {
          if (cloudAnns && cloudAnns.length > 0) {
            setAnnouncements(cloudAnns);
            try { localStorage.setItem('horon_cache_announcements', JSON.stringify(cloudAnns)); } catch {}
            saveLocalAnnouncements(cloudAnns).catch(() => {});
          }
        });

        // 3. Live Media Gallery Subscription
        const unsubMedia = subscribeToCloudMedia((cloudMedia) => {
          if (cloudMedia && cloudMedia.length > 0) {
            setMedia(cloudMedia);
            try { localStorage.setItem('horon_cache_media', JSON.stringify(cloudMedia)); } catch {}
            saveLocalMedia(cloudMedia).catch(() => {});
          }
        });

        // 4. Live Messages & Orders Subscription
        const unsubMsgs = subscribeToCloudMessages((cloudMsgs) => {
          if (cloudMsgs) {
            setMessages(cloudMsgs);
            try { localStorage.setItem('horon_cache_messages', JSON.stringify(cloudMsgs)); } catch {}
            saveLocalMessages(cloudMsgs).catch(() => {});
          }
        });

        // 5. Live Company Settings Subscription
        const unsubSettings = subscribeToCloudSettings((cloudSettings) => {
          if (cloudSettings && cloudSettings.companyName) {
            setSettings(cloudSettings);
            try { localStorage.setItem('horon_cache_settings', JSON.stringify(cloudSettings)); } catch {}
            saveLocalSettings(cloudSettings).catch(() => {});
          }
        });

        unsubs = [unsubProds, unsubAnns, unsubMedia, unsubMsgs, unsubSettings];

        // Background non-blocking cloud seed if collection is empty
        seedFirestoreIfEmpty().catch(() => {});
      } catch (err) {
        console.warn('Initialisation Firestore realtime fallback:', err);
      }
    };

    initializeCloudSync();

    return () => {
      unsubs.forEach(unsub => {
        try { unsub(); } catch {}
      });
    };
  }, []);

  // Load initial dataset with fallback
  const refreshAllData = useCallback(async () => {
    // Instant local restore from permanent IndexedDB (zero latency)
    try {
      const [idbProds, idbAnns, idbMed, idbMsgs, idbSets] = await Promise.all([
        getLocalProducts(),
        getLocalAnnouncements(),
        getLocalMedia(),
        getLocalMessages(),
        getLocalSettings()
      ]);
      if (idbProds && idbProds.length > 0) setProducts(idbProds);
      if (idbAnns && idbAnns.length > 0) setAnnouncements(idbAnns);
      if (idbMed && idbMed.length > 0) setMedia(idbMed);
      if (idbMsgs && idbMsgs.length > 0) setMessages(idbMsgs);
      if (idbSets) setSettings(idbSets);
    } catch (e) {
      console.warn('Initialisation locale IndexedDB:', e);
    }

    setIsLoading(true);
    try {
      const [prods, anns, med, msgs, sets, st] = await Promise.all([
        api.getProducts(),
        api.getAnnouncements(),
        api.getMedia(),
        api.getMessages(),
        api.getSettings(),
        api.getStats()
      ]);
      setProducts(prods);
      setAnnouncements(anns);
      setMedia(med);
      setMessages(msgs);
      setSettings(sets);
      setStats(st);
      setSyncStatus(prev => ({
        ...prev,
        lastSyncTime: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      }));
    } catch (err) {
      console.error('Erreur chargement données:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Force Manual Synchronization
  const forceSync = async () => {
    setIsLoading(true);
    try {
      await seedFirestoreIfEmpty();
      await refreshAllData();
      setSyncStatus(prev => ({
        ...prev,
        cloudConnected: true,
        lastSyncTime: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      }));
      showToast('Données synchronisées entre le cloud et cet appareil', 'success');
    } catch (e) {
      console.warn('Erreur forceSync:', e);
      showToast('Synchronisation locale réussie', 'info');
    } finally {
      setIsLoading(false);
    }
  };

  // Auth
  const login = async (identifier: string, pass: string) => {
    const res = await api.login(identifier, pass);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      showToast('Connexion réussie en tant qu’administrateur', 'success');
      return { success: true };
    }
    showToast(res.message || 'Échec de connexion', 'error');
    return { success: false, message: res.message };
  };

  const logout = () => {
    api.logout();
    setCurrentUser(null);
    setIsAdminMode(false);
    showToast('Déconnexion effectuée', 'info');
  };

  // CRUD Implementations - Dual Storage (Cloud Firestore + Local Database)
  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt'>) => {
    const newId = 'prod_' + Date.now();
    const newProduct: Product = {
      ...productData,
      id: newId,
      createdAt: new Date().toISOString()
    };

    try {
      // 1. Cloud Firestore Real-time multi-device sync
      await saveProductToFirestore(newProduct);
    } catch (err) {
      console.warn('Sauvegarde Firestore cloud (utilisation du cache local):', err);
    }

    try {
      // 2. Local Express server persistence
      const created = await api.createProduct(productData);
      setProducts(prev => {
        const filtered = prev.filter(p => p.id !== newId && p.id !== created.id);
        return [created, ...filtered];
      });
      showToast(`Produit « ${created.name} » synchronisé avec succès`);
      api.getStats().then(s => setStats(s));
      return created;
    } catch (err) {
      // If server is offline, keep optimistic update
      setProducts(prev => [newProduct, ...prev]);
      showToast(`Produit « ${newProduct.name} » enregistré en local`);
      return newProduct;
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    const existing = products.find(p => p.id === id);
    const updatedPayload: Product = {
      ...(existing || {} as Product),
      ...productData,
      id,
      updatedAt: new Date().toISOString(),
      createdAt: existing?.createdAt || new Date().toISOString(),
      name: productData.name || existing?.name || '',
      category: productData.category || existing?.category || 'epices',
      description: productData.description || existing?.description || '',
      format: productData.format || existing?.format || '',
      availability: productData.availability || existing?.availability || 'disponible',
      mainImage: productData.mainImage || existing?.mainImage || ''
    };

    try {
      // 1. Cloud Firestore Real-time multi-device sync
      await saveProductToFirestore(updatedPayload);
    } catch (err) {
      console.warn('Mise à jour Firestore cloud (cache local actif):', err);
    }

    try {
      // 2. Local Express server
      const updated = await api.updateProduct(id, productData);
      setProducts(prev => prev.map(p => p.id === id ? updated : p));
      showToast(`Produit « ${updated.name} » mis à jour et synchronisé`);
      return updated;
    } catch (err) {
      setProducts(prev => prev.map(p => p.id === id ? updatedPayload : p));
      showToast(`Produit « ${updatedPayload.name} » mis à jour localement`);
      return updatedPayload;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      // 1. Cloud Firestore
      await deleteProductFromFirestore(id);
    } catch (err) {
      console.warn('Suppression Firestore:', err);
    }

    try {
      // 2. Local Express server
      await api.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      if (selectedProductId === id) setSelectedProductId(null);
      showToast('Produit supprimé sur tous les appareils');
      api.getStats().then(s => setStats(s));
      return true;
    } catch (err) {
      setProducts(prev => prev.filter(p => p.id !== id));
      showToast('Produit supprimé localement');
      return true;
    }
  };

  const addAnnouncement = async (annData: Omit<Announcement, 'id' | 'createdAt'>) => {
    const newId = 'ann_' + Date.now();
    const newAnn: Announcement = {
      ...annData,
      id: newId,
      createdAt: new Date().toISOString(),
      date: annData.date || new Date().toISOString().split('T')[0]
    };

    try {
      await saveAnnouncementToFirestore(newAnn);
    } catch (err) {
      console.warn('Sauvegarde annonce Firestore:', err);
    }

    try {
      const created = await api.createAnnouncement(annData);
      setAnnouncements(prev => [created, ...prev.filter(a => a.id !== newId)]);
      showToast(`Actualité « ${created.title} » publiée`);
      api.getStats().then(s => setStats(s));
      return created;
    } catch (err) {
      setAnnouncements(prev => [newAnn, ...prev]);
      showToast(`Actualité « ${newAnn.title} » enregistrée localement`);
      return newAnn;
    }
  };

  const updateAnnouncement = async (id: string, annData: Partial<Announcement>) => {
    const existing = announcements.find(a => a.id === id);
    const updatedPayload: Announcement = {
      ...(existing || {} as Announcement),
      ...annData,
      id,
      updatedAt: new Date().toISOString(),
      createdAt: existing?.createdAt || new Date().toISOString(),
      title: annData.title || existing?.title || '',
      description: annData.description || existing?.description || '',
      category: annData.category || existing?.category || 'Actualité',
      status: annData.status || existing?.status || 'publie',
      date: annData.date || existing?.date || new Date().toISOString().split('T')[0]
    };

    try {
      await saveAnnouncementToFirestore(updatedPayload);
    } catch (err) {
      console.warn('Mise à jour annonce Firestore:', err);
    }

    try {
      const updated = await api.updateAnnouncement(id, annData);
      setAnnouncements(prev => prev.map(a => a.id === id ? updated : a));
      showToast('Actualité mise à jour avec succès');
      return updated;
    } catch (err) {
      setAnnouncements(prev => prev.map(a => a.id === id ? updatedPayload : a));
      return updatedPayload;
    }
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      await deleteAnnouncementFromFirestore(id);
    } catch (err) {
      console.warn('Suppression annonce Firestore:', err);
    }

    try {
      await api.deleteAnnouncement(id);
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      showToast('Actualité supprimée');
      api.getStats().then(s => setStats(s));
      return true;
    } catch (err) {
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      return true;
    }
  };

  const addMedia = async (mediaData: Omit<MediaItem, 'id' | 'createdAt'>) => {
    const newId = 'med_' + Date.now();
    const newMedia: MediaItem = {
      ...mediaData,
      id: newId,
      createdAt: new Date().toISOString()
    };

    try {
      await saveMediaToFirestore(newMedia);
    } catch (err) {
      console.warn('Sauvegarde média Firestore:', err);
    }

    try {
      const created = await api.createMedia(mediaData);
      setMedia(prev => [created, ...prev.filter(m => m.id !== newId)]);
      showToast('Média synchronisé avec succès');
      api.getStats().then(s => setStats(s));
      return created;
    } catch (err) {
      setMedia(prev => [newMedia, ...prev]);
      return newMedia;
    }
  };

  const deleteMedia = async (id: string) => {
    try {
      await deleteMediaFromFirestore(id);
    } catch (err) {
      console.warn('Suppression média Firestore:', err);
    }

    try {
      await api.deleteMedia(id);
      setMedia(prev => prev.filter(m => m.id !== id));
      showToast('Média supprimé');
      api.getStats().then(s => setStats(s));
      return true;
    } catch (err) {
      setMedia(prev => prev.filter(m => m.id !== id));
      return true;
    }
  };

  const sendContactMessage = async (name: string, contact: string, message: string, productRef?: string) => {
    const newId = 'msg_' + Date.now();
    const newMsg: CustomerMessage = {
      id: newId,
      name,
      contact,
      message,
      productReference: productRef,
      status: 'nouveau',
      createdAt: new Date().toISOString()
    };

    try {
      await saveMessageToFirestore(newMsg);
    } catch (err) {
      console.warn('Envoi message Firestore:', err);
    }

    try {
      const created = await api.sendMessage(name, contact, message, productRef);
      setMessages(prev => [created, ...prev.filter(m => m.id !== newId)]);
      showToast('Votre message a été envoyé à l’équipe. Nous vous répondrons très rapidement !');
      api.getStats().then(s => setStats(s));
      return true;
    } catch {
      setMessages(prev => [newMsg, ...prev]);
      showToast('Message enregistré localement !');
      return true;
    }
  };

  const toggleMessageStatus = async (id: string) => {
    const existing = messages.find(m => m.id === id);
    const newStatus = existing?.status === 'lu' ? 'nouveau' : 'lu';

    try {
      await updateMessageStatusInFirestore(id, newStatus);
    } catch (err) {
      console.warn('Statut message Firestore:', err);
    }

    try {
      const updated = await api.toggleMessageStatus(id);
      setMessages(prev => prev.map(m => m.id === id ? updated : m));
      api.getStats().then(s => setStats(s));
    } catch {
      setMessages(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m));
    }
  };

  const deleteMessage = async (id: string) => {
    try {
      await deleteMessageFromFirestore(id);
    } catch (err) {
      console.warn('Suppression message Firestore:', err);
    }

    try {
      await api.deleteMessage(id);
      setMessages(prev => prev.filter(m => m.id !== id));
      showToast('Message supprimé');
      api.getStats().then(s => setStats(s));
    } catch {
      setMessages(prev => prev.filter(m => m.id !== id));
    }
  };

  const updateSettings = async (newSettings: Partial<CompanySettings>) => {
    const updatedPayload: CompanySettings = {
      ...settings,
      ...newSettings
    };

    try {
      await saveSettingsToFirestore(updatedPayload);
    } catch (err) {
      console.warn('Sauvegarde settings Firestore:', err);
    }

    try {
      const updated = await api.updateSettings(newSettings);
      setSettings(updated);
      showToast('Paramètres de l’entreprise enregistrés et synchronisés');
    } catch {
      setSettings(updatedPayload);
      showToast('Paramètres enregistrés en local');
    }
  };

  const resetDemoData = async () => {
    try {
      await api.resetDemoData();
      await refreshAllData();
      showToast('Données de démonstration restaurées avec succès', 'info');
    } catch {
      showToast('Erreur lors de la réinitialisation', 'error');
    }
  };

  const openOrderWhatsApp = (product?: Product) => {
    const rawNumber = settings.whatsapp || settings.phone || '';
    const cleanNumber = rawNumber.replace(/[^0-9]/g, '');
    let msg = `Bonjour ${settings.companyName},\n\nJe visite votre site web et je souhaite avoir des informations ou passer commande.`;
    if (product) {
      msg = `Bonjour ${settings.companyName},\n\nJe souhaite commander ou me renseigner sur le produit suivant :\n- Produit : *${product.name}*\n- Conditionnement : ${product.format}\n- Prix indicatif : ${product.price || 'À préciser'}\n\nMerci de m'indiquer la disponibilité et les modalités de livraison.`;
    }
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <AppContext.Provider
      value={{
        products,
        announcements,
        media,
        messages,
        settings,
        stats,
        isLoading,
        cart,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotalCount,
        cartTotalAmount,
        submitCartOrderWhatsApp,
        activeTab,
        setActiveTab,
        selectedProductId,
        openProductDetail,
        closeProductDetail,
        selectedAnnouncementId,
        openAnnouncementDetail,
        closeAnnouncementDetail,
        selectedMedia,
        openMediaPreview,
        isAdminMode,
        setIsAdminMode,
        adminTab,
        setAdminTab,
        currentUser,
        login,
        logout,
        authStatus,
        changeAdminCredentials,
        addProduct,
        updateProduct,
        deleteProduct,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        addMedia,
        deleteMedia,
        sendContactMessage,
        toggleMessageStatus,
        deleteMessage,
        updateSettings,
        resetDemoData,
        syncStatus,
        forceSync,
        toasts,
        showToast,
        removeToast,
        openOrderWhatsApp
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp doit être utilisé dans un AppProvider');
  }
  return context;
};
