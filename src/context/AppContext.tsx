import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { 
  Product, 
  Announcement, 
  MediaItem, 
  CustomerMessage, 
  CompanySettings, 
  DashboardStats, 
  User 
} from '../types';
import { api } from '../services/api';
import { initialSettings } from '../data/initialData';

export type PublicTab = 'accueil' | 'produits' | 'actualites' | 'galerie' | 'a_propos' | 'contact';
export type AdminTab = 'dashboard' | 'produits' | 'annonces' | 'medias' | 'messages' | 'parametres';

interface Toast {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
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

  // Load initial dataset
  const refreshAllData = useCallback(async () => {
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
    } catch (err) {
      console.error('Erreur chargement données:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

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

  // CRUD Implementations
  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt'>) => {
    try {
      const created = await api.createProduct(productData);
      setProducts(prev => [created, ...prev]);
      showToast(`Produit « ${created.name} » ajouté avec succès`);
      api.getStats().then(s => setStats(s));
      return created;
    } catch (err) {
      showToast('Erreur lors de l’ajout du produit', 'error');
      throw err;
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      const updated = await api.updateProduct(id, productData);
      setProducts(prev => prev.map(p => p.id === id ? updated : p));
      showToast(`Produit « ${updated.name} » mis à jour`);
      return updated;
    } catch (err) {
      showToast('Erreur lors de la modification', 'error');
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await api.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      if (selectedProductId === id) setSelectedProductId(null);
      showToast('Produit supprimé avec succès');
      api.getStats().then(s => setStats(s));
      return true;
    } catch (err) {
      showToast('Erreur lors de la suppression', 'error');
      throw err;
    }
  };

  const addAnnouncement = async (annData: Omit<Announcement, 'id' | 'createdAt'>) => {
    try {
      const created = await api.createAnnouncement(annData);
      setAnnouncements(prev => [created, ...prev]);
      showToast(`Annonce « ${created.title} » créée`);
      api.getStats().then(s => setStats(s));
      return created;
    } catch (err) {
      showToast('Erreur lors de la création de l’annonce', 'error');
      throw err;
    }
  };

  const updateAnnouncement = async (id: string, annData: Partial<Announcement>) => {
    try {
      const updated = await api.updateAnnouncement(id, annData);
      setAnnouncements(prev => prev.map(a => a.id === id ? updated : a));
      showToast('Annonce mise à jour avec succès');
      return updated;
    } catch (err) {
      showToast('Erreur lors de la mise à jour', 'error');
      throw err;
    }
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      await api.deleteAnnouncement(id);
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      showToast('Annonce supprimée');
      api.getStats().then(s => setStats(s));
      return true;
    } catch (err) {
      showToast('Erreur lors de la suppression', 'error');
      throw err;
    }
  };

  const addMedia = async (mediaData: Omit<MediaItem, 'id' | 'createdAt'>) => {
    try {
      const created = await api.createMedia(mediaData);
      setMedia(prev => [created, ...prev]);
      showToast('Média ajouté à la galerie');
      api.getStats().then(s => setStats(s));
      return created;
    } catch (err) {
      showToast('Erreur lors de l’ajout du média', 'error');
      throw err;
    }
  };

  const deleteMedia = async (id: string) => {
    try {
      await api.deleteMedia(id);
      setMedia(prev => prev.filter(m => m.id !== id));
      showToast('Média retiré de la galerie');
      api.getStats().then(s => setStats(s));
      return true;
    } catch (err) {
      showToast('Erreur lors de la suppression', 'error');
      throw err;
    }
  };

  const sendContactMessage = async (name: string, contact: string, message: string, productRef?: string) => {
    try {
      const created = await api.sendMessage(name, contact, message, productRef);
      setMessages(prev => [created, ...prev]);
      showToast('Votre message a été envoyé à l’équipe. Nous vous répondrons très rapidement !');
      api.getStats().then(s => setStats(s));
      return true;
    } catch {
      showToast('Erreur d’envoi de message', 'error');
      return false;
    }
  };

  const toggleMessageStatus = async (id: string) => {
    try {
      const updated = await api.toggleMessageStatus(id);
      setMessages(prev => prev.map(m => m.id === id ? updated : m));
      api.getStats().then(s => setStats(s));
    } catch {
      showToast('Erreur mise à jour statut message', 'error');
    }
  };

  const deleteMessage = async (id: string) => {
    try {
      await api.deleteMessage(id);
      setMessages(prev => prev.filter(m => m.id !== id));
      showToast('Message supprimé');
      api.getStats().then(s => setStats(s));
    } catch {
      showToast('Erreur suppression message', 'error');
    }
  };

  const updateSettings = async (newSettings: Partial<CompanySettings>) => {
    try {
      const updated = await api.updateSettings(newSettings);
      setSettings(updated);
      showToast('Paramètres de l’entreprise enregistrés');
    } catch {
      showToast('Erreur lors de l’enregistrement des paramètres', 'error');
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
