export type ProductCategory = 
  | 'all'
  | 'epices'
  | 'piments'
  | 'produits_transformes'
  | 'nouveautes';

export type ProductAvailability = 'disponible' | 'sur_commande' | 'rupture';

export interface Product {
  id: string;
  name: string;
  category: 'epices' | 'piments' | 'produits_transformes';
  description: string;
  fullDescription?: string;
  price?: string; // e.g. "1 500 FCFA" or "3.50 €" or "Sur devis"
  format: string; // e.g. "Sachet 100g, 250g, 1kg, Sac 25kg"
  availability: ProductAvailability;
  mainImage: string;
  additionalImages?: string[];
  isNew?: boolean;
  isFeatured?: boolean;
  origin?: string;
  composition?: string;
  usageAdvice?: string;
  createdAt: string;
  updatedAt?: string;
}

export type MediaCategory = 'produits' | 'production' | 'entreprise' | 'marche' | 'evenements';

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  title: string;
  category: MediaCategory;
  productId?: string;
  announcementId?: string;
  thumbnailUrl?: string;
  caption?: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  description: string;
  content?: string;
  image?: string;
  video?: string;
  category: string;
  status: 'publie' | 'brouillon';
  date: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CustomerMessage {
  id: string;
  name: string;
  contact: string; // phone or email
  message: string;
  productReference?: string;
  status: 'nouveau' | 'lu';
  createdAt: string;
}

export interface CompanySettings {
  id: string;
  companyName: string;
  logo: string;
  slogan: string;
  shortDescription: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  cityCountry: string;
  openingHours: string;
  heroImage: string;
  heroVideo?: string;
  qualityCommitment: string;
  producersCommitment: string;
  mission: string;
  vision: string;
  // Mobile Money & Payment info
  waveNumber?: string;
  orangeMoneyNumber?: string;
  mtnMoMoNumber?: string;
  moovMoneyNumber?: string;
  paymentInstructions?: string;
}

export interface CartItem {
  id: string; // unique item id (productId + format)
  productId: string;
  product: Product;
  format: string;
  quantity: number;
  unitPriceNumeric: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin';
  createdAt: string;
}

export interface DashboardStats {
  productsCount: number;
  announcementsCount: number;
  photosCount: number;
  videosCount: number;
  messagesCount: number;
  unreadMessagesCount: number;
}

export interface SyncStatus {
  isOnline: boolean;
  cloudConnected: boolean;
  localCacheActive: boolean;
  lastSyncTime: string | null;
  mode: 'cloud_and_local' | 'local_only';
}
