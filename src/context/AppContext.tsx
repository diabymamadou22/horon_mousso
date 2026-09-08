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
  SyncStatus,
  Order,
  OrderItem,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  ProductReview
} from '../types';
import { api, STORAGE_KEYS } from '../services/api';
import { initialSettings, initialProducts, initialAnnouncements, initialMedia } from '../data/initialData';
import { initialOrders } from '../data/initialOrders';
import { initialReviews } from '../data/initialReviews';
import { parsePriceToNumber, formatFCFA } from '../utils/cartUtils';
import {
  getLocalCart,
  saveLocalCart,
  saveOfflineOrder,
  saveLocalProducts,
  saveLocalAnnouncements,
  saveLocalMedia,
  saveLocalMessages,
  saveLocalSettings,
  saveLocalOrders,
  saveLocalReviews
} from '../lib/indexedDb';
import {
  seedFirestoreIfEmpty,
  testFirestoreConnection,
  subscribeToCloudProducts,
  subscribeToCloudAnnouncements,
  subscribeToCloudMedia,
  subscribeToCloudMessages,
  subscribeToCloudSettings,
  subscribeToCloudAdminAuth,
  subscribeToCloudOrders,
  subscribeToCloudReviews
} from '../lib/firebase';

export type PublicTab = 'accueil' | 'produits' | 'actualites' | 'galerie' | 'a_propos' | 'contact';
export type AdminTab = 'dashboard' | 'commandes' | 'produits' | 'annonces' | 'medias' | 'messages' | 'avis' | 'parametres';

interface Toast {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
}

export interface CustomerOrderDetails {
  name: string;
  phone: string;
  email?: string;
  address: string;
  deliveryZone?: string;
  deliveryFee?: number;
  deliveryType: 'livraison' | 'retrait';
  paymentMethod: PaymentMethod;
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

  // Commercial Orders
  orders: Order[];
  lastPlacedOrder: Order | null;
  setLastPlacedOrder: (order: Order | null) => void;
  createDirectOrder: (details: CustomerOrderDetails & { deliveryZone?: string; deliveryFee?: number }) => Promise<Order | null>;
  updateOrderStatus: (id: string, status: OrderStatus, paymentStatus?: PaymentStatus) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;

  // Customer Reviews
  reviews: ProductReview[];
  addReview: (review: Omit<ProductReview, 'id' | 'createdAt'>) => Promise<ProductReview>;
  deleteReview: (id: string) => Promise<void>;

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

// Helper to safely load cached state on application boot / restart
const loadSavedState = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed !== null && parsed !== undefined) return parsed;
    }
  } catch {}
  return fallback;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => loadSavedState(STORAGE_KEYS.PRODUCTS, initialProducts));
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => loadSavedState(STORAGE_KEYS.ANNOUNCEMENTS, initialAnnouncements));
  const [media, setMedia] = useState<MediaItem[]>(() => loadSavedState(STORAGE_KEYS.MEDIA, initialMedia));
  const [messages, setMessages] = useState<CustomerMessage[]>(() => loadSavedState(STORAGE_KEYS.MESSAGES, []));
  const [settings, setSettings] = useState<CompanySettings>(() => loadSavedState(STORAGE_KEYS.SETTINGS, initialSettings));
  const [orders, setOrders] = useState<Order[]>(() => loadSavedState(STORAGE_KEYS.ORDERS, initialOrders));
  const [reviews, setReviews] = useState<ProductReview[]>(() => loadSavedState(STORAGE_KEYS.REVIEWS, initialReviews));
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Computed Real-Time Stats directly reactive to Firestore onSnapshot
  const stats: DashboardStats = useMemo(() => {
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
  }, [products, announcements, media, messages, orders]);

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
  const [authStatus, setAuthStatus] = useState<{ isDefault: boolean; username: string; email: string }>({
    isDefault: true,
    username: 'admin',
    email: 'contact@horonmousso.com'
  });

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

  // Comprehensive Data Hydration on app boot/refresh
  useEffect(() => {
    let isMounted = true;
    const hydrateAllData = async () => {
      try {
        const [
          prodsRes,
          annsRes,
          mediaRes,
          msgsRes,
          settingsRes,
          ordersRes,
          reviewsRes
        ] = await Promise.allSettled([
          api.getProducts(),
          api.getAnnouncements(),
          api.getMedia(),
          api.getMessages(),
          api.getSettings(),
          api.getOrders(),
          api.getReviews()
        ]);

        if (!isMounted) return;

        if (prodsRes.status === 'fulfilled' && prodsRes.value && prodsRes.value.length > 0) {
          setProducts(prodsRes.value);
        }
        if (annsRes.status === 'fulfilled' && annsRes.value && annsRes.value.length > 0) {
          setAnnouncements(annsRes.value);
        }
        if (mediaRes.status === 'fulfilled' && mediaRes.value && mediaRes.value.length > 0) {
          setMedia(mediaRes.value);
        }
        if (msgsRes.status === 'fulfilled' && msgsRes.value && msgsRes.value.length > 0) {
          setMessages(msgsRes.value);
        }
        if (settingsRes.status === 'fulfilled' && settingsRes.value && settingsRes.value.companyName) {
          setSettings(settingsRes.value);
        }
        if (ordersRes.status === 'fulfilled' && ordersRes.value && ordersRes.value.length > 0) {
          setOrders(ordersRes.value);
        }
        if (reviewsRes.status === 'fulfilled' && reviewsRes.value && reviewsRes.value.length > 0) {
          setReviews(reviewsRes.value);
        }
      } catch (err) {
        console.warn('Initial data hydration notice:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    hydrateAllData();
    return () => { isMounted = false; };
  }, []);

  // Continuous Auto-Persistence across all tables to localStorage and IndexedDB
  useEffect(() => {
    if (products && products.length > 0) {
      try { localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products)); } catch {}
      saveLocalProducts(products).catch(() => {});
    }
  }, [products]);

  useEffect(() => {
    if (announcements && announcements.length > 0) {
      try { localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements)); } catch {}
      saveLocalAnnouncements(announcements).catch(() => {});
    }
  }, [announcements]);

  useEffect(() => {
    if (media && media.length > 0) {
      try { localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(media)); } catch {}
      saveLocalMedia(media).catch(() => {});
    }
  }, [media]);

  useEffect(() => {
    if (messages) {
      try { localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages)); } catch {}
      saveLocalMessages(messages).catch(() => {});
    }
  }, [messages]);

  useEffect(() => {
    if (settings && settings.companyName) {
      try { localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings)); } catch {}
      saveLocalSettings(settings).catch(() => {});
    }
  }, [settings]);

  useEffect(() => {
    if (orders && orders.length > 0) {
      try { localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders)); } catch {}
      saveLocalOrders(orders).catch(() => {});
    }
  }, [orders]);

  useEffect(() => {
    if (reviews && reviews.length > 0) {
      try { localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews)); } catch {}
      saveLocalReviews(reviews).catch(() => {});
    }
  }, [reviews]);

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
      // 1. Cloud Firestore + Local Cache via unified api
      await api.sendMessage(
        orderMessagePayload.name,
        orderMessagePayload.contact,
        orderMessagePayload.message,
        orderMessagePayload.productReference
      );
    } catch (e) {
      console.warn('Note sur enregistrement commande:', e);
    }

    try {
      // 2. Permanent IndexedDB local order archiving
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
    const id = 'toast_' + Date.now();
    // Keep at most 1 toast at a time to prevent clutter
    setToasts([{ id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2800);
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
        if (sub && ['dashboard', 'commandes', 'produits', 'annonces', 'medias', 'messages', 'avis', 'parametres'].includes(sub)) {
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
    };
    const handleOffline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: false, mode: 'local_only' }));
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

    const initializeCloudSync = () => {
      try {
        // 1. Live Products Subscription (Single Source of Truth across all devices)
        const unsubProds = subscribeToCloudProducts((cloudProds) => {
          if (Array.isArray(cloudProds)) {
            setProducts(cloudProds);
            setIsLoading(false);
            setSyncStatus(prev => ({
              ...prev,
              cloudConnected: true,
              lastSyncTime: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            }));
            saveLocalProducts(cloudProds).catch(() => {});
          }
        });

        // 2. Live Announcements Subscription
        const unsubAnns = subscribeToCloudAnnouncements((cloudAnns) => {
          if (Array.isArray(cloudAnns)) {
            setAnnouncements(cloudAnns);
            saveLocalAnnouncements(cloudAnns).catch(() => {});
          }
        });

        // 3. Live Media Gallery Subscription
        const unsubMedia = subscribeToCloudMedia((cloudMedia) => {
          if (Array.isArray(cloudMedia)) {
            setMedia(cloudMedia);
            saveLocalMedia(cloudMedia).catch(() => {});
          }
        });

        // 4. Live Messages & Orders Subscription
        const unsubMsgs = subscribeToCloudMessages((cloudMsgs) => {
          if (cloudMsgs && cloudMsgs.length > 0) {
            setMessages(cloudMsgs);
            saveLocalMessages(cloudMsgs).catch(() => {});
          }
        });

        // 5. Live Company Settings Subscription
        const unsubSettings = subscribeToCloudSettings((cloudSettings) => {
          if (cloudSettings && cloudSettings.companyName) {
            setSettings(cloudSettings);
            saveLocalSettings(cloudSettings).catch(() => {});
          }
        });

        // 6. Live Admin Auth Subscription
        const unsubAuth = subscribeToCloudAdminAuth((cloudAuth) => {
          if (cloudAuth) {
            setAuthStatus(cloudAuth);
          }
        });

        // 7. Live Commercial Orders Subscription
        const unsubOrders = subscribeToCloudOrders((cloudOrders) => {
          if (cloudOrders && cloudOrders.length > 0) {
            setOrders(cloudOrders);
            localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(cloudOrders));
            saveLocalOrders(cloudOrders).catch(() => {});
          }
        });

        // 8. Live Customer Reviews Subscription
        const unsubReviews = subscribeToCloudReviews((cloudReviews) => {
          if (cloudReviews && cloudReviews.length > 0) {
            setReviews(cloudReviews);
            localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(cloudReviews));
            saveLocalReviews(cloudReviews).catch(() => {});
          }
        });

        unsubs = [unsubProds, unsubAnns, unsubMedia, unsubMsgs, unsubSettings, unsubAuth, unsubOrders, unsubReviews];

        // Seed initial data to cloud if collections are empty
        seedFirestoreIfEmpty().catch(() => {});

        // Test Cloud Connection and update state
        testFirestoreConnection().then(conn => {
          if (conn.ok) {
            setSyncStatus(prev => ({
              ...prev,
              cloudConnected: true,
              lastSyncTime: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            }));
          }
        }).catch(() => {});
      } catch (err) {
        console.warn('Initialisation Firestore realtime fallback:', err);
        setIsLoading(false);
      }
    };

    initializeCloudSync();

    return () => {
      unsubs.forEach(unsub => {
        try { unsub(); } catch {}
      });
    };
  }, []);

  // Force Manual Synchronization
  const forceSync = async () => {
    setIsLoading(true);
    try {
      const conn = await testFirestoreConnection();
      await seedFirestoreIfEmpty(true);

      // Re-hydrate all data to guarantee 100% operational sync
      const [
        prodsRes,
        annsRes,
        mediaRes,
        msgsRes,
        settingsRes,
        ordersRes,
        reviewsRes
      ] = await Promise.allSettled([
        api.getProducts(),
        api.getAnnouncements(),
        api.getMedia(),
        api.getMessages(),
        api.getSettings(),
        api.getOrders(),
        api.getReviews()
      ]);

      if (prodsRes.status === 'fulfilled' && prodsRes.value?.length) setProducts(prodsRes.value);
      if (annsRes.status === 'fulfilled' && annsRes.value?.length) setAnnouncements(annsRes.value);
      if (mediaRes.status === 'fulfilled' && mediaRes.value?.length) setMedia(mediaRes.value);
      if (msgsRes.status === 'fulfilled' && msgsRes.value?.length) setMessages(msgsRes.value);
      if (settingsRes.status === 'fulfilled' && settingsRes.value?.companyName) setSettings(settingsRes.value);
      if (ordersRes.status === 'fulfilled' && ordersRes.value?.length) setOrders(ordersRes.value);
      if (reviewsRes.status === 'fulfilled' && reviewsRes.value?.length) setReviews(reviewsRes.value);

      setSyncStatus(prev => ({
        ...prev,
        cloudConnected: conn.ok,
        lastSyncTime: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      }));
      showToast(conn.ok ? 'Base Cloud Firebase & Stockage Local 100% opérationnels !' : 'Base locale 100% opérationnelle', 'success');
    } catch (e) {
      console.warn('Erreur forceSync:', e);
      showToast('Données locales 100% sécurisées', 'info');
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

  // CRUD Implementations - Direct Firestore write + instant optimistic state updates
  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt'>) => {
    try {
      const created = await api.createProduct(productData);
      // Instant optimistic local state update
      setProducts(prev => [created, ...prev.filter(p => p.id !== created.id)]);
      showToast(`Produit « ${created.name} » synchronisé sur tous vos appareils`, 'success');
      return created;
    } catch (err) {
      showToast('Erreur lors de l’enregistrement du produit', 'error');
      throw err;
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      const updated = await api.updateProduct(id, productData);
      // Instant optimistic local state update
      setProducts(prev => prev.map(p => p.id === id ? updated : p));
      showToast(`Produit « ${updated.name} » mis à jour sur tous vos appareils`, 'success');
      return updated;
    } catch (err) {
      showToast('Erreur lors de la mise à jour', 'error');
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const success = await api.deleteProduct(id);
      if (success) {
        setProducts(prev => prev.filter(p => p.id !== id));
        if (selectedProductId === id) setSelectedProductId(null);
        showToast('Produit supprimé sur tous vos appareils', 'info');
        return true;
      }
      throw new Error('Échec de suppression du produit');
    } catch (err) {
      console.error('Erreur lors de la suppression du produit:', err);
      showToast('Erreur lors de la suppression', 'error');
      return false;
    }
  };

  const addAnnouncement = async (annData: Omit<Announcement, 'id' | 'createdAt'>) => {
    try {
      const created = await api.createAnnouncement(annData);
      setAnnouncements(prev => [created, ...prev.filter(a => a.id !== created.id)]);
      showToast(`Actualité « ${created.title} » synchronisée sur tous vos appareils`, 'success');
      return created;
    } catch (err) {
      showToast('Erreur lors de la publication', 'error');
      throw err;
    }
  };

  const updateAnnouncement = async (id: string, annData: Partial<Announcement>) => {
    try {
      const updated = await api.updateAnnouncement(id, annData);
      setAnnouncements(prev => prev.map(a => a.id === id ? updated : a));
      showToast('Actualité mise à jour sur tous vos appareils', 'success');
      return updated;
    } catch (err) {
      showToast('Erreur lors de la mise à jour', 'error');
      throw err;
    }
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      const success = await api.deleteAnnouncement(id);
      if (success) {
        setAnnouncements(prev => prev.filter(a => a.id !== id));
        if (selectedAnnouncementId === id) setSelectedAnnouncementId(null);
        showToast('Actualité supprimée sur tous vos appareils', 'info');
        return true;
      }
      throw new Error('Échec de suppression de l\'annonce');
    } catch (err) {
      console.error('Erreur lors de la suppression de l’annonce:', err);
      showToast('Erreur lors de la suppression', 'error');
      return false;
    }
  };

  const addMedia = async (mediaData: Omit<MediaItem, 'id' | 'createdAt'>) => {
    try {
      const created = await api.createMedia(mediaData);
      setMedia(prev => [created, ...prev.filter(m => m.id !== created.id)]);
      showToast('Média synchronisé sur tous vos appareils', 'success');
      return created;
    } catch (err) {
      showToast('Erreur lors de l’ajout du média', 'error');
      throw err;
    }
  };

  const deleteMedia = async (id: string) => {
    try {
      const success = await api.deleteMedia(id);
      if (success) {
        setMedia(prev => prev.filter(m => m.id !== id));
        if (selectedMedia?.id === id) setSelectedMedia(null);
        showToast('Média supprimé sur tous vos appareils', 'info');
        return true;
      }
      throw new Error('Échec de suppression du média');
    } catch (err) {
      console.error('Erreur lors de la suppression du média:', err);
      showToast('Erreur lors de la suppression', 'error');
      return false;
    }
  };

  const sendContactMessage = async (name: string, contact: string, message: string, productRef?: string) => {
    try {
      const sent = await api.sendMessage(name, contact, message, productRef);
      setMessages(prev => [sent, ...prev]);
      showToast('Votre message a été transmis à l’équipe !', 'success');
      return true;
    } catch {
      showToast('Erreur lors de l’envoi', 'error');
      return false;
    }
  };

  const toggleMessageStatus = async (id: string) => {
    try {
      setMessages(prev => prev.map(m => m.id === id ? { ...m, status: m.status === 'nouveau' ? 'traite' : 'nouveau' } : m));
      await api.toggleMessageStatus(id);
    } catch (err) {
      console.warn('Erreur toggleMessageStatus:', err);
    }
  };

  const deleteMessage = async (id: string) => {
    try {
      setMessages(prev => prev.filter(m => m.id !== id));
      await api.deleteMessage(id);
      showToast('Message supprimé sur tous vos appareils', 'info');
    } catch (err) {
      console.warn('Erreur deleteMessage:', err);
    }
  };

  const updateSettings = async (newSettings: Partial<CompanySettings>) => {
    try {
      setSettings(prev => ({ ...prev, ...newSettings }));
      await api.updateSettings(newSettings);
      showToast('Paramètres mis à jour et synchronisés sur tous vos appareils', 'success');
    } catch {
      showToast('Erreur lors de la mise à jour des paramètres', 'error');
    }
  };

  const resetDemoData = async () => {
    try {
      await api.resetDemoData();
      showToast('Données restaurées et synchronisées avec le Cloud', 'info');
    } catch {
      showToast('Erreur lors de la réinitialisation', 'error');
    }
  };

  /* =========================================================
     COMMERCIAL ORDERS & CLIENT CHECKOUT
  ========================================================= */
  const createDirectOrder = async (
    details: CustomerOrderDetails & { deliveryZone?: string; deliveryFee?: number }
  ): Promise<Order | null> => {
    if (cart.length === 0) {
      showToast('Votre panier est vide', 'error');
      return null;
    }

    const orderNumber = `HM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const deliveryFee = details.deliveryType === 'retrait' ? 0 : (details.deliveryFee ?? 1000);
    const subtotal = cartTotalAmount;
    const total = subtotal + deliveryFee;

    const orderItems: OrderItem[] = cart.map(item => ({
      productId: item.productId,
      productName: item.product.name,
      format: item.format,
      quantity: item.quantity,
      unitPrice: item.unitPriceNumeric,
      totalPrice: item.unitPriceNumeric * item.quantity
    }));

    const newOrder: Order = {
      id: 'ord_' + Date.now(),
      orderNumber,
      customerName: details.name,
      customerPhone: details.phone,
      customerEmail: details.email || undefined,
      deliveryAddress: details.deliveryType === 'retrait' ? "Retrait en Boutique / Atelier Horon Mousso" : details.address,
      deliveryZone: details.deliveryType === 'retrait' ? "Retrait en Boutique" : (details.deliveryZone || "Bamako"),
      deliveryFee,
      deliveryType: details.deliveryType,
      paymentMethod: details.paymentMethod,
      paymentStatus: details.paymentMethod === 'especes_livraison' ? 'en_attente' : 'en_attente',
      status: 'en_attente',
      items: orderItems,
      subtotal,
      total,
      notes: details.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await api.createOrder(newOrder);
      setOrders(prev => [newOrder, ...prev.filter(o => o.id !== newOrder.id)]);

      // Decrement stock for tracked products
      for (const item of cart) {
        if (typeof item.product.stockQuantity === 'number') {
          const newQty = Math.max(0, item.product.stockQuantity - item.quantity);
          updateProduct(item.productId, {
            stockQuantity: newQty,
            availability: newQty === 0 ? 'rupture' : item.product.availability
          }).catch(() => {});
        }
      }

      setLastPlacedOrder(newOrder);
      clearCart();
      setIsCartOpen(false);
      showToast(`Commande ${orderNumber} validée avec succès !`, 'success');
      return newOrder;
    } catch (e) {
      console.error('Erreur création commande:', e);
      showToast('Erreur lors de la validation de la commande', 'error');
      return null;
    }
  };

  const updateOrderStatus = async (
    id: string, 
    status: OrderStatus, 
    paymentStatus?: PaymentStatus
  ) => {
    try {
      const updated = await api.updateOrderStatus(id, status, paymentStatus);
      if (updated) {
        setOrders(prev => prev.map(o => o.id === id ? updated : o));
        showToast(`Statut mis à jour : ${status.replace('_', ' ')}`, 'success');
      }
    } catch (e) {
      showToast('Erreur mise à jour commande', 'error');
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      await api.deleteOrder(id);
      setOrders(prev => prev.filter(o => o.id !== id));
      showToast('Commande supprimée', 'info');
    } catch (e) {
      showToast('Erreur suppression commande', 'error');
    }
  };

  /* =========================================================
     CUSTOMER REVIEWS & SOCIAL PROOF
  ========================================================= */
  const addReview = async (
    reviewData: Omit<ProductReview, 'id' | 'createdAt'>
  ): Promise<ProductReview> => {
    const newReview: ProductReview = {
      ...reviewData,
      id: 'rev_' + Date.now(),
      createdAt: new Date().toISOString()
    };
    try {
      await api.createReview(newReview);
      setReviews(prev => [newReview, ...prev]);

      // Recalculate and update product rating and count
      const prodReviews = [...reviews.filter(r => r.productId === reviewData.productId), newReview];
      const avgRating = Math.round((prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length) * 10) / 10;
      await updateProduct(reviewData.productId, {
        rating: avgRating,
        reviewsCount: prodReviews.length
      });

      showToast('Votre avis a été publié avec succès ! Merci pour votre confiance.', 'success');
      return newReview;
    } catch (e) {
      console.error('Erreur addReview:', e);
      showToast('Erreur lors de l’envoi de votre avis', 'error');
      return newReview;
    }
  };

  const deleteReview = async (id: string) => {
    try {
      await api.deleteReview(id);
      setReviews(prev => prev.filter(r => r.id !== id));
      showToast('Avis supprimé', 'info');
    } catch (e) {
      showToast('Erreur suppression avis', 'error');
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
        orders,
        lastPlacedOrder,
        setLastPlacedOrder,
        createDirectOrder,
        updateOrderStatus,
        deleteOrder,
        reviews,
        addReview,
        deleteReview,
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
