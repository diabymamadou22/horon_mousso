import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { PromoBanner, PublicTab, Product, MediaItem } from '../../types';
import {
  Plus,
  Trash2,
  Edit3,
  Eye,
  ArrowUp,
  ArrowDown,
  Check,
  X,
  Upload,
  Link as LinkIcon,
  Sparkles,
  RefreshCw,
  Tv,
  ExternalLink,
  ShoppingBag,
  MessageCircle,
  Copy,
  Play,
  Pause,
  Monitor,
  Tablet,
  Smartphone,
  Sliders,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Flame,
  CheckCircle2,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  PackageCheck,
  FolderOpen,
  Layers,
  Database,
  CloudUpload,
  CheckCircle,
  FileImage
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { compressImage, compressMultipleImages } from '../../utils/imageCompressor';
import { uploadMediaFile } from '../../utils/mediaUpload';

// Banques d'images prêtes à l'emploi et modèles
const BANNER_PRESETS = [
  {
    name: 'Soumbala Noble en Grains',
    imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1920&q=80',
    title: "L'Or Noir du Terroir : Soumbala Pur d'Exception",
    subtitle: "Graines de néré nobles fermentées 72h selon la tradition • 100% Naturel • Arôme profond & umami.",
    badge: "PRODUIT PHARE HORON MOUSSO",
    badgeColor: 'gold' as const,
    overlayOpacity: 'medium' as const,
    textAlignment: 'left' as const
  },
  {
    name: 'Piments Rouges Séchés',
    imageUrl: 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?auto=format&fit=crop&w=1920&q=80',
    title: "Piments Rouges Extra Forts & Épices Pures",
    subtitle: "Séchage solaire hygiénique, arôme piquant explosif et couleur éclatante préservée de la récolte au sachet.",
    badge: "NOUVEL ARRIVAGE FRAÎCHEUR",
    badgeColor: 'red' as const,
    overlayOpacity: 'medium' as const,
    textAlignment: 'left' as const
  },
  {
    name: 'Conditionnements & Sacs Grossistes',
    imageUrl: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=1920&q=80',
    title: "Livraison Express Bamako & Expéditions Sous-Région",
    subtitle: "Pots étanches, sachets hermétiques et sacs de gros pour particuliers, traiteurs et restaurateurs exigeants.",
    badge: "EXPÉDITION IMMÉDIATE",
    badgeColor: 'green' as const,
    overlayOpacity: 'dark' as const,
    textAlignment: 'left' as const
  },
  {
    name: 'Curcuma & Gingembre Moulus',
    imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=1920&q=80',
    title: "Gingembre & Curcuma Purs en Poudre",
    subtitle: "Fraîcheur garantie, anti-inflammatoire naturel pour vos marinades et boissons bien-être.",
    badge: "SANTÉ & VITALITÉ",
    badgeColor: 'gold' as const,
    overlayOpacity: 'medium' as const,
    textAlignment: 'left' as const
  },
  {
    name: 'Marché d’Épices Traditionnel',
    imageUrl: 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&w=1920&q=80',
    title: "Pack Découverte 5 Épices du Mali",
    subtitle: "Une symphonie de saveurs locales prêtes à sublimer vos sauces Tiga Dèguè, Fakoye et plats du quotidien.",
    badge: "PACK AVANTAGEUX",
    badgeColor: 'gold' as const,
    overlayOpacity: 'medium' as const,
    textAlignment: 'center' as const
  },
  {
    name: 'Ail & Oignons Émincés Séchés',
    imageUrl: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=1920&q=80',
    title: "Ail & Oignons Séchés 100% Purs Terroir",
    subtitle: "Gagnez du temps en cuisine tout en conservant l'intensité des saveurs traditionnelles.",
    badge: "FACILE EN CUISINE",
    badgeColor: 'blue' as const,
    overlayOpacity: 'medium' as const,
    textAlignment: 'left' as const
  },
  {
    name: 'Récolte Terroir Agricole',
    imageUrl: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=1920&q=80',
    title: "Soutenez l'Agriculture Locale et les Coopératives Féminines",
    subtitle: "Des produits sains, sans conservateurs ni additifs chimiques, directement du champ à votre table.",
    badge: "COMMERCE ÉQUITABLE",
    badgeColor: 'green' as const,
    overlayOpacity: 'dark' as const,
    textAlignment: 'left' as const
  },
  {
    name: 'Assaisonnements Culinaires',
    imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=1920&q=80',
    title: "Assaisonnements Gourmets & Épices Royales",
    subtitle: "Le secret des meilleures maîtresses de maison pour des sauces parfumées inoubliables.",
    badge: "QUALITÉ SUPÉRIEURE",
    badgeColor: 'black' as const,
    overlayOpacity: 'medium' as const,
    textAlignment: 'left' as const
  }
];

// Modèles d'inspiration prêts à être ajoutés
const TEMPLATES_INSPIRATION: {
  title: string;
  badge: string;
  badgeColor: 'gold' | 'green' | 'red' | 'blue' | 'black';
  subtitle: string;
  buttonText: string;
  linkTab: string;
  imageUrl: string;
  categoryName: string;
}[] = [
  {
    title: "Promotion Spéciale Soumbala de Néré Bio",
    badge: "PRODUIT PHARE",
    badgeColor: 'gold',
    subtitle: "Profitez d'un tarif préférentiel sur nos pots de Soumbala pur, 100% fermenté traditionnellement sans sel ajouté.",
    buttonText: "Commander du Soumbala",
    linkTab: "produits",
    imageUrl: BANNER_PRESETS[0].imageUrl,
    categoryName: "Soumbala Noble"
  },
  {
    title: "Piments Rouges Extra Forts du Terroir Malien",
    badge: "NOUVEL ARRIVAGE",
    badgeColor: 'red',
    subtitle: "Poudre ultra fine et piment concassé, arôme puissant et piquant incomparable séché sous contrôle hygiénique.",
    buttonText: "Découvrir nos Piments",
    linkTab: "produits",
    imageUrl: BANNER_PRESETS[1].imageUrl,
    categoryName: "Piments & Piquants"
  },
  {
    title: "Offre Traiteurs, Restaurants & Cantines",
    badge: "TARIFS GROSSISTES",
    badgeColor: 'blue',
    subtitle: "Bénéficiez de remises quantitatives exceptionnelles sur vos commandes en sacs de 5kg, 10kg et 25kg.",
    buttonText: "Demander un devis WhatsApp",
    linkTab: "whatsapp",
    imageUrl: BANNER_PRESETS[2].imageUrl,
    categoryName: "Offre Professionnels"
  },
  {
    title: "Gingembre & Curcuma Purs en Poudre",
    badge: "SANTÉ & VITALITÉ",
    badgeColor: 'green',
    subtitle: "Renforcez votre système immunitaire avec nos racines sélectionnées et broyées sans aucun additif.",
    buttonText: "Commander en ligne",
    linkTab: "produits",
    imageUrl: BANNER_PRESETS[3].imageUrl,
    categoryName: "Bien-être & Santé"
  },
  {
    title: "Livraison Rapide à Domicile Partout à Bamako",
    badge: "LIVRAISON EXPRESS",
    badgeColor: 'gold',
    subtitle: "Passez votre commande aujourd'hui et recevez vos épices et condiments préférés à votre porte en quelques heures.",
    buttonText: "Discuter sur WhatsApp",
    linkTab: "whatsapp",
    imageUrl: BANNER_PRESETS[6].imageUrl,
    categoryName: "Service Express"
  },
  {
    title: "Pack Découverte 5 Épices Horon Mousso",
    badge: "ÉCONOMISEZ 15%",
    badgeColor: 'black',
    subtitle: "L'assortiment idéal pour découvrir nos meilleurs condiments : Soumbala, Piment fort, Ail, Gingembre et Curcuma.",
    buttonText: "Profiter du Pack",
    linkTab: "produits",
    imageUrl: BANNER_PRESETS[4].imageUrl,
    categoryName: "Packs Économiques"
  }
];

export const AdminBanners: React.FC = () => {
  const {
    settings,
    updateSettings,
    saveHeroBanners,
    products,
    media,
    setIsAdminMode,
    setActiveTab,
    showToast
  } = useApp();

  const banners: PromoBanner[] = settings.heroBanners && settings.heroBanners.length > 0
    ? [...settings.heroBanners].sort((a, b) => a.order - b.order)
    : [];

  const activeBanners = banners.filter(b => b.active);

  // States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [previewBanner, setPreviewBanner] = useState<PromoBanner | null>(null);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  // Filters & Views
  const [filterMode, setFilterMode] = useState<'all' | 'active' | 'inactive'>('all');
  const [simulatorDevice, setSimulatorDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [simIndex, setSimIndex] = useState(0);
  const [isSimPaused, setIsSimPaused] = useState(false);

  // Global Carousel Settings form
  const [autoplayEnabled, setAutoplayEnabled] = useState<boolean>(
    settings.heroBannerAutoplay !== false
  );
  const [rotationInterval, setRotationInterval] = useState<number>(
    settings.heroBannerInterval || 6
  );
  const [transitionEffect, setTransitionEffect] = useState<'slide' | 'fade' | 'zoom'>(
    settings.heroBannerTransition || 'slide'
  );
  const [globalBannerFit, setGlobalBannerFit] = useState<'contain' | 'cover' | 'auto'>(
    settings.heroBannerFit || 'contain'
  );
  const [globalBannerHeight, setGlobalBannerHeight] = useState<'compact' | 'standard' | 'large' | 'auto'>(
    settings.heroBannerHeight || 'standard'
  );
  const [isSavingGlobal, setIsSavingGlobal] = useState(false);

  // Form State for Add / Edit
  const [formState, setFormState] = useState<{
    title: string;
    subtitle: string;
    badge: string;
    badgeColor: 'gold' | 'green' | 'red' | 'blue' | 'black';
    overlayOpacity: 'light' | 'medium' | 'dark' | 'none';
    textAlignment: 'left' | 'center' | 'right';
    imageUrl: string;
    linkTab: string;
    productId: string;
    customWhatsAppMessage: string;
    buttonText: string;
    isPureImage: boolean;
    imageFit: 'contain' | 'cover' | 'auto';
    active: boolean;
  }>({
    title: '',
    subtitle: '',
    badge: '',
    badgeColor: 'gold',
    overlayOpacity: 'medium',
    textAlignment: 'left',
    imageUrl: '',
    linkTab: 'produits',
    productId: '',
    customWhatsAppMessage: '',
    buttonText: 'Découvrir la sélection',
    isPureImage: false,
    imageFit: 'contain',
    active: true
  });

  const [activeImageTab, setActiveImageTab] = useState<'upload' | 'media' | 'presets' | 'url'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Batch Upload State (pour ajouter plusieurs images à la fois et synchroniser avec Firestore)
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [batchMode, setBatchMode] = useState<'pure' | 'with_text'>('pure');
  const [batchDefaultTab, setBatchDefaultTab] = useState<string>('produits');
  const [batchUploading, setBatchUploading] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; filename: string }>({
    current: 0,
    total: 0,
    filename: ''
  });
  const batchFileInputRef = useRef<HTMLInputElement>(null);
  const [isSyncingWithDb, setIsSyncingWithDb] = useState(false);

  // Reset simulator index when banners change
  useEffect(() => {
    if (simIndex >= activeBanners.length && activeBanners.length > 0) {
      setSimIndex(0);
    }
  }, [activeBanners.length, simIndex]);

  // Simulator rotation
  useEffect(() => {
    if (isSimPaused || activeBanners.length <= 1 || !autoplayEnabled) return;
    const interval = setInterval(() => {
      setSimIndex(prev => (prev + 1) % activeBanners.length);
    }, rotationInterval * 1000);
    return () => clearInterval(interval);
  }, [isSimPaused, activeBanners.length, autoplayEnabled, rotationInterval]);

  // Open modal for new banner
  const handleOpenNewModal = () => {
    setEditingBannerId(null);
    setFormState({
      title: "Nouvelle Offre Spéciale Horon Mousso",
      subtitle: "Découvrez notre sélection exclusive d'épices nobles 100% naturelles.",
      badge: "OFFRE DU MOMENT",
      badgeColor: 'gold',
      overlayOpacity: 'medium',
      textAlignment: 'left',
      imageUrl: BANNER_PRESETS[0].imageUrl,
      linkTab: 'produits',
      productId: '',
      customWhatsAppMessage: '',
      buttonText: 'Commander maintenant',
      isPureImage: false,
      imageFit: 'contain',
      active: true
    });
    setActiveImageTab('upload');
    setIsModalOpen(true);
  };

  // Open modal for editing banner
  const handleOpenEditModal = (banner: PromoBanner) => {
    setEditingBannerId(banner.id);
    setFormState({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      badge: banner.badge || '',
      badgeColor: banner.badgeColor || 'gold',
      overlayOpacity: banner.overlayOpacity || 'medium',
      textAlignment: banner.textAlignment || 'left',
      imageUrl: banner.imageUrl || '',
      linkTab: banner.linkTab || 'produits',
      productId: banner.productId || '',
      customWhatsAppMessage: banner.customWhatsAppMessage || '',
      buttonText: banner.buttonText || 'Découvrir',
      isPureImage: !!banner.isPureImage,
      imageFit: banner.imageFit || 'contain',
      active: banner.active
    });
    setActiveImageTab('upload');
    setIsModalOpen(true);
  };

  // Duplicate an existing banner
  const handleDuplicateBanner = async (banner: PromoBanner) => {
    const newBanner: PromoBanner = {
      ...banner,
      id: `banner_${Date.now()}`,
      title: banner.title ? `${banner.title} (Copie)` : undefined,
      order: banners.length + 1,
      createdAt: new Date().toISOString()
    };
    const updated = [...banners, newBanner];
    await saveHeroBanners(updated);
    showToast('Affiche dupliquée avec succès !', 'success');
  };

  // Apply a template directly
  const handleApplyTemplate = async (tmpl: typeof TEMPLATES_INSPIRATION[0]) => {
    const newBanner: PromoBanner = {
      id: `banner_${Date.now()}`,
      title: tmpl.title,
      subtitle: tmpl.subtitle,
      badge: tmpl.badge,
      badgeColor: tmpl.badgeColor,
      overlayOpacity: 'medium',
      textAlignment: 'left',
      imageUrl: tmpl.imageUrl,
      linkTab: tmpl.linkTab,
      buttonText: tmpl.buttonText,
      isPureImage: false,
      active: true,
      order: banners.length + 1,
      createdAt: new Date().toISOString()
    };
    const updated = [...banners, newBanner];
    await saveHeroBanners(updated);
    setIsTemplatesModalOpen(false);
    showToast(`Modèle "${tmpl.categoryName}" ajouté au panneau !`, 'success');
  };

  // Handle single file upload with automated persistent cloud/server storage & compression
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image valide (JPG, PNG, WebP).');
      return;
    }

    try {
      setIsUploading(true);
      const uploadRes = await uploadMediaFile(file, undefined, 'banners');
      setFormState(prev => ({ ...prev, imageUrl: uploadRes.url }));
    } catch (err) {
      console.warn('Fallback compression locale pour la bannière:', err);
      try {
        const compressed = await compressImage(file, { maxWidth: 1920, maxHeight: 1080, quality: 0.84 });
        setFormState(prev => ({ ...prev, imageUrl: compressed }));
      } catch {
        alert("Erreur lors de l'optimisation de l'image.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Handle batch selection of multiple images
  const handleBatchFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validFiles = (Array.from(files) as File[]).filter(f => f.type.startsWith('image/'));
    if (validFiles.length === 0) {
      alert('Veuillez sélectionner des fichiers images valides.');
      return;
    }

    setBatchFiles(validFiles);
    setIsBatchModalOpen(true);
    // Reset file input so selecting same files again will fire onChange
    if (e.target) e.target.value = '';
  };

  // Execute batch compression and synchronize with Firestore database
  const handleExecuteBatchUpload = async () => {
    if (batchFiles.length === 0) return;

    setBatchUploading(true);
    setBatchProgress({ current: 0, total: batchFiles.length, filename: '' });

    try {
      const results: { name: string; url: string }[] = [];

      for (let i = 0; i < batchFiles.length; i++) {
        const file = batchFiles[i];
        setBatchProgress({ current: i + 1, total: batchFiles.length, filename: file.name });
        try {
          const uploadRes = await uploadMediaFile(
            file,
            (msg) => setBatchProgress({ current: i + 1, total: batchFiles.length, filename: `${file.name} - ${msg}` }),
            'banners'
          );
          results.push({ name: file.name, url: uploadRes.url });
        } catch {
          const localCompressed = await compressImage(file, { maxWidth: 1920, maxHeight: 1080, quality: 0.82 });
          results.push({ name: file.name, url: localCompressed });
        }
      }

      if (results.length === 0) {
        showToast('Aucune image n\'a pu être traitée.', 'error');
        setBatchUploading(false);
        return;
      }

      const startIndex = banners.length;
      const newBanners: PromoBanner[] = results.map((item, idx) => {
        const cleanTitle = item.name
          .replace(/[_-]/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase());

        return {
          id: `banner_${Date.now()}_${idx}`,
          title: batchMode === 'with_text' ? cleanTitle : undefined,
          subtitle: batchMode === 'with_text' ? "Produit authentique de qualité supérieure • Horon Mousso Mali" : undefined,
          badge: batchMode === 'with_text' ? "NOUVEAUTÉ" : undefined,
          badgeColor: 'gold',
          overlayOpacity: batchMode === 'with_text' ? 'medium' : 'none',
          textAlignment: 'left',
          imageUrl: item.url,
          linkTab: batchDefaultTab,
          buttonText: 'Commander',
          isPureImage: batchMode === 'pure',
          imageFit: 'contain',
          active: true,
          order: startIndex + idx + 1,
          createdAt: new Date().toISOString()
        };
      });

      const updated = [...banners, ...newBanners];
      await saveHeroBanners(updated);

      showToast(`${newBanners.length} nouvelle(s) photo(s) ajoutée(s) et synchronisée(s) avec la base de données Firestore !`, 'success');
      setIsBatchModalOpen(false);
      setBatchFiles([]);
    } catch (err) {
      console.error('Erreur traitement par lot:', err);
      showToast('Erreur lors de la synchronisation des images', 'error');
    } finally {
      setBatchUploading(false);
    }
  };

  // Force database synchronization
  const handleForceDbSync = async () => {
    setIsSyncingWithDb(true);
    try {
      await saveHeroBanners(banners);
      showToast('Synchronisation avec Google Cloud Firestore confirmée et vérifiée !', 'success');
    } catch {
      showToast('Erreur lors de la synchronisation avec la base de données', 'error');
    } finally {
      setIsSyncingWithDb(false);
    }
  };

  // Save Banner (Add or Edit)
  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.imageUrl) {
      alert('Veuillez fournir une image pour la bannière de pub.');
      return;
    }

    let updatedBanners: PromoBanner[];

    if (editingBannerId) {
      updatedBanners = banners.map(b => {
        if (b.id === editingBannerId) {
          return {
            ...b,
            title: formState.title,
            subtitle: formState.subtitle,
            badge: formState.badge,
            badgeColor: formState.badgeColor,
            overlayOpacity: formState.overlayOpacity,
            textAlignment: formState.textAlignment,
            imageUrl: formState.imageUrl,
            linkTab: formState.linkTab,
            productId: formState.productId || undefined,
            customWhatsAppMessage: formState.customWhatsAppMessage || undefined,
            buttonText: formState.buttonText,
            isPureImage: formState.isPureImage,
            imageFit: formState.imageFit,
            active: formState.active
          };
        }
        return b;
      });
    } else {
      const newBanner: PromoBanner = {
        id: `banner_${Date.now()}`,
        title: formState.title,
        subtitle: formState.subtitle,
        badge: formState.badge,
        badgeColor: formState.badgeColor,
        overlayOpacity: formState.overlayOpacity,
        textAlignment: formState.textAlignment,
        imageUrl: formState.imageUrl,
        linkTab: formState.linkTab,
        productId: formState.productId || undefined,
        customWhatsAppMessage: formState.customWhatsAppMessage || undefined,
        buttonText: formState.buttonText,
        isPureImage: formState.isPureImage,
        imageFit: formState.imageFit,
        active: formState.active,
        order: banners.length + 1,
        createdAt: new Date().toISOString()
      };
      updatedBanners = [...banners, newBanner];
    }

    await saveHeroBanners(updatedBanners);
    setIsModalOpen(false);
    showToast(editingBannerId ? 'Affiche modifiée avec succès' : 'Nouvelle affiche ajoutée au panneau', 'success');
  };

  // Toggle Banner Active
  const handleToggleActive = async (bannerId: string) => {
    const updated = banners.map(b => {
      if (b.id === bannerId) {
        return { ...b, active: !b.active };
      }
      return b;
    });
    await saveHeroBanners(updated);
    showToast('Statut de l’affiche mis à jour', 'info');
  };

  // Delete Banner
  const handleDeleteBanner = async (bannerId: string) => {
    const updated = banners
      .filter(b => b.id !== bannerId)
      .map((b, idx) => ({ ...b, order: idx + 1 }));
    await saveHeroBanners(updated);
    setDeleteConfirmId(null);
    showToast('Affiche retirée du panneau', 'success');
  };

  // Move banner Up or Down
  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === banners.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const reordered = [...banners];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    const updated = reordered.map((b, idx) => ({ ...b, order: idx + 1 }));
    await saveHeroBanners(updated);
  };

  // Save Global Settings (Rotation, autoplay, transition)
  const handleSaveGlobalSettings = async () => {
    setIsSavingGlobal(true);
    try {
      await updateSettings({
        heroBannerAutoplay: autoplayEnabled,
        heroBannerInterval: Number(rotationInterval),
        heroBannerTransition: transitionEffect,
        heroBannerFit: globalBannerFit,
        heroBannerHeight: globalBannerHeight
      });
      showToast('Paramètres du panneau enregistrés avec succès !', 'success');
    } catch (e) {
      showToast('Erreur lors de l’enregistrement', 'error');
    } finally {
      setIsSavingGlobal(false);
    }
  };

  // Reset to default banners
  const handleResetDefaults = async () => {
    if (confirm('Voulez-vous rétablir les 3 bannières publicitaires d’origine de Horon Mousso ?')) {
      const defaultList: PromoBanner[] = [
        {
          id: 'banner_1',
          title: "L'Or Noir du Terroir : Soumbala Pur d'Exception",
          subtitle: "Graines de néré nobles fermentées 72h selon la tradition • 100% Naturel • Arôme profond & umami.",
          badge: "PRODUIT PHARE HORON MOUSSO",
          badgeColor: 'gold',
          overlayOpacity: 'medium',
          textAlignment: 'left',
          imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1920&q=80',
          linkTab: 'produits',
          buttonText: 'Découvrir nos produits',
          isPureImage: false,
          active: true,
          order: 1
        },
        {
          id: 'banner_2',
          title: "Piments Rouges Extra Forts & Épices Nobles",
          subtitle: "Séchage solaire hygiénique, arôme piquant explosif et couleur éclatante préservée de la récolte au sachet.",
          badge: "NOUVEL ARRIVAGE FRAÎCHEUR",
          badgeColor: 'red',
          overlayOpacity: 'medium',
          textAlignment: 'left',
          imageUrl: 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?auto=format&fit=crop&w=1920&q=80',
          linkTab: 'produits',
          buttonText: 'Commander nos épices',
          isPureImage: false,
          active: true,
          order: 2
        },
        {
          id: 'banner_3',
          title: "Livraison Express Bamako & Expéditions Sous-Région",
          subtitle: "Pots étanches, sachets hermétiques et sacs de gros pour particuliers, traiteurs et restaurateurs exigeants.",
          badge: "EXPÉDITION IMMÉDIATE",
          badgeColor: 'green',
          overlayOpacity: 'dark',
          textAlignment: 'left',
          imageUrl: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=1920&q=80',
          linkTab: 'contact',
          buttonText: 'Commander sur WhatsApp',
          isPureImage: false,
          active: true,
          order: 3
        }
      ];
      await saveHeroBanners(defaultList);
      showToast('Affiches d’origine rétablies', 'success');
    }
  };

  // Filtered banners
  const displayedBanners = banners.filter(b => {
    if (filterMode === 'active') return b.active;
    if (filterMode === 'inactive') return !b.active;
    return true;
  });

  const currentSimBanner = activeBanners[simIndex] || banners[0];

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-gradient-to-r from-[#1B3022] via-[#24422e] to-[#122217] text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-amber-500/20">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-amber-400 text-neutral-950 font-black shadow-md flex items-center justify-center">
              <Tv className="w-6 h-6" />
            </span>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-semibold backdrop-blur-xs border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Panneau Publicitaire Hero</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-serif-heading">
            Panneau Publicitaire Défilant (Hero)
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
            Gérez les grandes affiches et bannières promotionnelles qui défilent en haut de la page d'accueil de <strong className="text-amber-300 font-bold">Horon Mousso</strong>.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {activeBanners.length} affiche{activeBanners.length > 1 ? 's' : ''} en diffusion
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-200 text-xs font-bold border border-amber-500/30">
              <Database className="w-3 h-3 text-amber-400" />
              Base Firestore Synchronisée ({banners.length} affiches)
            </span>

            <span className="text-xs text-stone-400">
              Cadence : <strong className="text-white">{rotationInterval}s</strong> {autoplayEnabled ? '(Auto)' : '(Manuel)'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
          {/* Multi-Images Batch Import */}
          <button
            type="button"
            onClick={() => batchFileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700/90 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg transition border border-emerald-400/40 cursor-pointer transform hover:scale-105 active:scale-95"
            title="Ajouter plusieurs photos en une seule fois"
          >
            <CloudUpload className="w-4 h-4 text-emerald-200" />
            <span>+ Ajouter plusieurs photos</span>
          </button>
          <input
            ref={batchFileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleBatchFileSelect}
            className="hidden"
          />

          <button
            onClick={() => setIsTemplatesModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-amber-300 font-bold text-xs border border-amber-300/30 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Idées & Modèles</span>
          </button>

          <button
            onClick={handleOpenNewModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-black text-xs shadow-lg transition transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Créer une affiche</span>
          </button>

          <button
            type="button"
            onClick={handleForceDbSync}
            disabled={isSyncingWithDb}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 text-xs font-semibold border border-white/10 transition cursor-pointer disabled:opacity-50"
            title="Forcer la synchronisation avec Firestore"
          >
            <Database className={`w-3.5 h-3.5 text-amber-300 ${isSyncingWithDb ? 'animate-spin' : ''}`} />
            <span className="hidden xl:inline">Sync DB</span>
          </button>

          <button
            onClick={() => {
              setIsAdminMode(false);
              setActiveTab('accueil');
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition cursor-pointer"
            title="Voir le rendu sur le site client"
          >
            <ExternalLink className="w-4 h-4 text-stone-300" />
            <span className="hidden sm:inline">Voir sur le site</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          SECTION 1 : SIMULATEUR LIVE DU PANNEAU DE PUB DIRECTEMENT DANS L'ADMIN
      ========================================================================= */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xs border border-stone-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <Tv className="w-5 h-5 text-amber-600" />
              <h2 className="text-base sm:text-lg font-black text-stone-900">
                Aperçu Direct du Panneau de Pub
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Visualisez le carrousel exactement comme vos visiteurs le voient sur leurs écrans.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Device Switcher */}
            <div className="bg-stone-100 p-1 rounded-xl flex items-center gap-1 border border-stone-200">
              <button
                type="button"
                onClick={() => setSimulatorDevice('desktop')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  simulatorDevice === 'desktop'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Ordinateur</span>
              </button>
              <button
                type="button"
                onClick={() => setSimulatorDevice('tablet')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  simulatorDevice === 'tablet'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                <Tablet className="w-3.5 h-3.5" />
                <span>Tablette</span>
              </button>
              <button
                type="button"
                onClick={() => setSimulatorDevice('mobile')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  simulatorDevice === 'mobile'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile</span>
              </button>
            </div>

            {/* Play/Pause Simulator */}
            <button
              type="button"
              onClick={() => setIsSimPaused(!isSimPaused)}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                isSimPaused
                  ? 'bg-amber-50 border-amber-300 text-amber-700'
                  : 'bg-stone-100 border-stone-200 text-stone-600 hover:bg-stone-200'
              }`}
              title={isSimPaused ? 'Reprendre la simulation' : 'Mettre en pause la simulation'}
            >
              {isSimPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Live Simulator Viewport */}
        {activeBanners.length === 0 ? (
          <div className="bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200 p-10 text-center space-y-3">
            <Tv className="w-10 h-10 text-stone-300 mx-auto" />
            <div className="text-sm font-bold text-stone-700">Aucune affiche publicitaire active</div>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Toutes les affiches sont actuellement désactivées. Activez-en au moins une ou créez une nouvelle affiche pour que le panneau apparaisse sur le site.
            </p>
            <button
              onClick={handleOpenNewModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2D5A27] text-white text-xs font-bold shadow-xs hover:bg-[#23471f] transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Créer une affiche</span>
            </button>
          </div>
        ) : (
          <div className="flex justify-center bg-stone-950 p-3 sm:p-5 rounded-2xl">
            <div
              className={`relative overflow-hidden rounded-xl shadow-2xl transition-all duration-300 border border-stone-800 bg-neutral-950 ${
                simulatorDevice === 'desktop'
                  ? 'w-full max-w-4xl h-[280px] sm:h-[360px] md:h-[420px]'
                  : simulatorDevice === 'tablet'
                  ? 'w-[520px] sm:w-[580px] h-[380px]'
                  : 'w-[320px] sm:w-[350px] h-[460px]'
              }`}
            >
              {currentSimBanner && (
                <div className="relative w-full h-full">
                  {/* Layer 1: Ambient blur background */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
                    <img
                      src={currentSimBanner.imageUrl}
                      alt=""
                      className="w-full h-full object-cover object-center blur-2xl scale-125 opacity-35 brightness-[0.45]"
                    />
                    <div className="absolute inset-0 bg-neutral-950/25" />
                  </div>

                  {/* Layer 2: 100% visible, uncropped image */}
                  <div className="relative z-1 w-full h-full flex items-center justify-center p-1 sm:p-2">
                    <img
                      src={currentSimBanner.imageUrl}
                      alt=""
                      className={`w-full h-full ${
                        (currentSimBanner.imageFit || globalBannerFit) !== 'cover'
                          ? 'object-contain object-center drop-shadow-xl'
                          : 'object-cover object-center'
                      }`}
                    />
                  </div>

                  {/* Gradient overlay for readability if texts exist */}
                  {!currentSimBanner.isPureImage && (
                    <div
                      className={`absolute inset-0 z-2 ${
                        currentSimBanner.overlayOpacity === 'light'
                          ? 'bg-gradient-to-t sm:bg-gradient-to-r from-black/70 via-black/35 to-transparent'
                          : currentSimBanner.overlayOpacity === 'dark'
                          ? 'bg-gradient-to-t sm:bg-gradient-to-r from-black/95 via-black/80 to-black/40'
                          : currentSimBanner.overlayOpacity === 'none'
                          ? 'bg-gradient-to-t sm:bg-gradient-to-r from-black/40 via-transparent to-transparent'
                          : 'bg-gradient-to-t sm:bg-gradient-to-r from-black/90 via-black/65 to-black/20'
                      }`}
                    />
                  )}

                  {/* Content */}
                  {!currentSimBanner.isPureImage ? (
                    <div
                      className={`absolute inset-0 p-5 sm:p-8 flex flex-col justify-end sm:justify-center text-white z-10 space-y-2 sm:space-y-3 ${
                        currentSimBanner.textAlignment === 'center'
                          ? 'text-center items-center mx-auto'
                          : currentSimBanner.textAlignment === 'right'
                          ? 'text-right items-end ml-auto'
                          : 'text-left items-start mr-auto'
                      } max-w-xl`}
                    >
                      {currentSimBanner.badge && (
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-xs ${
                            currentSimBanner.badgeColor === 'green'
                              ? 'bg-emerald-600 text-white border-emerald-400'
                              : currentSimBanner.badgeColor === 'red'
                              ? 'bg-rose-600 text-white border-rose-400'
                              : currentSimBanner.badgeColor === 'blue'
                              ? 'bg-sky-600 text-white border-sky-400'
                              : currentSimBanner.badgeColor === 'black'
                              ? 'bg-neutral-900 text-amber-400 border-amber-500/40'
                              : 'bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 border-amber-300'
                          }`}
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>{currentSimBanner.badge}</span>
                        </span>
                      )}

                      {currentSimBanner.title && (
                        <h3 className="text-lg sm:text-2xl md:text-3xl font-black font-serif-heading leading-tight drop-shadow-md">
                          {currentSimBanner.title}
                        </h3>
                      )}

                      {currentSimBanner.subtitle && (
                        <p className="text-xs sm:text-sm text-stone-200 line-clamp-2 drop-shadow-xs">
                          {currentSimBanner.subtitle}
                        </p>
                      )}

                      <div className="pt-2">
                        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-600 text-white font-bold text-xs shadow-md">
                          {currentSimBanner.linkTab === 'whatsapp' ? (
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-200" />
                          ) : (
                            <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
                          )}
                          <span>{currentSimBanner.buttonText || 'Découvrir'}</span>
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute bottom-4 left-4 z-10">
                      <span className="px-3 py-1 rounded-full bg-black/70 text-amber-300 text-xs font-bold backdrop-blur-xs border border-white/20 flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Affiche 100% visible & entière</span>
                      </span>
                    </div>
                  )}

                  {/* Simulator Controls inside viewport */}
                  <div className="absolute top-3 right-3 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 text-xs text-white">
                    <span className="text-[11px] font-mono text-amber-400">
                      {simIndex + 1} / {activeBanners.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(currentSimBanner)}
                      className="text-stone-300 hover:text-white flex items-center gap-1 text-[10px] font-bold underline cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Modifier cette affiche</span>
                    </button>
                  </div>

                  {/* Arrow navigation in simulator */}
                  {activeBanners.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setSimIndex(prev => (prev - 1 + activeBanners.length) % activeBanners.length)
                        }
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setSimIndex(prev => (prev + 1) % activeBanners.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {/* Indicator dots */}
                  <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5">
                    {activeBanners.map((_, dotIdx) => (
                      <button
                        key={dotIdx}
                        type="button"
                        onClick={() => setSimIndex(dotIdx)}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                          simIndex === dotIdx ? 'w-6 bg-amber-400' : 'w-2 bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          SECTION 2 : RÉGLAGES GLOBAUX DU CARROUSEL (Vitesse, Autoplay, Effets)
      ========================================================================= */}
      <div className="bg-stone-50 rounded-3xl p-5 sm:p-7 border border-stone-200/80 space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200">
          <Sliders className="w-5 h-5 text-[#2D5A27]" />
          <div>
            <h2 className="text-base font-bold text-stone-900">
              Paramètres Généraux du Panneau
            </h2>
            <p className="text-xs text-stone-500">
              Ajustez la cadence de rotation et les effets de transition pour vos clients.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Autoplay toggle */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-stone-800">Défilement Automatique</div>
              <div className="text-[11px] text-stone-500 mt-0.5">
                Les affiches tournent automatiquement sans action du visiteur.
              </div>
            </div>
            <div className="pt-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-600">
                {autoplayEnabled ? 'Activé (Auto)' : 'Manuel'}
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoplayEnabled}
                  onChange={e => setAutoplayEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>

          {/* Interval */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-stone-800">Durée par Affiche</div>
              <div className="text-[11px] text-stone-500 mt-0.5">
                Temps d'exposition de chaque pub.
              </div>
            </div>
            <div className="pt-3">
              <select
                value={rotationInterval}
                disabled={!autoplayEnabled}
                onChange={e => setRotationInterval(Number(e.target.value))}
                className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
              >
                <option value={4}>4 secondes (Rapide)</option>
                <option value={6}>6 secondes (Équilibré)</option>
                <option value={8}>8 secondes (Confortable)</option>
                <option value={10}>10 secondes (Posé)</option>
                <option value={12}>12 secondes (Très lent)</option>
              </select>
            </div>
          </div>

          {/* Transition Effect */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-stone-800">Effet de Transition</div>
              <div className="text-[11px] text-stone-500 mt-0.5">
                Animation lors du changement d'affiche.
              </div>
            </div>
            <div className="pt-3">
              <select
                value={transitionEffect}
                onChange={e => setTransitionEffect(e.target.value as 'slide' | 'fade' | 'zoom')}
                className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="slide">Glissement (Slide)</option>
                <option value="fade">Fondu (Fade)</option>
                <option value="zoom">Zoom prestige</option>
              </select>
            </div>
          </div>

          {/* Cadrage Responsive (Anti-Coupure) */}
          <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-900">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cadrage Multi-Écrans</span>
              </div>
              <div className="text-[11px] text-stone-500 mt-0.5">
                Assure la visibilité totale sur PC, tablette et téléphone.
              </div>
            </div>
            <div className="pt-3">
              <select
                value={globalBannerFit}
                onChange={e => setGlobalBannerFit(e.target.value as 'contain' | 'cover' | 'auto')}
                className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-emerald-300 bg-emerald-50/50 text-emerald-950 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="contain">Entière sans coupure (100% lisible)</option>
                <option value="cover">Plein cadre (Remplissage total)</option>
                <option value="auto">Automatique adaptatif</option>
              </select>
            </div>
          </div>

          {/* Hauteur du Panneau */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-stone-800">Hauteur du Panneau</div>
              <div className="text-[11px] text-stone-500 mt-0.5">
                Échelle verticale sur ordinateurs et mobiles.
              </div>
            </div>
            <div className="pt-3">
              <select
                value={globalBannerHeight}
                onChange={e => setGlobalBannerHeight(e.target.value as 'compact' | 'standard' | 'large' | 'auto')}
                className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="standard">Standard équilibré (Recommandé)</option>
                <option value="large">Grand format immersif</option>
                <option value="compact">Format compact & dynamique</option>
                <option value="auto">Automatique fluide</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleSaveGlobalSettings}
            disabled={isSavingGlobal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2D5A27] hover:bg-[#23471f] text-white font-bold text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{isSavingGlobal ? 'Enregistrement...' : 'Enregistrer ces réglages'}</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          SECTION 3 : LISTE DES AFFICHES ET ACTIONS (Ordre, activation, doublon)
      ========================================================================= */}
      <div className="space-y-4">
        {/* Multi-Photo Quick Dropzone / Import Card */}
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50/50 border border-emerald-200 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-md shrink-0">
              <CloudUpload className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>Nouveau : Importation Multiple & Synchronisation</span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-stone-900">
                Ajoutez plusieurs photos d'un coup dans le panneau publicitaire
              </h3>
              <p className="text-xs text-stone-600 mt-0.5 max-w-xl leading-relaxed">
                Sélectionnez 2, 5, 10 ou plus de photos de vos produits ou affiches. Elles sont automatiquement optimisées (légères et nettes) puis synchronisées directement avec la base de données Firestore.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => batchFileInputRef.current?.click()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#2D5A27] hover:bg-[#23471f] text-white font-bold text-xs shadow-md hover:shadow-lg transition cursor-pointer"
            >
              <FileImage className="w-4 h-4 text-emerald-200" />
              <span>Choisir plusieurs photos...</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-stone-900">
              Affiches du Panneau ({banners.length})
            </h2>
            <p className="text-xs text-stone-500">
              Déplacez les affiches vers le haut ou le bas pour déterminer la séquence de passage.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Buttons */}
            <div className="bg-stone-100 p-1 rounded-xl flex items-center gap-1 border border-stone-200">
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  filterMode === 'all'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Toutes ({banners.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('active')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  filterMode === 'active'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Actives ({activeBanners.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('inactive')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  filterMode === 'inactive'
                    ? 'bg-white text-stone-700 shadow-xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Inactives ({banners.length - activeBanners.length})
              </button>
            </div>

            {/* Reset button */}
            <button
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-semibold transition cursor-pointer"
              title="Réinitialiser les affiches types"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Rétablir modèles</span>
            </button>
          </div>
        </div>

        {/* Banners Grid / List */}
        {displayedBanners.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center">
            <div className="text-sm font-bold text-stone-700">Aucune affiche ne correspond au filtre sélectionné</div>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedBanners.map((banner, index) => (
              <div
                key={banner.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  banner.active
                    ? 'bg-white border-stone-200 shadow-xs hover:border-amber-400'
                    : 'bg-stone-50/70 border-stone-200/60 opacity-75'
                }`}
              >
                {/* Left: Order, Thumbnail & Details */}
                <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 flex-1 min-w-0">
                  {/* Order Controls */}
                  <div className="flex flex-col items-center gap-1 shrink-0 bg-stone-100 p-1.5 rounded-xl border border-stone-200">
                    <button
                      type="button"
                      onClick={() => handleMove(index, 'up')}
                      disabled={index === 0}
                      className="p-1 rounded-md hover:bg-white text-stone-600 disabled:opacity-30 transition cursor-pointer"
                      title="Monter (passer plus tôt)"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-black text-stone-800">#{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleMove(index, 'down')}
                      disabled={index === banners.length - 1}
                      className="p-1 rounded-md hover:bg-white text-stone-600 disabled:opacity-30 transition cursor-pointer"
                      title="Descendre (passer plus tard)"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Thumbnail Image */}
                  <div className="relative w-24 sm:w-32 h-16 sm:h-20 rounded-xl overflow-hidden bg-stone-900 shrink-0 border border-stone-200 group">
                    <img
                      src={banner.imageUrl}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => setPreviewBanner(banner)}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition cursor-pointer"
                      title="Aperçu grand format"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {banner.badge && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                          {banner.badge}
                        </span>
                      )}

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          banner.isPureImage
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {banner.isPureImage ? 'Affiche pure (Graphique)' : 'Bannière dynamique'}
                      </span>

                      <span className="text-[11px] text-stone-400 font-medium">
                        Redirection : <strong className="text-stone-700">{banner.linkTab || 'produits'}</strong>
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-stone-900 truncate">
                      {banner.title || (banner.isPureImage ? 'Affiche graphique sans texte' : 'Sans titre')}
                    </h3>

                    {banner.subtitle && (
                      <p className="text-xs text-stone-500 line-clamp-1 max-w-xl">
                        {banner.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Quick Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {/* Inline Toggle Active */}
                  <button
                    type="button"
                    onClick={() => handleToggleActive(banner.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      banner.active
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                        : 'bg-stone-100 text-stone-500 border border-stone-300 hover:bg-stone-200'
                    }`}
                    title={banner.active ? 'Cliquer pour désactiver' : 'Cliquer pour diffuser'}
                  >
                    <span className={`w-2 h-2 rounded-full ${banner.active ? 'bg-emerald-500' : 'bg-stone-400'}`} />
                    <span>{banner.active ? 'En diffusion' : 'Désactivé'}</span>
                  </button>

                  {/* Duplicate */}
                  <button
                    type="button"
                    onClick={() => handleDuplicateBanner(banner)}
                    className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200 transition cursor-pointer"
                    title="Dupliquer cette affiche pour créer une variante"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  {/* Edit */}
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(banner)}
                    className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200 transition cursor-pointer"
                    title="Modifier cette affiche"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* Delete */}
                  {deleteConfirmId === banner.id ? (
                    <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-xl border border-rose-200 animate-in fade-in">
                      <button
                        type="button"
                        onClick={() => handleDeleteBanner(banner.id)}
                        className="px-2 py-1 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition cursor-pointer"
                      >
                        Confirmer
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(null)}
                        className="p-1 rounded-lg text-stone-500 hover:bg-stone-200 transition cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(banner.id)}
                      className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition cursor-pointer"
                      title="Supprimer cette affiche"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =========================================================================
          MODAL 1 : AJOUTER OU MODIFIER UNE AFFICHE
      ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-[#1B3022] to-[#2D5A27] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-2xl bg-amber-400 text-neutral-950 font-black shadow-xs">
                  <Tv className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-base sm:text-lg">
                    {editingBannerId ? "Modifier l'Affiche Publicitaire" : "Créer une Nouvelle Affiche de Pub"}
                  </h3>
                  <p className="text-xs text-emerald-200">
                    Définissez le visuel, le texte accrocheur et la redirection pour Horon Mousso.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-stone-300 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveBanner} className="p-5 sm:p-7 space-y-6 max-h-[80vh] overflow-y-auto">
              
              {/* SOURCE DE L'IMAGE */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-800">
                    1. Image du Panneau Publicitaire *
                  </label>
                  <span className="text-[11px] text-stone-400">Recommandé : format paysage (1920x800 ou 16:9)</span>
                </div>

                {/* Onglets de source */}
                <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-2">
                  <button
                    type="button"
                    onClick={() => setActiveImageTab('upload')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      activeImageTab === 'upload'
                        ? 'bg-[#2D5A27] text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Importer depuis mon appareil</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveImageTab('media')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      activeImageTab === 'media'
                        ? 'bg-[#2D5A27] text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>Choisir dans la Galerie ({media.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveImageTab('presets')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      activeImageTab === 'presets'
                        ? 'bg-[#2D5A27] text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Photos Terroir Horon Mousso</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveImageTab('url')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      activeImageTab === 'url'
                        ? 'bg-[#2D5A27] text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Lien URL externe</span>
                  </button>
                </div>

                {/* Tab 1: Upload */}
                {activeImageTab === 'upload' && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-stone-300 hover:border-emerald-600 rounded-2xl p-6 text-center cursor-pointer transition bg-stone-50 hover:bg-emerald-50/40 flex flex-col items-center justify-center min-h-[120px]"
                  >
                    <Upload className="w-8 h-8 text-stone-400 mb-1.5" />
                    <span className="text-xs font-bold text-stone-800">
                      {isUploading ? 'Traitement de l’image...' : 'Cliquez pour sélectionner une photo sur votre téléphone ou ordinateur'}
                    </span>
                    <span className="text-[11px] text-stone-400 mt-0.5">Formats acceptés : JPG, PNG, WebP (Max 5 Mo)</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </div>
                )}

                {/* Tab 2: Galerie Media */}
                {activeImageTab === 'media' && (
                  <div className="space-y-2">
                    {media.length === 0 ? (
                      <div className="p-4 bg-stone-50 rounded-xl text-center text-xs text-stone-500">
                        Aucune image dans votre galerie pour l'instant. Vous pouvez importer un fichier ou choisir un modèle ci-dessous.
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
                        {media.map(m => (
                          <div
                            key={m.id}
                            onClick={() => setFormState(prev => ({ ...prev, imageUrl: m.url }))}
                            className={`relative rounded-xl overflow-hidden aspect-video border-2 cursor-pointer transition ${
                              formState.imageUrl === m.url
                                ? 'border-emerald-600 ring-2 ring-emerald-500'
                                : 'border-stone-200 hover:border-stone-400'
                            }`}
                          >
                            <img src={m.url} alt={m.title} className="w-full h-full object-cover" />
                            {formState.imageUrl === m.url && (
                              <div className="absolute top-1 right-1 bg-emerald-600 text-white p-1 rounded-full">
                                <Check className="w-3 h-3" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 3: Presets */}
                {activeImageTab === 'presets' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto p-1">
                    {BANNER_PRESETS.map((preset, pIdx) => (
                      <div
                        key={pIdx}
                        onClick={() => {
                          setFormState(prev => ({
                            ...prev,
                            imageUrl: preset.imageUrl,
                            title: prev.title || preset.title,
                            subtitle: prev.subtitle || preset.subtitle,
                            badge: prev.badge || preset.badge,
                            badgeColor: preset.badgeColor,
                            overlayOpacity: preset.overlayOpacity,
                            textAlignment: preset.textAlignment
                          }));
                        }}
                        className={`p-2 rounded-xl border text-left text-xs transition cursor-pointer flex flex-col gap-1.5 ${
                          formState.imageUrl === preset.imageUrl
                            ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600'
                            : 'border-stone-200 hover:border-stone-300 bg-white'
                        }`}
                      >
                        <div className="aspect-video w-full rounded-lg overflow-hidden bg-stone-900">
                          <img src={preset.imageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                        <span className="font-bold text-[11px] text-stone-800 truncate">{preset.name}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tab 4: URL */}
                {activeImageTab === 'url' && (
                  <div className="space-y-1.5">
                    <input
                      type="url"
                      value={formState.imageUrl}
                      onChange={e => setFormState(prev => ({ ...prev, imageUrl: e.target.value }))}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                )}

                {/* Live Form Image Preview */}
                {formState.imageUrl && (
                  <div className="relative rounded-2xl overflow-hidden border border-stone-300 h-44 bg-neutral-950 mt-3 shadow-inner">
                    {/* Ambient blur backdrop */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <img src={formState.imageUrl} alt="" className="w-full h-full object-cover blur-xl opacity-40 scale-110" />
                    </div>
                    {/* Main image */}
                    <img 
                      src={formState.imageUrl} 
                      alt="Aperçu" 
                      className={`relative z-1 w-full h-full ${
                        formState.imageFit === 'cover' ? 'object-cover' : 'object-contain'
                      }`} 
                    />
                    <div
                      className={`absolute inset-0 z-2 p-4 flex flex-col justify-end text-white ${
                        formState.overlayOpacity === 'light'
                          ? 'bg-gradient-to-t from-black/70 via-black/35 to-transparent'
                          : formState.overlayOpacity === 'dark'
                          ? 'bg-gradient-to-t from-black/95 via-black/80 to-black/40'
                          : formState.overlayOpacity === 'none'
                          ? 'bg-gradient-to-t from-black/40 via-transparent to-transparent'
                          : 'bg-gradient-to-t from-black/90 via-black/60 to-transparent'
                      }`}
                    >
                      {formState.badge && !formState.isPureImage && (
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded w-fit mb-1 ${
                            formState.badgeColor === 'green'
                              ? 'bg-emerald-600 text-white'
                              : formState.badgeColor === 'red'
                              ? 'bg-rose-600 text-white'
                              : formState.badgeColor === 'blue'
                              ? 'bg-sky-600 text-white'
                              : formState.badgeColor === 'black'
                              ? 'bg-neutral-900 text-amber-400'
                              : 'bg-amber-400 text-neutral-950'
                          }`}
                        >
                          {formState.badge}
                        </span>
                      )}
                      <p className="text-sm font-bold truncate">
                        {formState.title || (formState.isPureImage ? 'Affiche pure (100% visible)' : 'Titre de la pub')}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* CADRAGE DE CETTE AFFICHE (MULTI-ÉCRANS) */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Cadrage sur Écrans (Ordinateur, Tablette, Mobile)</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                    Lisibilité Garantie
                  </span>
                </div>
                <p className="text-[11px] text-stone-500">
                  Assurez que votre affiche s'affiche entièrement sans couper les textes ou les offres.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setFormState(prev => ({ ...prev, imageFit: 'contain' }))}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      formState.imageFit === 'contain'
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold'
                        : 'border-stone-200 bg-white hover:border-stone-300 text-stone-700'
                    }`}
                  >
                    <div className="text-xs font-bold">Entière (100% visible)</div>
                    <div className="text-[10px] text-stone-500 mt-0.5">Aucune coupure de texte (Recommandé)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormState(prev => ({ ...prev, imageFit: 'cover' }))}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      formState.imageFit === 'cover'
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold'
                        : 'border-stone-200 bg-white hover:border-stone-300 text-stone-700'
                    }`}
                  >
                    <div className="text-xs font-bold">Plein cadre (Rempli)</div>
                    <div className="text-[10px] text-stone-500 mt-0.5">Remplissage sans bandes d'arrière-plan</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormState(prev => ({ ...prev, imageFit: 'auto' }))}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      formState.imageFit === 'auto'
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold'
                        : 'border-stone-200 bg-white hover:border-stone-300 text-stone-700'
                    }`}
                  >
                    <div className="text-xs font-bold">Automatique</div>
                    <div className="text-[10px] text-stone-500 mt-0.5">Suit les réglages généraux</div>
                  </button>
                </div>
              </div>

              {/* MODE TOGGLE : AFFICHE PURE OU AVEC TEXTES */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-stone-900">Type de conception d'affiche</div>
                  <div className="text-[11px] text-stone-500 mt-0.5">
                    {formState.isPureImage
                      ? "Affiche pure (idéal si votre image contient déjà du texte conçu dans Canva / Photoshop)"
                      : "Bannière dynamique (les textes, badges et boutons sont générés par le site)"}
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={formState.isPureImage}
                    onChange={e => setFormState(prev => ({ ...prev, isPureImage: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  <span className="ml-2 text-xs font-bold text-stone-700">Image seule</span>
                </label>
              </div>

              {/* SECTION CONTENU TEXTUEL SI PAS IMAGE PURE */}
              {!formState.isPureImage && (
                <div className="space-y-4 pt-1">
                  {/* Badge + Couleur */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Badge Promotionnel (Optionnel)
                      </label>
                      <input
                        type="text"
                        value={formState.badge}
                        onChange={e => setFormState(prev => ({ ...prev, badge: e.target.value }))}
                        placeholder="Ex: OFFRE SPÉCIALE, 100% NATUREL, NOUVEAU"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Couleur du Badge
                      </label>
                      <div className="grid grid-cols-5 gap-1.5">
                        {[
                          { id: 'gold', label: 'Or', bg: 'bg-amber-400 text-neutral-950' },
                          { id: 'green', label: 'Vert', bg: 'bg-emerald-600 text-white' },
                          { id: 'red', label: 'Rouge', bg: 'bg-rose-600 text-white' },
                          { id: 'blue', label: 'Bleu', bg: 'bg-sky-600 text-white' },
                          { id: 'black', label: 'Noir', bg: 'bg-neutral-900 text-amber-400' }
                        ].map(c => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setFormState(prev => ({ ...prev, badgeColor: c.id as any }))}
                            className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition text-center cursor-pointer ${
                              formState.badgeColor === c.id
                                ? 'ring-2 ring-emerald-600 border-emerald-600'
                                : 'border-stone-200 hover:border-stone-300'
                            } ${c.bg}`}
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Titre */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Grand Titre Accrocheur *
                    </label>
                    <input
                      type="text"
                      value={formState.title}
                      onChange={e => setFormState(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ex: L'Or Noir du Terroir : Soumbala Pur d'Exception"
                      className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Sous-titre */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Sous-titre / Descriptif Court
                    </label>
                    <textarea
                      rows={2}
                      value={formState.subtitle}
                      onChange={e => setFormState(prev => ({ ...prev, subtitle: e.target.value }))}
                      placeholder="Ex: Graines de néré sélectionnées, séchage hygiénique, arôme authentique garanti."
                      className="w-full text-xs px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Alignement & Contraste Voile Sombre */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Alignement du texte
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: 'left', label: 'Gauche', icon: AlignLeft },
                          { id: 'center', label: 'Centre', icon: AlignCenter },
                          { id: 'right', label: 'Droite', icon: AlignRight }
                        ].map(a => {
                          const IconComp = a.icon;
                          return (
                            <button
                              key={a.id}
                              type="button"
                              onClick={() => setFormState(prev => ({ ...prev, textAlignment: a.id as any }))}
                              className={`py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 cursor-pointer transition ${
                                formState.textAlignment === a.id
                                  ? 'bg-[#2D5A27] text-white border-[#2D5A27]'
                                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                              }`}
                            >
                              <IconComp className="w-3.5 h-3.5" />
                              <span>{a.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Voile Sombre (Lisibilité du texte)
                      </label>
                      <select
                        value={formState.overlayOpacity}
                        onChange={e => setFormState(prev => ({ ...prev, overlayOpacity: e.target.value as any }))}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="light">Léger (30% - pour photos déjà sombres)</option>
                        <option value="medium">Équilibré (60% - Recommandé)</option>
                        <option value="dark">Sombre (85% - Contraste maximal)</option>
                        <option value="none">Aucun voile</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* REDIRECTION & ACTION */}
              <div className="space-y-3 pt-2 border-t border-stone-200">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-800">
                  2. Redirection & Action au Clic
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Destination du clic
                    </label>
                    <select
                      value={formState.productId ? 'specific_product' : formState.linkTab}
                      onChange={e => {
                        const val = e.target.value;
                        if (val === 'specific_product') {
                          setFormState(prev => ({
                            ...prev,
                            linkTab: 'produits',
                            productId: products[0]?.id || ''
                          }));
                        } else {
                          setFormState(prev => ({
                            ...prev,
                            linkTab: val,
                            productId: ''
                          }));
                        }
                      }}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      <option value="produits">Catalogue des Produits</option>
                      <option value="specific_product">Cibler un produit précis du catalogue</option>
                      <option value="whatsapp">Ouvrir WhatsApp directement</option>
                      <option value="contact">Page Contact & Commandes</option>
                      <option value="actualites">Annonces & Actualités</option>
                      <option value="a_propos">À propos d'Horon Mousso</option>
                      <option value="galerie">Galerie Photos</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Libellé du Bouton
                    </label>
                    <input
                      type="text"
                      value={formState.buttonText}
                      onChange={e => setFormState(prev => ({ ...prev, buttonText: e.target.value }))}
                      placeholder="Ex: Découvrir, Commander maintenant"
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Si produit spécifique */}
                {formState.productId !== '' && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <label className="block text-xs font-bold text-amber-900 mb-1">
                      Sélectionnez le produit ciblé :
                    </label>
                    <select
                      value={formState.productId}
                      onChange={e => setFormState(prev => ({ ...prev, productId: e.target.value }))}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-amber-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.format}) - {p.price}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Si WhatsApp : Message pré-rempli */}
                {formState.linkTab === 'whatsapp' && (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                    <label className="block text-xs font-bold text-emerald-900 mb-1">
                      Message pré-rempli sur WhatsApp :
                    </label>
                    <input
                      type="text"
                      value={formState.customWhatsAppMessage}
                      onChange={e => setFormState(prev => ({ ...prev, customWhatsAppMessage: e.target.value }))}
                      placeholder="Bonjour Horon Mousso, je souhaite commander l'offre spéciale vue sur votre panneau..."
                      className="w-full text-xs px-3 py-2 rounded-lg border border-emerald-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                )}
              </div>

              {/* STATUT D'AFFICHAGE */}
              <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-stone-800">Statut de diffusion</div>
                  <div className="text-[11px] text-stone-500">
                    L'affiche sera visible immédiatement dans le carrousel.
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.active}
                    onChange={e => setFormState(prev => ({ ...prev, active: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  <span className="ml-2 text-xs font-bold text-stone-700">
                    {formState.active ? 'Actif' : 'Masqué'}
                  </span>
                </label>
              </div>

              {/* MODAL ACTIONS */}
              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100 transition cursor-pointer"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={isUploading || !formState.imageUrl}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2D5A27] hover:bg-[#23471f] text-white font-bold text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingBannerId ? 'Enregistrer les modifications' : 'Ajouter au panneau'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2 : IDÉES & MODÈLES D'INSPIRATION HORON MOUSSO
      ========================================================================= */}
      {isTemplatesModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-neutral-950 text-amber-400 font-bold">
                  <Sparkles className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-black text-base sm:text-lg">
                    Modèles d'Affiches Prêts à l'Emploi
                  </h3>
                  <p className="text-xs text-neutral-900/80 font-medium">
                    Sélectionnez un modèle spécialement rédigé pour Horon Mousso pour l'ajouter en 1 clic.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsTemplatesModalOpen(false)}
                className="p-1.5 text-neutral-950 hover:bg-black/10 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
              {TEMPLATES_INSPIRATION.map((tmpl, tIdx) => (
                <div
                  key={tIdx}
                  className="rounded-2xl border border-stone-200 p-4 space-y-3 hover:border-amber-400 hover:shadow-md transition bg-stone-50/50 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-stone-900">
                      <img src={tmpl.imageUrl} alt="" className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-neutral-950 shadow-xs">
                          {tmpl.badge}
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] font-extrabold text-amber-700 uppercase">
                      {tmpl.categoryName}
                    </div>
                    <h4 className="text-sm font-bold text-stone-900">{tmpl.title}</h4>
                    <p className="text-xs text-stone-600 line-clamp-2">{tmpl.subtitle}</p>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-stone-200">
                    <span className="text-[11px] text-stone-400">Bouton : {tmpl.buttonText}</span>
                    <button
                      type="button"
                      onClick={() => handleApplyTemplate(tmpl)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2D5A27] hover:bg-[#23471f] text-white text-xs font-bold transition cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ajouter au panneau</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3 : APERÇU GRAND FORMAT (FULLSCREEN PREVIEW)
      ========================================================================= */}
      {previewBanner && (
        <div
          onClick={() => setPreviewBanner(null)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-neutral-950 rounded-3xl overflow-hidden shadow-2xl border border-amber-500/30 cursor-default"
          >
            <button
              onClick={() => setPreviewBanner(null)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 text-white hover:bg-black transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative w-full h-[360px] sm:h-[480px]">
              <img
                src={previewBanner.imageUrl}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black/90 via-black/60 to-transparent p-6 sm:p-10 flex flex-col justify-end text-white">
                {previewBanner.badge && (
                  <span className="px-3 py-1 rounded-full bg-amber-400 text-neutral-950 font-black text-xs uppercase w-fit mb-2">
                    {previewBanner.badge}
                  </span>
                )}
                {previewBanner.title && (
                  <h2 className="text-2xl sm:text-4xl font-black font-serif-heading">
                    {previewBanner.title}
                  </h2>
                )}
                {previewBanner.subtitle && (
                  <p className="text-xs sm:text-sm text-stone-300 mt-2 max-w-xl">
                    {previewBanner.subtitle}
                  </p>
                )}
                <div className="pt-4">
                  <span className="px-5 py-2.5 rounded-full bg-emerald-600 text-white font-bold text-xs inline-block">
                    {previewBanner.buttonText || 'Découvrir'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4 : AJOUTER PLUSIEURS IMAGES (LOT) ET SYNCHRONISATION DIRECTE
      ========================================================================= */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-[#1B3022] via-[#23471f] to-[#1B3022] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-2xl bg-amber-400 text-neutral-950 font-black shadow-md flex items-center justify-center">
                  <CloudUpload className="w-6 h-6" />
                </span>
                <div>
                  <h3 className="font-bold text-base sm:text-lg">
                    Ajouter Plusieurs Photos au Panneau ({batchFiles.length} photo{batchFiles.length > 1 ? 's' : ''})
                  </h3>
                  <p className="text-xs text-emerald-200">
                    Optimisation automatique et synchronisation immédiate avec la base de données Firestore.
                  </p>
                </div>
              </div>

              {!batchUploading && (
                <button
                  type="button"
                  onClick={() => {
                    setIsBatchModalOpen(false);
                    setBatchFiles([]);
                  }}
                  className="p-2 text-stone-300 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Content */}
            <div className="p-5 sm:p-7 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* 1. Previews of selected photos */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-800">
                    1. Photos sélectionnées ({batchFiles.length})
                  </label>
                  <button
                    type="button"
                    disabled={batchUploading}
                    onClick={() => batchFileInputRef.current?.click()}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter d'autres photos</span>
                  </button>
                </div>

                {batchFiles.length === 0 ? (
                  <div className="p-8 border-2 border-dashed border-stone-300 rounded-2xl text-center space-y-2">
                    <p className="text-xs text-stone-500">Aucune photo sélectionnée.</p>
                    <button
                      type="button"
                      onClick={() => batchFileInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold cursor-pointer transition"
                    >
                      Sélectionner des fichiers
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {batchFiles.map((file, idx) => {
                      const tempUrl = URL.createObjectURL(file);
                      const sizeKb = Math.round(file.size / 1024);
                      return (
                        <div
                          key={idx}
                          className="relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-50 group aspect-4/3 flex flex-col shadow-2xs"
                        >
                          <img
                            src={tempUrl}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90 p-2 flex flex-col justify-end text-white text-[10px]">
                            <span className="font-bold truncate">{file.name}</span>
                            <span className="text-stone-300 text-[9px]">{sizeKb} Ko</span>
                          </div>

                          {!batchUploading && (
                            <button
                              type="button"
                              onClick={() => {
                                setBatchFiles(prev => prev.filter((_, i) => i !== idx));
                              }}
                              className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 hover:bg-rose-600 text-white transition cursor-pointer"
                              title="Retirer cette photo"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 2. Format & Options */}
              <div className="space-y-4 pt-4 border-t border-stone-200">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-800 block">
                  2. Style d'affichage des photos
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => !batchUploading && setBatchMode('pure')}
                    className={`p-4 rounded-2xl border-2 transition cursor-pointer ${
                      batchMode === 'pure'
                        ? 'border-emerald-600 bg-emerald-50/50'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs text-stone-900">
                      <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        batchMode === 'pure' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-stone-300'
                      }`}>
                        {batchMode === 'pure' && <Check className="w-2.5 h-2.5" />}
                      </span>
                      <span>Affiches pures (Recommandé)</span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1 pl-6 leading-relaxed">
                      Idéal si vos images contiennent déjà du texte, vos logos ou des offres promotionnelles graphiques. Aucun texte ne sera surimposé.
                    </p>
                  </div>

                  <div
                    onClick={() => !batchUploading && setBatchMode('with_text')}
                    className={`p-4 rounded-2xl border-2 transition cursor-pointer ${
                      batchMode === 'with_text'
                        ? 'border-emerald-600 bg-emerald-50/50'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs text-stone-900">
                      <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        batchMode === 'with_text' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-stone-300'
                      }`}>
                        {batchMode === 'with_text' && <Check className="w-2.5 h-2.5" />}
                      </span>
                      <span>Bannières avec Titre & Bouton</span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1 pl-6 leading-relaxed">
                      Génère un titre automatique à partir du nom du fichier photo, avec un badge doré et un bouton d'action vers WhatsApp.
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. Redirection */}
              <div className="space-y-2 pt-4 border-t border-stone-200">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-800 block">
                  3. Redirection au clic pour ces photos
                </label>
                <select
                  value={batchDefaultTab}
                  disabled={batchUploading}
                  onChange={e => setBatchDefaultTab(e.target.value)}
                  className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="produits">Section Produits & Boutique (Catalogue complet)</option>
                  <option value="actualites">Section Actualités & Événements</option>
                  <option value="galerie">Galerie Terroir & Photos</option>
                  <option value="contact">Contact & Commande WhatsApp direct</option>
                </select>
              </div>

              {/* Upload & Sync Progress */}
              {batchUploading && (
                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-900 flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
                      Optimisation et synchronisation avec la base de données...
                    </span>
                    <span className="font-extrabold text-amber-900">
                      {batchProgress.current} / {batchProgress.total}
                    </span>
                  </div>

                  <div className="w-full bg-amber-200/60 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-2.5 rounded-full transition-all duration-300"
                      style={{
                        width: `${batchProgress.total > 0 ? (batchProgress.current / batchProgress.total) * 100 : 0}%`
                      }}
                    />
                  </div>

                  <p className="text-[11px] text-amber-800 truncate">
                    Fichier en cours : <span className="font-mono font-bold">{batchProgress.filename}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
              <div className="text-xs text-stone-500 hidden sm:flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                <span>Synchronisation cloud temps réel</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  disabled={batchUploading}
                  onClick={() => {
                    setIsBatchModalOpen(false);
                    setBatchFiles([]);
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-200 transition cursor-pointer disabled:opacity-50"
                >
                  Annuler
                </button>

                <button
                  type="button"
                  disabled={batchUploading || batchFiles.length === 0}
                  onClick={handleExecuteBatchUpload}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2D5A27] hover:bg-[#23471f] text-white font-bold text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  {batchUploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Synchronisation en cours...</span>
                    </>
                  ) : (
                    <>
                      <CloudUpload className="w-4 h-4" />
                      <span>Importer & Synchroniser ({batchFiles.length} photos)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
