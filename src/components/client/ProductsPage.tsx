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
    <div className="py-12 px-4 sm:px-8 lg:px-10 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <FadeInView direction="up" distance={20} duration={0.6}>
        <div className="space-y-3 text-center max-w-2xl mx-auto">
          <span className="inline-block px-3 py-1 bg-[#E8F5E9] text-[#2D5A27] text-xs font-bold uppercase tracking-widest rounded-md">
            Catalogue Produits
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1B3022] tracking-tight">
            Nos Piments, Épices & Produits Transformés
          </h1>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            Découvrez notre gamme complète séchée, moulue et conditionnée avec soin pour garantir arôme, fraîcheur et pureté absolue.
          </p>
        </div>
      </FadeInView>

      {/* Filter & Search Bar */}
      <FadeInView direction="up" distance={20} delay={0.1} duration={0.6}>
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#E0E0E0] shadow-xs space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un produit (ex: piment en poudre, gingembre, curcuma, mélange)..."
              className="w-full pl-12 pr-10 py-3.5 bg-[#FAF9F6] border border-[#E0E0E0] rounded-xl text-[#1B3022] text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2D5A27] focus:bg-white transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                aria-label="Effacer la recherche"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {categories.map(cat => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#2D5A27] text-white shadow-xs'
                      : 'bg-[#FAF9F6] border border-[#E0E0E0] text-gray-600 hover:text-[#2D5A27] hover:border-[#2D5A27]/40'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-200' : 'text-gray-400'}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Status Count bar */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
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
                Réinitialiser les filtres
              </button>
            )}
          </div>
        </div>
      </FadeInView>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <FadeInStagger staggerDelay={0.06} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <FadeInItem key={product.id}>
              <ProductCard product={product} />
            </FadeInItem>
          ))}
        </FadeInStagger>
      ) : (
        <FadeInView direction="up" distance={20}>
          <div className="bg-white rounded-2xl border border-[#E0E0E0] p-12 text-center space-y-4 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-[#FAF9F6] text-gray-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-[#1B3022]">Aucun produit trouvé</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Aucun produit ne correspond à votre recherche « {searchTerm} ».
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="inline-block bg-[#2D5A27] text-white text-xs font-bold py-2.5 px-5 rounded-xl hover:bg-[#23471F] transition cursor-pointer"
            >
              Voir tous les produits
            </button>
          </div>
        </FadeInView>
      )}
    </div>
  );
};
