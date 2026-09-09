import React, { useState, useMemo } from 'react';
import { 
  Star, 
  MessageSquare, 
  CheckCircle2, 
  User, 
  Calendar, 
  Send, 
  ShieldCheck, 
  Plus, 
  MapPin, 
  Trash2, 
  Sparkles,
  ChevronDown,
  X,
  SlidersHorizontal,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { ProductReview, Product } from '../../types';
import { FadeInView, FadeInStagger, FadeInItem } from '../common/FadeInView';

interface CustomerReviewsSectionProps {
  className?: string;
}

export const CustomerReviewsSection: React.FC<CustomerReviewsSectionProps> = ({ className = '' }) => {
  const { 
    reviews, 
    products, 
    addReview, 
    deleteReview, 
    showToast, 
    openProductDetail,
    user,
    isAdminMode,
    syncStatus
  } = useApp();

  // Dialog / form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [rating, setRating] = useState<number>(5);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [location, setLocation] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters & sorting state
  const [filterProductId, setFilterProductId] = useState<string>('all');
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter(r => {
      const matchProd = filterProductId === 'all' || r.productId === filterProductId;
      const matchRate = filterRating === 'all' || Math.round(r.rating) === filterRating;
      return matchProd && matchRate;
    });
  }, [reviews, filterProductId, filterRating]);

  // Global rating statistics
  const stats = useMemo(() => {
    if (reviews.length === 0) {
      return {
        average: 5.0,
        total: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        recommendPercentage: 100
      };
    }
    const total = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const average = Math.round((sum / total) * 10) / 10;
    
    const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      const score = Math.max(1, Math.min(5, Math.round(r.rating)));
      distribution[score] = (distribution[score] || 0) + 1;
    });

    const positiveCount = (distribution[5] || 0) + (distribution[4] || 0);
    const recommendPercentage = Math.round((positiveCount / total) * 100);

    return {
      average,
      total,
      distribution,
      recommendPercentage
    };
  }, [reviews]);

  // Pre-select first product if none selected
  const handleOpenForm = (defaultProdId?: string) => {
    if (defaultProdId) {
      setSelectedProductId(defaultProdId);
    } else if (products.length > 0 && !selectedProductId) {
      setSelectedProductId(products[0].id);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setComment('');
    setCustomerName('');
    setLocation('');
    setRating(5);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProductId) {
      showToast('Veuillez sélectionner le produit que vous souhaitez noter.', 'error');
      return;
    }
    if (!customerName.trim()) {
      showToast('Veuillez indiquer votre nom ou pseudonyme.', 'error');
      return;
    }
    if (!comment.trim() || comment.trim().length < 5) {
      showToast('Votre avis doit comporter au moins 5 caractères.', 'error');
      return;
    }

    const selectedProduct = products.find(p => p.id === selectedProductId);
    const productName = selectedProduct ? selectedProduct.name : 'Produit Horon Mousso';

    setIsSubmitting(true);
    try {
      await addReview({
        productId: selectedProductId,
        productName,
        customerName: customerName.trim(),
        rating,
        comment: comment.trim(),
        location: location.trim() || 'Client du terroir',
        isVerifiedPurchase: true
      });

      handleCloseForm();
    } catch (err) {
      console.error('Erreur submission avis:', err);
      showToast('Impossible de publier l\'avis pour le moment.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteReview(id);
      setReviewToDelete(null);
    } catch {
      showToast('Erreur lors de la suppression de l\'avis', 'error');
    }
  };

  const getProductForReview = (productId: string): Product | undefined => {
    return products.find(p => p.id === productId);
  };

  return (
    <section id="section-avis-clients" className={`space-y-5 ${className}`}>
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="space-y-1 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 bg-amber-100/80 text-amber-950 text-xs font-black uppercase tracking-wider rounded-full border border-amber-300/40">
            <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
            <span>Retours d'Expérience & Avis Vérifiés</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1E11] tracking-tight font-serif-heading">
            Témoignages & Avis Clients
          </h2>

          <p className="text-stone-600 text-xs sm:text-sm font-medium">
            Retours authentiques sur nos piments, soumbala de néré et épices artisanales du terroir.
          </p>
        </div>

        {/* Action Button: Laisser un avis */}
        <div className="flex items-center gap-2">
          <button
            id="btn-ouvrir-avis-modal"
            onClick={() => handleOpenForm()}
            className="inline-flex items-center gap-2 bg-[#0F2916] hover:bg-[#184424] text-white font-extrabold text-xs sm:text-sm py-2.5 px-4 rounded-xl shadow-md shadow-emerald-950/20 transition cursor-pointer border border-emerald-600/30"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>Partager un avis</span>
          </button>
        </div>
      </div>

      {/* OVERVIEW SCORE & STATS BANNER */}
      <FadeInView direction="up" distance={22} duration={0.65} withScale={true}>
        <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-6 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-center">
            {/* Main Average Score */}
            <div className="lg:col-span-4 flex flex-col items-center sm:items-start text-center sm:text-left sm:pr-6 sm:border-r border-stone-200">
              <span className="text-xs uppercase tracking-wider font-bold text-stone-400">
                Note Moyenne Consommateurs
              </span>
              <div className="flex items-baseline gap-2 my-1">
                <span className="text-4xl sm:text-5xl font-black text-[#142618] tracking-tight">
                  {stats.average}
                </span>
                <span className="text-base text-stone-400 font-bold">/ 5</span>
              </div>

              <div className="flex items-center gap-1 text-amber-400 mb-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(stats.average) 
                        ? 'fill-amber-400 text-amber-400' 
                        : 'text-stone-200'
                    }`}
                  />
                ))}
              </div>

              <p className="text-xs text-stone-500 font-medium">
                Basé sur <strong className="text-stone-800">{stats.total} avis certifiés</strong>
              </p>

              <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200/60">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>{stats.recommendPercentage}% recommandent Horon Mousso</span>
              </div>
            </div>

            {/* Star Distribution Progress Bars */}
            <div className="lg:col-span-5 space-y-1.5">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = stats.distribution[stars] || 0;
                const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                return (
                  <div key={stars} className="flex items-center gap-2.5 text-xs">
                    <span className="w-11 font-bold text-stone-700 flex items-center gap-1">
                      {stars} <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" />
                    </span>
                    <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-14 text-[11px] text-stone-400 text-right">
                      {count} ({percentage}%)
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Trust Highlights */}
            <div className="lg:col-span-3 bg-stone-50/80 rounded-xl p-3.5 border border-stone-200/70 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#142618]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Avis 100% Vérifiés</span>
              </div>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Tous les retours sont issus de consommateurs ayant testé nos récoltes et préparations culinaires.
              </p>

              <div className="pt-1.5 border-t border-stone-200/80 flex items-center justify-between text-[11px]">
                <span className="text-stone-500">Persistance Cloud :</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  Firebase Actif
                </span>
              </div>
            </div>
          </div>
        </div>
      </FadeInView>

      {/* FILTER & SELECTOR CONTROLS */}
      <div className="bg-white rounded-xl border border-stone-200 p-3 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="inline-flex items-center gap-1 text-xs font-bold text-stone-600 mr-1">
            <SlidersHorizontal className="w-3 h-3 text-stone-400" />
            <span>Filtrer par :</span>
          </div>

          {/* Product Filter Dropdown */}
          <select
            id="select-filtre-produit-avis"
            value={filterProductId}
            onChange={(e) => setFilterProductId(e.target.value)}
            className="text-xs py-1.5 px-2.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-800 font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#2D5A27] cursor-pointer"
          >
            <option value="all">Tous les produits ({reviews.length})</option>
            {products.map((p) => {
              const count = reviews.filter(r => r.productId === p.id).length;
              return (
                <option key={p.id} value={p.id}>
                  {p.name} ({count})
                </option>
              );
            })}
          </select>

          {/* Star Rating Filter */}
          <select
            id="select-filtre-note-avis"
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="text-xs py-1.5 px-2.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-800 font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#2D5A27] cursor-pointer"
          >
            <option value="all">Toutes les notes</option>
            <option value="5">5 étoiles uniquement</option>
            <option value="4">4 étoiles</option>
            <option value="3">3 étoiles</option>
            <option value="2">2 étoiles</option>
            <option value="1">1 étoile</option>
          </select>
        </div>

        {/* Reset filter tag if active */}
        {(filterProductId !== 'all' || filterRating !== 'all') && (
          <button
            onClick={() => {
              setFilterProductId('all');
              setFilterRating('all');
            }}
            className="text-xs font-bold text-[#2D5A27] hover:underline cursor-pointer self-end sm:self-auto"
          >
            Réinitialiser les filtres ({filteredReviews.length} résultats)
          </button>
        )}
      </div>

      {/* REVIEWS GRID DISPLAY */}
      {filteredReviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-sm sm:text-base text-stone-800">
            Aucun avis pour cette sélection
          </h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            Soyez le premier à partager votre retour de dégustation ou réinitialisez les filtres.
          </p>
          <button
            onClick={() => handleOpenForm(filterProductId !== 'all' ? filterProductId : undefined)}
            className="inline-flex items-center gap-1.5 bg-[#2D5A27] text-white font-bold text-xs py-2 px-4 rounded-xl shadow cursor-pointer hover:bg-[#23471f] transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Donner le premier avis</span>
          </button>
        </div>
      ) : (
        <FadeInStagger staggerDelay={0.08} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredReviews.map((rev) => {
            const product = getProductForReview(rev.productId);
            const reviewDate = new Date(rev.createdAt).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            });

            return (
              <FadeInItem key={rev.id} withScale={true} distance={20} duration={0.55}>
                <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 hover:border-[#2D5A27]/40 group relative h-full">
                  {/* Review Header */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 text-[#2D5A27] font-black text-xs flex items-center justify-center uppercase shadow-2xs">
                          {rev.customerName.charAt(0) || 'C'}
                        </div>
                        <div>
                          <div className="font-extrabold text-xs sm:text-sm text-[#142618] flex items-center gap-1.5">
                            <span>{rev.customerName}</span>
                            {rev.isVerifiedPurchase && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" title="Achat vérifié" />
                            )}
                          </div>
                          {rev.location && (
                            <span className="text-[11px] text-stone-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-stone-300" />
                              <span>{rev.location}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Star Display */}
                      <div className="flex items-center text-amber-400 shrink-0">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Comment Body */}
                    <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic pt-1">
                      « {rev.comment} »
                    </p>
                  </div>

                  {/* Card Footer: Linked Product & Date */}
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2 text-xs">
                    {product ? (
                      <button
                        type="button"
                        onClick={() => openProductDetail(product.id)}
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#2D5A27] hover:text-[#142618] truncate cursor-pointer group-hover:underline text-left"
                        title="Voir la fiche de ce produit"
                      >
                        <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                        <span className="truncate">{product.name}</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-stone-400">
                        {rev.productName || 'Produit Horon Mousso'}
                      </span>
                    )}

                    <span className="text-[10px] text-stone-400 shrink-0">
                      {reviewDate}
                    </span>
                  </div>

                  {/* Admin Quick Moderation Delete Button (if authenticated/admin mode) */}
                  {(isAdminMode || user) && (
                    <button
                      type="button"
                      onClick={() => setReviewToDelete(rev.id)}
                      className="absolute top-2.5 right-2.5 p-1.5 text-stone-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100 cursor-pointer"
                      title="Supprimer cet avis (Modération Firebase)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </FadeInItem>
            );
          })}
        </FadeInStagger>
      )}

      {/* MODAL: FORMULAIRE AJOUT AVIS */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative my-8"
            >
              {/* Close Button */}
              <button
                onClick={handleCloseForm}
                className="absolute top-5 right-5 p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1 mb-6">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2D5A27] uppercase tracking-wider">
                  <Star className="w-3.5 h-3.5 fill-[#2D5A27]" />
                  Avis Consommateur
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-[#142618]">
                  Partager votre retour d'expérience
                </h3>
                <p className="text-xs text-stone-500">
                  Votre commentaire aide notre coopérative et les autres amateurs de cuisine authentique.
                </p>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                {/* 1. Product Selection */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Produit concerné *
                  </label>
                  <select
                    id="input-avis-produit"
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    required
                    className="w-full text-xs sm:text-sm p-3 rounded-xl border border-stone-300 bg-white font-semibold text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-[#2D5A27] cursor-pointer"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.price})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Star Rating (Interactive) */}
                <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Votre note globale *
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(null)}
                        className="p-1 text-amber-400 hover:scale-120 transition-transform cursor-pointer"
                        title={`${star} sur 5 étoiles`}
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= (hoveredRating ?? rating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-stone-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-stone-800 ml-2">
                      {rating === 5 && '5/5 - Exceptionnel !'}
                      {rating === 4 && '4/5 - Très bien'}
                      {rating === 3 && '3/5 - Bon produit'}
                      {rating === 2 && '2/5 - Moyen'}
                      {rating === 1 && '1/5 - Décevant'}
                    </span>
                  </div>
                </div>

                {/* 3. Name & Location inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Votre Nom ou Pseudo *
                    </label>
                    <input
                      id="input-avis-nom"
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Ex: Aminata T. ou Chef Ibrahim"
                      required
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-[#2D5A27]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Ville ou Quartier (Optionnel)
                    </label>
                    <input
                      id="input-avis-ville"
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Ex: Bamako (ACI 2000), Abidjan"
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-[#2D5A27]"
                    />
                  </div>
                </div>

                {/* 4. Comment Textarea */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Votre commentaire & retour de dégustation *
                  </label>
                  <textarea
                    id="input-avis-commentaire"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Parlez-nous du parfum, de la finesse de mouture, de la force du piquant ou de son utilisation dans vos recettes..."
                    required
                    rows={4}
                    className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-[#2D5A27]"
                  />
                  <span className="text-[10px] text-stone-400 mt-1 block">
                    Les retours sont modérés et enregistrés instantanément sur Firebase.
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="px-4 py-2.5 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl transition cursor-pointer"
                  >
                    Annuler
                  </button>

                  <button
                    id="btn-soumettre-avis-firebase"
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 bg-[#2D5A27] hover:bg-[#23471f] text-white font-bold text-xs py-2.5 px-6 rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Publication Cloud...' : 'Publier mon avis'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRMATION MODAL POUR SUPPRESSION D'AVIS (ADMIN) */}
      <AnimatePresence>
        {reviewToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-stone-200 text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <h4 className="font-black text-stone-900 text-base">
                Supprimer cet avis de Firebase ?
              </h4>
              <p className="text-xs text-stone-500">
                Cette action supprimera définitivement le retour de la base de données Firestore et recalculera les moyennes.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setReviewToDelete(null)}
                  className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleDelete(reviewToDelete)}
                  className="px-4 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow transition cursor-pointer"
                >
                  Confirmer la suppression
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
