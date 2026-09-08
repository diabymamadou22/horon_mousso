import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Product } from '../../types';
import { useApp } from '../../context/AppContext';
import { ArrowUpRight, MessageCircle, Sparkles, Check, Clock, AlertTriangle, ShoppingBag, Eye, Star, Flame, Award } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { openProductDetail, openOrderWhatsApp, addToCart, reviews } = useApp();
  const [justAdded, setJustAdded] = useState(false);

  // Compute rating & review count
  const { avgRating, reviewCount } = useMemo(() => {
    const prodReviews = reviews.filter(r => r.productId === product.id);
    if (prodReviews.length === 0) return { avgRating: 5.0, reviewCount: 0 };
    const avg = Math.round((prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length) * 10) / 10;
    return { avgRating: avg, reviewCount: prodReviews.length };
  }, [reviews, product.id]);

  // Extract base numerical price if available
  const basePriceNum = useMemo(() => {
    if (!product.price) return 1500;
    const match = product.price.replace(/\s+/g, '').match(/\d+/);
    return match ? parseInt(match[0], 10) : 1500;
  }, [product.price]);

  // Interactive weight formats
  const availableWeights = useMemo(() => {
    if (product.category === 'piments') {
      return [
        { label: '100g', factor: 1 },
        { label: '250g', factor: 2.2 },
        { label: '500g', factor: 4.1 }
      ];
    } else if (product.category === 'produits_transformes') {
      return [
        { label: '250g', factor: 1 },
        { label: '500g', factor: 1.85 },
        { label: '1kg', factor: 3.5 }
      ];
    } else {
      return [
        { label: '150g', factor: 1 },
        { label: '300g', factor: 1.9 },
        { label: '500g', factor: 3.1 }
      ];
    }
  }, [product.category]);

  const [selectedWeightIdx, setSelectedWeightIdx] = useState<number>(0);
  const currentWeight = availableWeights[selectedWeightIdx];

  const calculatedPriceStr = useMemo(() => {
    if (!product.price) return '1 500 FCFA';
    const computed = Math.round(basePriceNum * currentWeight.factor);
    return `${computed.toLocaleString('fr-FR')} FCFA`;
  }, [basePriceNum, currentWeight, product.price]);

  // Heat Level
  const heatLevel = useMemo(() => {
    if (product.category === 'piments') {
      if (product.name.toLowerCase().includes('extra fort')) return 4;
      return 3;
    }
    if (product.id === 'prod_soumbala') return 2;
    if (product.id === 'prod_3') return 2; // Gingembre
    return 1;
  }, [product]);

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'piments':
        return '🌶️ Piment Noble';
      case 'epices':
        return '🌿 Épice Pure';
      case 'produits_transformes':
        return '✨ Soumbala & Terroir';
      default:
        return 'Agroalimentaire';
    }
  };

  const getAvailabilityBadge = (avail: Product['availability']) => {
    switch (avail) {
      case 'disponible':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0F2916] bg-white/90 backdrop-blur-md px-2.5 py-0.5 rounded-full shadow-xs border border-emerald-600/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            En stock
          </span>
        );
      case 'sur_commande':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-100/90 backdrop-blur-md px-2.5 py-0.5 rounded-full shadow-xs border border-amber-300">
            <Clock className="w-3 h-3 text-amber-600" />
            Sur commande
          </span>
        );
      case 'rupture':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-900 bg-red-100/90 backdrop-blur-md px-2.5 py-0.5 rounded-full shadow-xs border border-red-300">
            <AlertTriangle className="w-3 h-3 text-red-600" />
            Rupture
          </span>
        );
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Create an item with the selected weight label
    const customProduct = {
      ...product,
      format: `${currentWeight.label} (Sélection Gourmet)`,
      price: calculatedPriceStr
    };
    addToCart(customProduct, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12, margin: '-25px' }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="group bg-white rounded-2xl border border-stone-200 hover:border-[#E5A100] shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative"
    >
      
      {/* Product Image Stage - Fnac clean presentation */}
      <div 
        onClick={() => openProductDetail(product.id)}
        className="relative aspect-4/3 w-full bg-stone-50 overflow-hidden cursor-pointer border-b border-stone-100"
      >
        <img
          src={product.mainImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Quick View Hover Overlay */}
        <div className="absolute inset-0 bg-stone-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
          <span className="bg-white text-stone-900 text-xs font-black px-3.5 py-2 rounded-xl shadow-lg flex items-center gap-1.5 border border-stone-200">
            <Eye className="w-3.5 h-3.5 text-stone-700" />
            <span>Aperçu rapide</span>
          </span>
        </div>

        {/* Fnac Style Promo & Quality Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
          {product.isFeatured ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-stone-950 bg-[#E5A100] px-2 py-0.5 rounded-md shadow-xs">
              <Award className="w-3 h-3" />
              Coup de Cœur
            </span>
          ) : product.isNew ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-white bg-red-600 px-2 py-0.5 rounded-md shadow-xs">
              <Sparkles className="w-3 h-3" />
              Nouveau
            </span>
          ) : (
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-700 bg-white/95 px-2 py-0.5 rounded-md shadow-xs border border-stone-200">
              {getCategoryLabel(product.category)}
            </span>
          )}
        </div>

        {/* Heat Rating Meter (bottom left on image) */}
        <div className="absolute bottom-2 left-2 bg-stone-900/80 backdrop-blur-xs px-2 py-0.5 rounded-lg text-white text-[10px] font-bold flex items-center gap-1">
          <Flame className="w-3 h-3 text-[#E5A100] fill-current" />
          <span className="text-[#E5A100] font-black">{heatLevel}/4</span>
          <span className="text-stone-300">Force</span>
        </div>
      </div>

      {/* Content Area - Fnac Structure */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category & Brand Micro-tag */}
          <div className="flex items-center justify-between text-[11px] text-stone-400 font-bold uppercase tracking-wider">
            <span>Horon Mousso Terroir</span>
            <span>{product.format || '100g'}</span>
          </div>

          {/* Product Title */}
          <h3 
            onClick={() => openProductDetail(product.id)}
            className="font-extrabold text-sm sm:text-base text-stone-900 group-hover:text-[#D97706] transition cursor-pointer line-clamp-1 leading-snug mt-1"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Rating & Review Counter (Fnac Signature) */}
          <div className="flex items-center gap-1.5 mt-1">
            <div className="flex items-center text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            </div>
            <span className="text-xs font-black text-stone-900">
              {avgRating.toFixed(1)}
            </span>
            <span className="text-[11px] text-stone-400 font-medium">
              ({reviewCount > 0 ? `${reviewCount} avis` : '100% pur'})
            </span>
          </div>

          {/* Availability & Stock notice (Fnac standard) */}
          <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span>En stock • Expédié sous 24h</span>
          </div>

          {/* Short description */}
          <p className="text-xs text-stone-500 mt-1.5 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* Format Picker */}
          <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center gap-1">
            {availableWeights.map((w, idx) => (
              <button
                key={w.label}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedWeightIdx(idx);
                }}
                className={`flex-1 py-1 px-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                  selectedWeightIdx === idx
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>

          {/* Price area (Fnac bold price) */}
          <div className="mt-3 flex items-baseline justify-between pt-2 border-t border-stone-100">
            <div className="flex flex-col">
              <span className="text-[10px] text-stone-400 font-bold uppercase">Prix TTC</span>
              <span className="text-lg sm:text-xl font-black text-stone-900 tracking-tight">
                {calculatedPriceStr}
              </span>
            </div>
            <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
              Retrait Bamako 0 F
            </span>
          </div>
        </div>

        {/* Action Buttons - Fnac Yellow "Ajouter au panier" */}
        <div className="pt-2 border-t border-stone-100 flex items-center gap-1.5">
          {product.availability !== 'rupture' ? (
            <button
              onClick={handleAddToCart}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-black transition-all duration-200 cursor-pointer shadow-xs ${
                justAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#E5A100] hover:bg-[#D97706] text-stone-950'
              }`}
              title="Ajouter au panier"
            >
              {justAdded ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Ajouté !</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 text-stone-950" />
                  <span>Ajouter au panier</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => openProductDetail(product.id)}
              className="flex-1 inline-flex items-center justify-center gap-1 bg-stone-100 text-stone-600 text-xs font-bold py-2.5 px-3 rounded-xl transition cursor-pointer"
            >
              <span>Détails</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => openProductDetail(product.id)}
            className="inline-flex items-center justify-center p-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 transition cursor-pointer shrink-0"
            title="Fiche produit"
            aria-label="Voir les détails"
          >
            <ArrowUpRight className="w-4 h-4" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              openOrderWhatsApp({
                ...product,
                format: `${currentWeight.label} (Sélection)`,
                price: calculatedPriceStr
              });
            }}
            className="inline-flex items-center justify-center p-2.5 rounded-xl border border-emerald-500/30 text-emerald-700 bg-emerald-50 hover:bg-emerald-600 hover:text-white transition cursor-pointer shrink-0"
            title="Commander via WhatsApp"
            aria-label="Commander sur WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
