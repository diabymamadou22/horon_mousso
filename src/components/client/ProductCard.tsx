import React from 'react';
import { Product } from '../../types';
import { useApp } from '../../context/AppContext';
import { ArrowUpRight, MessageCircle, Sparkles, Check, Clock, AlertTriangle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { openProductDetail, openOrderWhatsApp } = useApp();

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'piments':
        return 'Piments';
      case 'epices':
        return 'Épices';
      case 'produits_transformes':
        return 'Transformé';
      default:
        return 'Agroalimentaire';
    }
  };

  const getAvailabilityBadge = (avail: Product['availability']) => {
    switch (avail) {
      case 'disponible':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2D5A27] bg-[#E8F5E9] px-2 py-0.5 rounded-full">
            <Check className="w-3 h-3 text-[#2D5A27]" />
            En stock
          </span>
        );
      case 'sur_commande':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-[#FFF3E0] px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3 text-amber-600" />
            Sur commande
          </span>
        );
      case 'rupture':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#C53030] bg-red-50 px-2 py-0.5 rounded-full">
            <AlertTriangle className="w-3 h-3 text-[#C53030]" />
            Rupture
          </span>
        );
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-[#E0E0E0] shadow-xs hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden hover:border-[#2D5A27]/50">
      {/* Product Image */}
      <div 
        onClick={() => openProductDetail(product.id)}
        className="relative aspect-4/3 w-full bg-[#FAF9F6] overflow-hidden cursor-pointer"
      >
        <img
          src={product.mainImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#2D5A27] bg-[#E8F5E9]/95 backdrop-blur-md px-2.5 py-1 rounded-md shadow-xs">
            {getCategoryLabel(product.category)}
          </span>
          {product.isNew && (
            <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-[#C53030] bg-red-100/95 backdrop-blur-md px-2 py-1 rounded-md shadow-xs">
              <Sparkles className="w-3 h-3 text-[#C53030]" />
              Nouveau
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3">
          {getAvailabilityBadge(product.availability)}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 
            onClick={() => openProductDetail(product.id)}
            className="font-bold text-lg text-[#1B3022] group-hover:text-[#2D5A27] transition cursor-pointer line-clamp-1"
          >
            {product.name}
          </h3>

          <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* Packaging / Format */}
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
            <span className="font-medium text-gray-400">Format :</span>
            <span className="font-semibold text-gray-700 truncate max-w-[65%] text-right" title={product.format}>
              {product.format}
            </span>
          </div>

          {/* Price */}
          {product.price && (
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xs font-medium text-gray-400">Prix :</span>
              <span className="text-base font-black text-[#2D5A27]">
                {product.price}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
          <button
            onClick={() => openProductDetail(product.id)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#2D5A27] hover:bg-[#23471F] text-white text-xs font-bold py-2.5 px-3 rounded-xl transition cursor-pointer"
          >
            <span>Voir le produit</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              openOrderWhatsApp(product);
            }}
            className="inline-flex items-center justify-center p-2.5 rounded-xl border border-red-200 text-[#C53030] bg-red-50 hover:bg-[#C53030] hover:text-white transition cursor-pointer"
            title="Commander ce produit sur WhatsApp"
            aria-label="Commander sur WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
