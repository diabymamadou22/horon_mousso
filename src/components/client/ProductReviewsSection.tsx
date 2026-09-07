import React, { useState, useMemo } from 'react';
import { 
  Star, 
  MessageSquare, 
  CheckCircle2, 
  User, 
  Calendar, 
  Send, 
  ThumbsUp, 
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProductReview } from '../../types';

interface ProductReviewsSectionProps {
  productId: string;
  productName: string;
}

export const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({ 
  productId, 
  productName 
}) => {
  const { reviews, addReview, showToast } = useApp();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerContact, setCustomerContact] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter reviews for this specific product
  const productReviews = useMemo(() => {
    return reviews.filter(r => r.productId === productId);
  }, [reviews, productId]);

  // Calculate average rating
  const averageRating = useMemo(() => {
    if (productReviews.length === 0) return 5;
    const total = productReviews.reduce((sum, r) => sum + r.rating, 0);
    return Math.round((total / productReviews.length) * 10) / 10;
  }, [productReviews]);

  // Star breakdown counts
  const starCounts = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    productReviews.forEach(r => {
      const clamped = Math.max(1, Math.min(5, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
      counts[clamped] = (counts[clamped] || 0) + 1;
    });
    return counts;
  }, [productReviews]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !comment.trim()) {
      showToast('Veuillez renseigner votre nom et votre appréciation.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await addReview({
        productId,
        productName,
        customerName: customerName.trim(),
        rating,
        comment: comment.trim(),
        isVerifiedPurchase: true
      });

      if (success) {
        setCustomerName('');
        setCustomerContact('');
        setComment('');
        setRating(5);
        setIsFormOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-8 pt-8 border-t border-stone-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-black text-[#1B3022] flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#2D5A27]" />
            Avis & Retours Clients ({productReviews.length})
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Retours d'expérience vérifiés sur nos épices et piments
          </p>
        </div>

        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="inline-flex items-center gap-2 bg-[#2D5A27]/10 hover:bg-[#2D5A27]/20 text-[#2D5A27] font-bold text-xs py-2 px-4 rounded-xl transition cursor-pointer self-start sm:self-auto"
        >
          {isFormOpen ? (
            <>
              <ChevronUp className="w-4 h-4" />
              <span>Masquer le formulaire</span>
            </>
          ) : (
            <>
              <Star className="w-4 h-4 fill-[#2D5A27]" />
              <span>Laisser un avis client</span>
            </>
          )}
        </button>
      </div>

      {/* Review Form Drawer */}
      {isFormOpen && (
        <form 
          onSubmit={handleSubmitReview}
          className="mb-8 p-5 bg-[#FAF9F6] border border-emerald-800/20 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-[#1B3022]">
              Donnez votre avis sur « {productName} »
            </h4>
            <span className="text-[11px] text-stone-500">100% anonyme ou public selon votre choix</span>
          </div>

          {/* Interactive Star Rating */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Votre note globale * :
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(null)}
                  className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                  title={`${star} sur 5 étoiles`}
                >
                  <Star 
                    className={`w-6 h-6 ${
                      star <= (hoveredRating ?? rating) 
                        ? 'fill-amber-400 text-amber-400' 
                        : 'text-stone-300'
                    }`} 
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-stone-700 ml-2">
                {rating === 5 && 'Excellent (5/5)'}
                {rating === 4 && 'Très bien (4/5)'}
                {rating === 3 && 'Bien (3/5)'}
                {rating === 2 && 'Moyen (2/5)'}
                {rating === 1 && 'Décevant (1/5)'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">
                Votre Nom ou Nom d'établissement *
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Ex: Fatoumata T. ou Restaurant Le Délice"
                required
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#2D5A27]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">
                Téléphone ou Email (facultatif)
              </label>
              <input
                type="text"
                value={customerContact}
                onChange={(e) => setCustomerContact(e.target.value)}
                placeholder="Pour vérification d'achat"
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#2D5A27]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">
              Votre commentaire ou retour de dégustation *
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Que pensez-vous du parfum, de la qualité, du piquant ou de la fraîcheur ?"
              required
              rows={3}
              className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#2D5A27]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-200 rounded-xl transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 bg-[#2D5A27] hover:bg-[#23471f] text-white font-bold text-xs py-2 px-5 rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Publication...' : 'Publier mon avis'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Summary Score Bar */}
      <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-center gap-6 mb-6">
        <div className="text-center sm:text-left sm:pr-6 sm:border-r border-stone-200">
          <div className="text-4xl font-black text-[#1B3022] tracking-tight">
            {averageRating}
          </div>
          <div className="flex items-center justify-center sm:justify-start text-amber-400 my-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star 
                key={i} 
                className={`w-4 h-4 ${i <= Math.round(averageRating) ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`} 
              />
            ))}
          </div>
          <span className="text-[11px] text-stone-500 block">
            {productReviews.length} avis consommateur(s)
          </span>
        </div>

        {/* Rating Bars Breakdown */}
        <div className="flex-1 w-full space-y-1.5 text-xs">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = (starCounts as any)[stars] || 0;
            const percentage = productReviews.length > 0 ? (count / productReviews.length) * 100 : 0;
            return (
              <div key={stars} className="flex items-center gap-2 text-stone-600">
                <span className="w-8 text-[11px] font-semibold">{stars} ★</span>
                <div className="flex-1 h-2 bg-stone-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-400 rounded-full transition-all duration-500" 
                    style={{ width: `${percentage}%` }} 
                  />
                </div>
                <span className="w-8 text-[10px] text-stone-400 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {productReviews.length === 0 ? (
          <div className="text-center py-6 px-4 bg-white rounded-xl border border-stone-200 text-stone-400">
            <p className="text-xs font-semibold text-stone-600">Soyez le premier à donner votre avis !</p>
            <p className="text-[11px] text-stone-400 mt-1">
              Partagez votre expérience culinaire avec les piments et épices Horon Mousso.
            </p>
          </div>
        ) : (
          productReviews.map((rev) => (
            <div 
              key={rev.id}
              className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-stone-900 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-stone-400" />
                      {rev.customerName}
                    </span>
                    {(rev.isVerifiedPurchase ?? (rev as any).verifiedPurchase) && (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-[#2D5A27]">
                        <CheckCircle2 className="w-3 h-3 text-[#2D5A27]" />
                        Client vérifié
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-stone-400 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3" />
                    {new Date(rev.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                <div className="flex items-center text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star 
                      key={s} 
                      className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'}`} 
                    />
                  ))}
                </div>
              </div>

              <p className="text-xs text-stone-700 leading-relaxed pt-1">
                "{rev.comment}"
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
