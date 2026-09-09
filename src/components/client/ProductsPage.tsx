import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ProductCard } from './ProductCard';
import { FadeInView, FadeInStagger, FadeInItem } from '../common/FadeInView';
import { Search, Filter, Sparkles, Flame, Leaf, Utensils, X } from 'lucide-react';
import { ProductCategory } from '../../types';

export const ProductsPage: React.FC = () => {
  const { products } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('all');

  const categories = [
    { id: 'all' as ProductCategory, label: 'Toutes les catégories', icon: Filter },
    { id: 'piments' as ProductCategory, label: 'Piments', icon: Flame },
    { id: 'epices' as ProductCategory, label: 'Épices pures', icon: Leaf },
    { id: 'produits_transformes' as ProductCategory, label: 'Transformés', icon: Utensils },
    { id: 'nouveautes' as ProductCategory, label: 'Nouveautés', icon: Sparkles },
  ];

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Category filter
      if (selectedCategory === 'nouveautes') {
        if (!product.isNew) return false;
      } else if (selectedCategory !== 'all') {
        if (product.category !== selectedCategory) return false;
      }

      // Search filter
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchName = product.name.toLowerCase().includes(query);
        const matchDesc = product.description.toLowerCase().includes(query);
        const matchFormat = product.format.toLowerCase().includes(query);
        return matchName || matchDesc || matchFormat;
      }

      return true;
    });
  }, [products, selectedCategory, searchTerm]);

  return (
    <div className="py-4 sm:py-6 px-3.5 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Page Header */}
      <FadeInView direction="up" distance={20} duration={0.6}>
        <div className="space-y-2 text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-emerald-100/80 text-[#0F2916] text-xs font-black uppercase tracking-wider rounded-full border border-emerald-300/40">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Catalogue Épicerie Fine du Mali</span>
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0B1E11] tracking-tight font-serif-heading">
            Piments Nobles, Épices & Soumbala Pur
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-medium">
            Découvrez notre gamme complète récoltée, séchée au soleil et conditionnée avec rigueur pour garantir un arôme envoûtant et une fraîcheur sans pareille.
          </p>
        </div>
      </FadeInView>

      {/* Filter & Search Bar */}
      <FadeInView direction="up" distance={20} delay={0.1} duration={0.6}>
        <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-stone-200/90 shadow-sm space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-stone-400 absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un piment, une épice, un conditionnement..."
              className="w-full pl-10 sm:pl-11 pr-9 py-2.5 sm:py-3 bg-[#FAF7F2] border border-stone-200 rounded-xl text-[#0B1E11] text-xs sm:text-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0F2916] focus:bg-white transition font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
                aria-label="Effacer la recherche"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Buttons with Horizontal Smooth Scroll on Mobile */}
          <div className="flex items-center gap-1.5 pt-0.5 overflow-x-auto pb-0.5 sm:flex-wrap scrollbar-none">
            {categories.map(cat => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#0F2916] text-amber-300 shadow-md border border-emerald-600/40 scale-[1.02]'
                      : 'bg-[#FAF7F2] border border-stone-200 text-stone-700 hover:text-[#0F2916] hover:border-emerald-600/40 hover:bg-white'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-stone-400'}`} />
                  <span className="whitespace-nowrap">{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Status Count bar */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-1.5 border-t border-gray-100">
            <div>
              Affichage de <span className="font-bold text-[#1B3022]">{filteredProducts.length}</span> produit{filteredProducts.length > 1 ? 's' : ''}
            </div>
            {(selectedCategory !== 'all' || searchTerm !== '') && (
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchTerm('');
                }}
                className="text-[#2D5A27] hover:underline font-semibold cursor-pointer"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>
      </FadeInView>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <FadeInStagger staggerDelay={0.06} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5">
          {filteredProducts.map(product => (
            <FadeInItem key={product.id}>
              <ProductCard product={product} />
            </FadeInItem>
          ))}
        </FadeInStagger>
      ) : (
        <FadeInView direction="up" distance={20}>
          <div className="bg-white rounded-2xl border border-[#E0E0E0] p-8 text-center space-y-3 max-w-md mx-auto">
            <div className="w-10 h-10 rounded-full bg-[#FAF9F6] text-gray-400 flex items-center justify-center mx-auto">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#1B3022]">Aucun produit trouvé</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Aucun produit ne correspond à votre recherche « {searchTerm} ».
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="inline-block bg-[#2D5A27] text-white text-xs font-bold py-2 px-4 rounded-xl hover:bg-[#23471F] transition cursor-pointer"
            >
              Voir tous les produits
            </button>
          </div>
        </FadeInView>
      )}
    </div>
  );
};
