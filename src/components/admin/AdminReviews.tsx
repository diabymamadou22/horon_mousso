import React, { useState } from 'react';
import { 
  Star, 
  Trash2, 
  Search, 
  ShieldCheck, 
  MessageSquare, 
  User, 
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProductReview } from '../../types';

export const AdminReviews: React.FC = () => {
  const { reviews, products, deleteReview, showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string>('all');

  const filteredReviews = reviews.filter(rev => {
    const product = products.find(p => p.id === rev.productId);
    const prodName = product ? product.name.toLowerCase() : '';
    const matchesSearch = 
      rev.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rev.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prodName.includes(searchTerm.toLowerCase());

    const matchesProduct = selectedProductId === 'all' || rev.productId === selectedProductId;
    return matchesSearch && matchesProduct;
  });

  const averageRating = reviews.length > 0 
    ? Math.round((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) * 10) / 10 
    : 5;

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <span className="text-xs text-neutral-500 font-medium block">Total Avis Clients</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-neutral-900">{reviews.length}</span>
            <MessageSquare className="w-5 h-5 text-neutral-400" />
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block">Retours d'expérience vérifiés</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <span className="text-xs text-neutral-500 font-medium block">Note Moyenne Globale</span>
          <div className="flex items-baseline justify-between mt-1">
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-black text-amber-500">{averageRating}</span>
              <div className="flex items-center text-amber-400">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i <= Math.round(averageRating) ? 'fill-amber-400 text-amber-400' : 'text-neutral-200'}`} 
                  />
                ))}
              </div>
            </div>
          </div>
          <span className="text-[11px] text-emerald-600 mt-1 block">Satisfaction client élevée</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <span className="text-xs text-neutral-500 font-medium block">Taux d'Avis Positifs (4 & 5★)</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-emerald-600">
              {reviews.length > 0 
                ? `${Math.round((reviews.filter(r => r.rating >= 4).length / reviews.length) * 100)}%` 
                : '100%'}
            </span>
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block">Preuve sociale et fidélisation</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un commentaire, un client ou une épice..."
            className="w-full pl-9 pr-4 py-2 text-xs md:text-sm rounded-lg border border-neutral-200 focus:outline-hidden focus:ring-2 focus:ring-[#2D5A27]"
          />
        </div>

        <select
          value={selectedProductId}
          onChange={(e) => setSelectedProductId(e.target.value)}
          className="text-xs py-2 px-3 rounded-lg border border-neutral-200 bg-white focus:ring-2 focus:ring-[#2D5A27] w-full md:w-auto"
        >
          <option value="all">Tous les produits ({products.length})</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReviews.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-xl border border-neutral-200 text-neutral-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-neutral-300 stroke-1" />
            <p className="text-sm font-semibold text-neutral-700">Aucun avis trouvé</p>
            <p className="text-xs text-neutral-400 mt-1">Les avis déposés par vos clients apparaîtront ici.</p>
          </div>
        ) : (
          filteredReviews.map((rev) => {
            const product = products.find(p => p.id === rev.productId);
            return (
              <div 
                key={rev.id} 
                className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h4 className="font-bold text-neutral-900 text-sm flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-neutral-400" />
                        {rev.customerName}
                        {rev.verifiedPurchase && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Achat Vérifié
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-[#2D5A27] font-semibold mt-0.5">
                        Produit : {product ? product.name : 'Produit Horon Mousso'}
                      </p>
                    </div>

                    <div className="flex items-center text-amber-400">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star 
                          key={star} 
                          className={`w-3.5 h-3.5 ${star <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-200'}`} 
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-neutral-700 mt-3 leading-relaxed italic bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-100 text-[11px] text-neutral-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(rev.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>

                  <button
                    onClick={() => {
                      if (window.confirm('Voulez-vous supprimer cet avis ?')) {
                        deleteReview(rev.id);
                      }
                    }}
                    className="text-neutral-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                    title="Supprimer cet avis"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
