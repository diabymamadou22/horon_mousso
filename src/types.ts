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
  stockQuantity?: number; // Stock réel en unités
  lowStockThreshold?: number; // Seuil d'alerte (ex: 10)
  rating?: number; // Note moyenne (ex: 4.9)
  reviewsCount?: number; // Nombre d'avis (ex: 28)
  mainImage: string;
  additionalImages?: string[];
  isNew?: boolean;
  isFeatured?: boolean;
  origin?: string;
  composition?: string;
  usageAdvice?: string;
  wholesaleOption?: string; // e.g. "Disponible en sacs de 10kg et 25kg pour restaurateurs et grossistes"
  createdAt: string;
  updatedAt?: string;
}

export type OrderStatus = 
  | 'en_attente' 
  | 'confirmee' 
  | 'en_preparation' 
  | 'en_livraison' 
  | 'livree' 
  | 'annulee';

export type PaymentMethod = 
  | 'especes_livraison' 
  | 'orange_money' 
  | 'wave' 
  | 'moov_money';

export type PaymentStatus = 'en_attente' | 'paye' | 'rembourse';

export interface DeliveryZone {
  id: string;
  name: string;
  fee: number; // En FCFA
  delay: string;
  estimatedTime?: string;
  description?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  format: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string; // Ex: HM-2026-0042
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  deliveryZone: string;
  deliveryFee: number;
  deliveryType: 'livraison' | 'retrait';
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  total: number;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  productName?: string;
  customerName: string;
  rating: number; // 1 to 5
  comment: string;
  location?: string; // Ex: "Bamako (Hamdallaye ACI 2000)"
  isVerifiedPurchase: boolean;
  createdAt: string;
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

export interface PromoBanner {
  id: string;
  title?: string;
  subtitle?: string;
  badge?: string;
  imageUrl: string;
  linkTab?: string; // 'produits' | 'actualites' | 'contact' | 'a_propos' | 'galerie' | 'whatsapp'
  productId?: string; // Optional direct link to a specific product
  buttonText?: string;
  isPureImage?: boolean; // If true, only shows the image billboard without overlay text
  imageFit?: 'contain' | 'cover' | 'auto'; // 'contain' (100% visible entier sans coupure), 'cover' (remplissage plein cadre), 'auto' (adaptatif)
  badgeColor?: 'gold' | 'green' | 'red' | 'blue' | 'black';
  textAlignment?: 'left' | 'center' | 'right';
  overlayOpacity?: 'light' | 'medium' | 'dark' | 'none';
  customWhatsAppMessage?: string;
  active: boolean;
  order: number;
  createdAt?: string;
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
  heroBanners?: PromoBanner[];
  heroBannerAutoplay?: boolean;
  heroBannerInterval?: number; // Défilement en secondes (ex: 4, 6, 8, 10)
  heroBannerTransition?: 'slide' | 'fade' | 'zoom';
  heroBannerFit?: 'contain' | 'cover' | 'auto'; // Mode par défaut pour l'affichage de l'image (contain: 100% entière sans coupure)
  heroBannerHeight?: 'compact' | 'standard' | 'large' | 'auto'; // Hauteur du panneau
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
  ordersCount: number;
  pendingOrdersCount: number;
  totalRevenue: number;
}

export interface SyncStatus {
  isOnline: boolean;
  cloudConnected: boolean;
  localCacheActive: boolean;
  lastSyncTime: string | null;
  mode: 'cloud_and_local' | 'local_only';
  isQuotaExceeded?: boolean;
}

export type PublicTab = 'accueil' | 'produits' | 'actualites' | 'galerie' | 'a_propos' | 'contact';

