import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, ProductAvailability } from '../../types';
import { 
  PlusCircle, 
  Search, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  AlertTriangle, 
  AlertCircle,
  Eye, 
  Sparkles,
  Package,
  Upload,
  Image as ImageIcon,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { LazyProductImage } from '../common/LazyProductImage';
import { uploadMediaFile } from '../../utils/mediaUpload';

export interface ProductFormErrors {
  name?: string;
  format?: string;
  description?: string;
  price?: string;
  mainImage?: string;
}

/**
 * Checks if a user-entered price string represents a negative value.
 * Handles forms like: "-1500", "- 1500", "-500 FCFA", "-10 €", or starting with minus.
 */
export const checkNegativePrice = (priceVal: string): boolean => {
  const trimmed = priceVal.trim();
  if (!trimmed) return false;

  // 1. Check for negative signs before digits or at beginning
  if (/-\s*\d+/.test(trimmed) || /^\s*-/.test(trimmed)) {
    return true;
  }

  // 2. Extract first numeric token with optional sign
  const match = trimmed.replace(/\s+/g, '').match(/(-?\d+(?:[.,]\d+)?)/);
  if (match) {
    const num = parseFloat(match[0].replace(',', '.'));
    if (!isNaN(num) && num < 0) return true;
  }

  return false;
};

/**
 * Validates product form in real-time, preventing empty required fields and negative prices.
 */
export const validateProductForm = (
  valName: string,
  valFormat: string,
  valDesc: string,
  valPrice: string,
  valImage: string
): ProductFormErrors => {
  const errs: ProductFormErrors = {};

  // Name: mandatory, non-empty, min 2 chars
  const trimmedName = valName.trim();
  if (!trimmedName) {
    errs.name = 'Le nom du produit est obligatoire.';
  } else if (trimmedName.length < 2) {
    errs.name = 'Le nom du produit doit comporter au moins 2 caractères.';
  }

  // Format: mandatory, non-empty
  const trimmedFormat = valFormat.trim();
  if (!trimmedFormat) {
    errs.format = 'Le format / conditionnement est obligatoire (ex: Sachet 100g, Sac 25kg).';
  }

  // Description: mandatory, non-empty, min 5 chars
  const trimmedDesc = valDesc.trim();
  if (!trimmedDesc) {
    errs.description = 'La description courte est obligatoire.';
  } else if (trimmedDesc.length < 5) {
    errs.description = 'La description doit comporter au moins 5 caractères.';
  }

  // Price: optional, but strictly cannot be negative
  if (valPrice && checkNegativePrice(valPrice)) {
    errs.price = 'Le prix ne peut pas être négatif. Indiquez un montant positif (ex: 1 500 FCFA).';
  }

  // Main Image: mandatory, non-empty
  const trimmedImage = valImage.trim();
  if (!trimmedImage) {
    errs.mainImage = 'Une photo principale est obligatoire pour la présentation du produit.';
  }

  return errs;
};

interface AdminProductsProps {
  isAddModalOpenInitially?: boolean;
  onCloseAddModalInitial?: () => void;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({
  isAddModalOpenInitially = false,
  onCloseAddModalInitial
}) => {
  const { products, addProduct, updateProduct, deleteProduct, openProductDetail, setIsAdminMode } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(isAddModalOpenInitially);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'piments' | 'epices' | 'produits_transformes'>('piments');
  const [description, setDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [price, setPrice] = useState('');
  const [format, setFormat] = useState('');
  const [availability, setAvailability] = useState<ProductAvailability>('disponible');
  const [mainImage, setMainImage] = useState('');
  const [additionalImagesText, setAdditionalImagesText] = useState('');
  const [isNew, setIsNew] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [composition, setComposition] = useState('');
  const [origin, setOrigin] = useState('');
  const [usageAdvice, setUsageAdvice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingAdditional, setIsUploadingAdditional] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const [successAlert, setSuccessAlert] = useState('');

  // Real-time validation state
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const markTouched = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Real-time validation computation on every keystroke/change
  const errors = useMemo(() => {
    return validateProductForm(name, format, description, price, mainImage);
  }, [name, format, description, price, mainImage]);

  const isFormValid = Object.keys(errors).length === 0;

  const shouldShowError = (field: keyof ProductFormErrors) => {
    if (!errors[field]) return false;
    // Negative price is an active error - show immediately in real-time as user types
    if (field === 'price' && errors.price) return true;
    // Other fields show error if field was interacted with (touched) or after submit attempt
    return Boolean(hasAttemptedSubmit || touched[field]);
  };

  const isFieldValid = (field: keyof ProductFormErrors) => {
    if (errors[field]) return false;
    if (field === 'name') return name.trim().length >= 2;
    if (field === 'format') return format.trim().length > 0;
    if (field === 'description') return description.trim().length >= 5;
    if (field === 'mainImage') return mainImage.trim().length > 0;
    if (field === 'price') return price.trim().length > 0 && !checkNegativePrice(price);
    return false;
  };

  const resetForm = () => {
    setName('');
    setCategory('piments');
    setDescription('');
    setFullDescription('');
    setPrice('');
    setFormat('');
    setAvailability('disponible');
    setMainImage('https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?auto=format&fit=crop&w=800&q=80');
    setAdditionalImagesText('');
    setIsNew(false);
    setIsFeatured(false);
    setComposition('');
    setOrigin('Terroir agricole local');
    setUsageAdvice('');
    setEditingProduct(null);
    setSuccessAlert('');
    setTouched({});
    setHasAttemptedSubmit(false);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setCategory(p.category);
    setDescription(p.description);
    setFullDescription(p.fullDescription || '');
    setPrice(p.price || '');
    setFormat(p.format);
    setAvailability(p.availability);
    setMainImage(p.mainImage);
    setAdditionalImagesText((p.additionalImages || []).join('\n'));
    setIsNew(Boolean(p.isNew));
    setIsFeatured(Boolean(p.isFeatured));
    setComposition(p.composition || '');
    setOrigin(p.origin || '');
    setUsageAdvice(p.usageAdvice || '');
    setTouched({});
    setHasAttemptedSubmit(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
    if (onCloseAddModalInitial) onCloseAddModalInitial();
  };

  const saveProductData = async (addAnother = false) => {
    setHasAttemptedSubmit(true);

    // Strictly validate against empty required fields and negative prices
    const validationErrors = validateProductForm(name, format, description, price, mainImage);
    if (Object.keys(validationErrors).length > 0) {
      setTouched({
        name: true,
        format: true,
        description: true,
        price: true,
        mainImage: true
      });
      return;
    }

    setIsSubmitting(true);
    setSuccessAlert('');
    const additionalImages = additionalImagesText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          name: name.trim(),
          category,
          description: description.trim(),
          fullDescription: fullDescription.trim(),
          price: price.trim(),
          format: format.trim(),
          availability,
          mainImage: mainImage.trim() || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
          additionalImages,
          isNew,
          isFeatured,
          composition: composition.trim(),
          origin: origin.trim(),
          usageAdvice: usageAdvice.trim()
        });
        handleCloseModal();
      } else {
        const created = await addProduct({
          name: name.trim(),
          category,
          description: description.trim(),
          fullDescription: fullDescription.trim(),
          price: price.trim(),
          format: format.trim(),
          availability,
          mainImage: mainImage.trim() || 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?auto=format&fit=crop&w=800&q=80',
          additionalImages,
          isNew,
          isFeatured,
          composition: composition.trim(),
          origin: origin.trim(),
          usageAdvice: usageAdvice.trim()
        });

        if (addAnother) {
          // Keep modal open and ready for the next product!
          resetForm();
          setSuccessAlert(`« ${created.name} » ajouté avec succès ! Vous pouvez maintenant saisir le produit suivant.`);
          setTimeout(() => setSuccessAlert(''), 5000);
        } else {
          handleCloseModal();
        }
      }
    } catch (err) {
      console.error('Erreur enregistrement produit:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveProductData(false);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete || isDeleting) return;
    setIsDeleting(true);
    try {
      const success = await deleteProduct(productToDelete.id);
      if (success) {
        setProductToDelete(null);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // High performance & persistent image upload with Firebase Cloud Storage + fallback
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingImage(true);
      setUploadStatusText('Optimisation...');
      try {
        const result = await uploadMediaFile(file, (msg) => setUploadStatusText(msg), 'products');
        setMainImage(result.url);
      } catch (err) {
        console.error('Erreur téléversement image produit:', err);
      } finally {
        setIsUploadingImage(false);
        setUploadStatusText('');
      }
    }
  };

  const handleAdditionalImagesFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingAdditional(true);
    setUploadStatusText('Téléversement des photos...');
    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadStatusText(`Téléversement ${i + 1}/${files.length}...`);
        const result = await uploadMediaFile(file, (msg) => setUploadStatusText(`Photo ${i + 1}/${files.length}: ${msg}`), 'products');
        if (result.url) {
          urls.push(result.url);
        }
      }
      if (urls.length > 0) {
        setAdditionalImagesText(prev => {
          const current = prev.trim();
          return current ? `${current}\n${urls.join('\n')}` : urls.join('\n');
        });
      }
    } catch (err) {
      console.error('Erreur téléversement photos additionnelles:', err);
    } finally {
      setIsUploadingAdditional(false);
      setUploadStatusText('');
    }
  };

  const filteredProducts = products.filter(p => {
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      return p.name.toLowerCase().includes(query) || p.format.toLowerCase().includes(query);
    }
    return true;
  });

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-700" />
            <span>Gestion des Produits Agricoles & Épices</span>
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Ajoutez, modifiez ou retirez des produits du catalogue public. ({products.length} au total)
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Ajouter un Produit</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom ou conditionnement..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          aria-label="Filtrer par catégorie"
          className="text-xs font-semibold py-2 px-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-700"
        >
          <option value="all">Toutes les catégories</option>
          <option value="piments">Piments</option>
          <option value="epices">Épices</option>
          <option value="produits_transformes">Produits transformés</option>
        </select>
      </div>

      {/* Products Display (Mobile Cards + Desktop Table) */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden">
        {/* Mobile View: Touch-optimized Cards */}
        <div className="md:hidden divide-y divide-stone-100">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(prod => (
              <div key={prod.id} className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <LazyProductImage
                    src={prod.mainImage}
                    alt={prod.name}
                    containerClassName="w-20 h-20 rounded-2xl bg-stone-100 border border-stone-200 shrink-0"
                    className="w-full h-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        prod.availability === 'disponible'
                          ? 'bg-emerald-100 text-emerald-800'
                          : prod.availability === 'sur_commande'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {prod.availability === 'disponible' ? 'En stock' : prod.availability === 'sur_commande' ? 'Sur commande' : 'Rupture'}
                      </span>
                      {prod.isFeatured && (
                        <span className="text-[9px] font-black text-emerald-900 bg-emerald-100 px-1.5 py-0.5 rounded-md">
                          Phare
                        </span>
                      )}
                      {prod.isNew && (
                        <span className="text-[9px] font-black text-amber-900 bg-amber-200 px-1.5 py-0.5 rounded-md">
                          Nouveau
                        </span>
                      )}
                    </div>
                    <h4 className="font-extrabold text-stone-900 text-sm mt-1 leading-snug">
                      {prod.name}
                    </h4>
                    <p className="text-xs text-stone-500 font-medium mt-0.5">
                      {prod.format} • {prod.category === 'piments' ? 'Piments' : prod.category === 'epices' ? 'Épices' : 'Transformé'}
                    </p>
                    <div className="text-sm font-black text-[#2D5A27] mt-1">
                      {prod.price || '—'}
                    </div>
                  </div>
                </div>

                {/* Mobile Action Buttons */}
                <div className="flex items-center gap-2 pt-1 border-t border-stone-100">
                  <button
                    onClick={() => {
                      setIsAdminMode(false);
                      openProductDetail(prod.id);
                    }}
                    className="flex-1 py-2 px-3 bg-stone-50 hover:bg-stone-100 text-stone-700 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Aperçu</span>
                  </button>
                  <button
                    onClick={() => handleOpenEdit(prod)}
                    className="flex-1 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Modifier</span>
                  </button>
                  <button
                    onClick={() => setProductToDelete(prod)}
                    className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold inline-flex items-center justify-center transition cursor-pointer"
                    aria-label="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-stone-400 text-xs px-4">
              Aucun produit ne correspond à votre filtre.
            </div>
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Produit</th>
                <th className="py-3.5 px-4">Catégorie</th>
                <th className="py-3.5 px-4">Conditionnement</th>
                <th className="py-3.5 px-4">Prix</th>
                <th className="py-3.5 px-4">Disponibilité</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredProducts.length > 0 ? (
                filteredProducts.map(prod => (
                  <tr key={prod.id} className="hover:bg-stone-50/70 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <LazyProductImage
                          src={prod.mainImage}
                          alt={prod.name}
                          containerClassName="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200 shrink-0"
                          className="w-full h-full object-cover"
                        />
                        <div>
                          <div className="font-bold text-stone-900 line-clamp-1">{prod.name}</div>
                          <div className="text-[11px] text-stone-500 line-clamp-1 max-w-xs">{prod.description}</div>
                          <div className="flex gap-1 mt-0.5">
                            {prod.isNew && (
                              <span className="text-[9px] font-black text-amber-900 bg-amber-200 px-1.5 py-0.2 rounded">
                                Nouveau
                              </span>
                            )}
                            {prod.isFeatured && (
                              <span className="text-[9px] font-black text-emerald-900 bg-emerald-100 px-1.5 py-0.2 rounded">
                                Phare
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-stone-700 capitalize">
                      {prod.category === 'piments' ? 'Piments' : prod.category === 'epices' ? 'Épices' : 'Transformé'}
                    </td>

                    <td className="py-3.5 px-4 text-stone-600 font-medium max-w-[200px] truncate" title={prod.format}>
                      {prod.format}
                    </td>

                    <td className="py-3.5 px-4 font-extrabold text-emerald-800">
                      {prod.price || '—'}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        prod.availability === 'disponible'
                          ? 'bg-emerald-100 text-emerald-800'
                          : prod.availability === 'sur_commande'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {prod.availability === 'disponible' ? 'En stock' : prod.availability === 'sur_commande' ? 'Sur commande' : 'Rupture'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setIsAdminMode(false);
                            openProductDetail(prod.id);
                          }}
                          className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition"
                          title="Aperçu fiche client"
                          aria-label="Aperçu client"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(prod)}
                          className="p-1.5 text-emerald-700 hover:text-emerald-950 hover:bg-emerald-50 rounded-lg transition"
                          title="Modifier le produit"
                          aria-label="Modifier"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setProductToDelete(prod)}
                          className="p-1.5 text-rose-600 hover:text-rose-900 hover:bg-rose-50 rounded-lg transition"
                          title="Supprimer le produit"
                          aria-label="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-400">
                    Aucun produit ne correspond à votre filtre.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal (Required by prompt) */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-stone-200 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-extrabold text-stone-900">
                Voulez-vous vraiment supprimer ce produit ?
              </h3>
              <p className="text-xs text-stone-500">
                Le produit « <span className="font-bold text-stone-800">{productToDelete.name}</span> » sera définitivement retiré du catalogue public.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setProductToDelete(null)}
                className="py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {isDeleting ? 'Suppression...' : 'Confirmer la suppression'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50">
              <h3 className="font-extrabold text-base text-stone-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-700" />
                <span>{editingProduct ? 'Modifier le Produit' : 'Ajouter un Produit'}</span>
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-1.5 text-stone-400 hover:text-stone-800 rounded-full hover:bg-stone-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Validation Alert Banner upon attempted submit with errors */}
              {hasAttemptedSubmit && !isFormValid && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-900 text-xs font-medium animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-bold text-rose-950 block">Impossible d'enregistrer le produit :</span>
                    <ul className="list-disc list-inside mt-1 space-y-0.5 text-rose-700 text-[11px]">
                      {errors.name && <li>Nom : {errors.name}</li>}
                      {errors.price && <li>Prix : {errors.price}</li>}
                      {errors.format && <li>Format : {errors.format}</li>}
                      {errors.description && <li>Description : {errors.description}</li>}
                      {errors.mainImage && <li>Photo principale : {errors.mainImage}</li>}
                    </ul>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-stone-700">
                      Nom du Produit <span className="text-red-500">*</span>
                    </label>
                    {isFieldValid('name') && (
                      <span className="text-[10px] text-emerald-600 font-semibold inline-flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Valide
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={name}
                    onBlur={() => markTouched('name')}
                    onChange={(e) => {
                      setName(e.target.value);
                      markTouched('name');
                    }}
                    placeholder="Ex: Piment Rouge en Poudre"
                    className={`w-full text-xs p-2.5 rounded-xl border transition ${
                      shouldShowError('name')
                        ? 'border-red-400 bg-red-50/20 text-stone-900 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                        : isFieldValid('name')
                        ? 'border-emerald-300 bg-emerald-50/10 focus:ring-2 focus:ring-emerald-700'
                        : 'border-stone-200 bg-stone-50 focus:ring-2 focus:ring-emerald-700 focus:bg-white'
                    }`}
                  />
                  {shouldShowError('name') && (
                    <p className="mt-1 text-[11px] font-semibold text-red-600 flex items-center gap-1 animate-in fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.name}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Catégorie <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                  >
                    <option value="piments">Piments (poudre, séchés, pâte)</option>
                    <option value="epices">Épices (gingembre, curcuma, ail, etc.)</option>
                    <option value="produits_transformes">Produits transformés (mélanges, purées)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-stone-700">
                      Prix (facultatif)
                    </label>
                    {isFieldValid('price') && (
                      <span className="text-[10px] text-emerald-600 font-semibold inline-flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Valide
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={price}
                    onBlur={() => markTouched('price')}
                    onChange={(e) => {
                      setPrice(e.target.value);
                      markTouched('price');
                    }}
                    placeholder="Ex: 1 500 FCFA ou Sur devis"
                    className={`w-full text-xs p-2.5 rounded-xl border transition ${
                      shouldShowError('price')
                        ? 'border-red-400 bg-red-50/20 text-stone-900 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                        : isFieldValid('price')
                        ? 'border-emerald-300 bg-emerald-50/10 focus:ring-2 focus:ring-emerald-700'
                        : 'border-stone-200 bg-stone-50 focus:ring-2 focus:ring-emerald-700 focus:bg-white'
                    }`}
                  />
                  {shouldShowError('price') ? (
                    <div className="mt-1 flex items-center justify-between gap-1 text-[11px] font-semibold text-red-600 animate-in fade-in">
                      <div className="flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.price}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const positive = price.replace(/-/g, '').trim();
                          setPrice(positive);
                        }}
                        className="text-[10px] text-red-700 underline font-bold hover:text-red-800 whitespace-nowrap cursor-pointer ml-1"
                      >
                        Rendre positif
                      </button>
                    </div>
                  ) : (
                    !errors.price && price.trim() && /^\d+$/.test(price.trim()) && (
                      <button
                        type="button"
                        onClick={() => setPrice(`${Number(price).toLocaleString('fr-FR')} FCFA`)}
                        className="mt-1 text-[10px] text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1 font-medium transition cursor-pointer"
                      >
                        <span>Convertir en « {Number(price).toLocaleString('fr-FR')} FCFA »</span>
                      </button>
                    )
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-stone-700">
                      Format / Conditionnement <span className="text-red-500">*</span>
                    </label>
                    {isFieldValid('format') && (
                      <span className="text-[10px] text-emerald-600 font-semibold inline-flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Valide
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={format}
                    onBlur={() => markTouched('format')}
                    onChange={(e) => {
                      setFormat(e.target.value);
                      markTouched('format');
                    }}
                    placeholder="Ex: Sachet 100g, 500g, Sac 25kg"
                    className={`w-full text-xs p-2.5 rounded-xl border transition ${
                      shouldShowError('format')
                        ? 'border-red-400 bg-red-50/20 text-stone-900 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                        : isFieldValid('format')
                        ? 'border-emerald-300 bg-emerald-50/10 focus:ring-2 focus:ring-emerald-700'
                        : 'border-stone-200 bg-stone-50 focus:ring-2 focus:ring-emerald-700 focus:bg-white'
                    }`}
                  />
                  {shouldShowError('format') && (
                    <p className="mt-1 text-[11px] font-semibold text-red-600 flex items-center gap-1 animate-in fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.format}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Disponibilité <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value as ProductAvailability)}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                  >
                    <option value="disponible">En stock (Disponible)</option>
                    <option value="sur_commande">Sur commande</option>
                    <option value="rupture">Rupture de stock</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-stone-700">
                    Description Courte <span className="text-red-500">*</span>
                  </label>
                  {isFieldValid('description') && (
                    <span className="text-[10px] text-emerald-600 font-semibold inline-flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> Valide
                    </span>
                  )}
                </div>
                <textarea
                  rows={2}
                  value={description}
                  onBlur={() => markTouched('description')}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    markTouched('description');
                  }}
                  placeholder="Résumé pour les cartes du catalogue..."
                  className={`w-full text-xs p-2.5 rounded-xl border transition ${
                    shouldShowError('description')
                      ? 'border-red-400 bg-red-50/20 text-stone-900 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                      : isFieldValid('description')
                      ? 'border-emerald-300 bg-emerald-50/10 focus:ring-2 focus:ring-emerald-700'
                      : 'border-stone-200 bg-stone-50 focus:ring-2 focus:ring-emerald-700 focus:bg-white'
                  }`}
                />
                {shouldShowError('description') && (
                  <p className="mt-1 text-[11px] font-semibold text-red-600 flex items-center gap-1 animate-in fade-in">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.description}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Description Complète & Spécifications
                </label>
                <textarea
                  rows={3}
                  value={fullDescription}
                  onChange={(e) => setFullDescription(e.target.value)}
                  placeholder="Procédé de séchage, qualités organoleptiques..."
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                />
              </div>

              {/* Success Banner when adding consecutive products */}
              {successAlert && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-semibold animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successAlert}</span>
                </div>
              )}

              {/* Photos Management */}
              <div className="space-y-3 p-4 bg-stone-50 rounded-2xl border border-stone-200">
                <label className="block text-xs font-bold text-stone-900">
                  Photos du Produit
                </label>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-semibold text-stone-600">
                      URL de la Photo Principale <span className="text-red-500">*</span>
                    </label>
                    {isFieldValid('mainImage') && (
                      <span className="text-[10px] text-emerald-600 font-semibold inline-flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Photo définie
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={mainImage}
                    onBlur={() => markTouched('mainImage')}
                    onChange={(e) => {
                      setMainImage(e.target.value);
                      markTouched('mainImage');
                    }}
                    placeholder="https://... ou téléversez ci-dessous (Firebase Storage & Local)"
                    className={`w-full text-xs p-2.5 rounded-xl border transition ${
                      shouldShowError('mainImage')
                        ? 'border-red-400 bg-red-50/20 text-stone-900 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                        : isFieldValid('mainImage')
                        ? 'border-emerald-300 bg-emerald-50/10 focus:ring-2 focus:ring-emerald-700'
                        : 'border-stone-200 bg-white focus:ring-2 focus:ring-emerald-700'
                    }`}
                  />
                  {shouldShowError('mainImage') && (
                    <p className="mt-1 text-[11px] font-semibold text-red-600 flex items-center gap-1 animate-in fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.mainImage}</span>
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <label className={`cursor-pointer inline-flex items-center gap-1.5 ${isUploadingImage ? 'bg-stone-300 text-stone-500 cursor-not-allowed' : 'bg-emerald-700 hover:bg-emerald-800 text-white'} text-[11px] font-bold py-2 px-3.5 rounded-xl transition shadow-xs`}>
                    {isUploadingImage ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>{isUploadingImage ? (uploadStatusText || 'Téléversement...') : 'Téléverser photo principale'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploadingImage}
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                  {mainImage && (
                    <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-lg border border-stone-200 shadow-2xs">
                      <img src={mainImage} alt="preview" className="w-7 h-7 rounded object-cover border" />
                      <div className="flex flex-col">
                        <span className="text-[11px] text-stone-700 font-bold truncate max-w-[150px]">Photo prête</span>
                        <span className="text-[9px] text-emerald-600 font-semibold">
                          {mainImage.includes('firebasestorage.googleapis.com') ? '☁️ Firebase Storage' : mainImage.startsWith('/uploads') ? '💾 Serveur' : '🔗 URL Externe'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-semibold text-stone-600">
                      Photos supplémentaires (une URL par ligne)
                    </label>
                    <label className={`cursor-pointer inline-flex items-center gap-1 text-[10px] font-bold ${isUploadingAdditional ? 'text-stone-400 cursor-not-allowed' : 'text-emerald-700 hover:text-emerald-800'}`}>
                      <Upload className="w-3 h-3" />
                      <span>{isUploadingAdditional ? 'Envoi...' : '+ Ajouter des photos'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        disabled={isUploadingAdditional}
                        onChange={handleAdditionalImagesFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <textarea
                    rows={2}
                    value={additionalImagesText}
                    onChange={(e) => setAdditionalImagesText(e.target.value)}
                    placeholder="https://... (photo 2)&#10;https://... (photo 3) ou cliquez sur « + Ajouter des photos »"
                    className="w-full text-xs p-2 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>

              {/* Composition, Origin, Advice */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Composition</label>
                  <input
                    type="text"
                    value={composition}
                    onChange={(e) => setComposition(e.target.value)}
                    placeholder="Ex: 100% piment séché pur"
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Origine</label>
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="Ex: Terroir agricole local"
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Conseil d'utilisation</label>
                  <input
                    type="text"
                    value={usageAdvice}
                    onChange={(e) => setUsageAdvice(e.target.value)}
                    placeholder="Ex: Marinades & grillades"
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Badges Toggle */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isNew}
                    onChange={(e) => setIsNew(e.target.checked)}
                    className="rounded text-emerald-700 focus:ring-emerald-700 w-4 h-4"
                  />
                  <span>Marquer comme « Nouveau produit »</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded text-emerald-700 focus:ring-emerald-700 w-4 h-4"
                  />
                  <span>Afficher en « Produit Phare » (Accueil)</span>
                </label>
              </div>

              {/* Action Buttons & Real-time Status */}
              <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
                <div>
                  {isFormValid ? (
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5 shadow-2xs">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Formulaire valide
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      {Object.keys(errors).length} champ{Object.keys(errors).length > 1 ? 's' : ''} à compléter ou corriger
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Fermer
                  </button>
                  {!editingProduct && (
                    <button
                      type="button"
                      disabled={isSubmitting || isUploadingImage || isUploadingAdditional || (!isFormValid && hasAttemptedSubmit)}
                      onClick={() => {
                        if (!isFormValid) {
                          setHasAttemptedSubmit(true);
                          setTouched({ name: true, format: true, description: true, price: true, mainImage: true });
                          return;
                        }
                        saveProductData(true);
                      }}
                      title={!isFormValid ? 'Corrigez les erreurs avant d\'enregistrer' : undefined}
                      className={`px-4 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                        !isFormValid && hasAttemptedSubmit
                          ? 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed'
                          : 'bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800'
                      }`}
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Enregistrer & ajouter un autre</span>
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting || isUploadingImage || isUploadingAdditional || (!isFormValid && hasAttemptedSubmit)}
                    onClick={(e) => {
                      if (!isFormValid) {
                        e.preventDefault();
                        setHasAttemptedSubmit(true);
                        setTouched({ name: true, format: true, description: true, price: true, mainImage: true });
                      }
                    }}
                    title={!isFormValid ? 'Corrigez les erreurs avant d\'enregistrer' : undefined}
                    className={`px-5 py-2.5 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer ${
                      !isFormValid && hasAttemptedSubmit
                        ? 'bg-stone-400 cursor-not-allowed'
                        : 'bg-emerald-800 hover:bg-emerald-900'
                    }`}
                  >
                    {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{isSubmitting ? 'Enregistrement...' : editingProduct ? 'Mettre à jour le produit' : 'Enregistrer le produit'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
