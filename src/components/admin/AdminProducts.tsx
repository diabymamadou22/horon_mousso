import React, { useState } from 'react';
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
  Eye, 
  Sparkles,
  Package,
  Upload,
  Image as ImageIcon
} from 'lucide-react';

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
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
    if (onCloseAddModalInitial) onCloseAddModalInitial();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !format.trim() || !description.trim()) return;

    setIsSubmitting(true);
    const additionalImages = additionalImagesText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          name,
          category,
          description,
          fullDescription,
          price,
          format,
          availability,
          mainImage: mainImage || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
          additionalImages,
          isNew,
          isFeatured,
          composition,
          origin,
          usageAdvice
        });
      } else {
        await addProduct({
          name,
          category,
          description,
          fullDescription,
          price,
          format,
          availability,
          mainImage: mainImage || 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?auto=format&fit=crop&w=800&q=80',
          additionalImages,
          isNew,
          isFeatured,
          composition,
          origin,
          usageAdvice
        });
      }
      handleCloseModal();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    await deleteProduct(productToDelete.id);
    setProductToDelete(null);
  };

  // Image upload simulation / preview
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setMainImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
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
    <div className="space-y-6 animate-in fade-in">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-emerald-700" />
            <span>Gestion des Produits Agricoles & Épices</span>
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Ajoutez, modifiez ou retirez des produits du catalogue public. ({products.length} au total)
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold py-3 px-5 rounded-xl shadow-xs transition"
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

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
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
                        <img
                          src={prod.mainImage}
                          alt=""
                          className="w-12 h-12 rounded-xl object-cover bg-stone-100 border border-stone-200 shrink-0"
                          referrerPolicy="no-referrer"
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
                onClick={() => setProductToDelete(null)}
                className="py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmDelete}
                className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition"
              >
                Confirmer la suppression
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Nom du Produit <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Piment Rouge en Poudre"
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                  />
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
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Prix (facultatif)
                  </label>
                  <input
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Ex: 1 500 FCFA ou Sur devis"
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Format / Conditionnement <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    placeholder="Ex: Sachet 100g, 500g, Sac 25kg"
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                  />
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
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Description Courte <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Résumé pour les cartes du catalogue..."
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                />
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

              {/* Photos Management */}
              <div className="space-y-3 p-4 bg-stone-50 rounded-2xl border border-stone-200">
                <label className="block text-xs font-bold text-stone-900">
                  Photos du Produit
                </label>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    URL de la Photo Principale
                  </label>
                  <input
                    type="url"
                    value={mainImage}
                    onChange={(e) => setMainImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full text-xs p-2.5 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 text-[11px] font-bold py-1.5 px-3 rounded-lg transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Téléverser une image locale</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                  {mainImage && (
                    <div className="flex items-center gap-2">
                      <img src={mainImage} alt="preview" className="w-8 h-8 rounded object-cover border" />
                      <span className="text-[10px] text-stone-400">Aperçu</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Photos supplémentaires (une URL par ligne)
                  </label>
                  <textarea
                    rows={2}
                    value={additionalImagesText}
                    onChange={(e) => setAdditionalImagesText(e.target.value)}
                    placeholder="https://... (photo 2)&#10;https://... (photo 3)"
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
                    placeholder="Ex: 100% Piment rouge"
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

              {/* Action Buttons */}
              <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Enregistrement...' : 'Enregistrer le produit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
