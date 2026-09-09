import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { Search, X, Sparkles, ArrowRight, ShoppingBag, Check, Flame, ChevronRight } from 'lucide-react';
import { LazyProductImage } from '../common/LazyProductImage';

interface HeaderSearchBarProps {
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

export const HeaderSearchBar: React.FC<HeaderSearchBarProps> = ({ isMobile = false }) => {
  const { products, openProductDetail, addToCart, setActiveTab } = useApp();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Quick categories
  const quickFilters = [
    { label: 'Tous', query: '' },
    { label: '🔥 Piments', query: 'piment' },
    { label: '🌿 Soumbala', query: 'soumbala' },
    { label: '🧄 Ail & Oignon', query: 'ail' },
    { label: '✨ Gingembre', query: 'gingembre' },
  ];

  // Best-seller recommendations when query is empty
  const featuredProducts = products.slice(0, 3);

  // Filter products based on query or active category
  const filteredProducts = products.filter(p => {
    const q = (activeCategory || query).toLowerCase().trim();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.format && p.format.toLowerCase().includes(q))
    );
  });

  // Handle global shortcut Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectProduct = (productId: string) => {
    openProductDetail(productId);
    setIsOpen(false);
    setQuery('');
    setActiveCategory(null);
  };

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    addToCart(product, 1, product.format || '100g');
    setAddedItemIds(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItemIds(prev => ({ ...prev, [product.id]: false }));
    }, 1600);
  };

  const handleViewAllProducts = () => {
    setActiveTab('produits');
    setIsOpen(false);
    setQuery('');
    setActiveCategory(null);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input container - Fnac Style */}
      <div 
        className={`relative flex items-center transition-all bg-white border border-stone-300 hover:border-stone-400 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 shadow-xs overflow-hidden ${
          isMobile 
            ? 'rounded-xl' 
            : 'rounded-xl h-11'
        }`}
      >
        {/* Left Category Selector (Fnac signature) */}
        {!isMobile && (
          <div className="relative border-r border-stone-200 bg-stone-50/80 shrink-0 h-full flex items-center">
            <select
              value={activeCategory || ''}
              onChange={(e) => {
                setActiveCategory(e.target.value || null);
                if (!isOpen) setIsOpen(true);
              }}
              className="h-full bg-transparent text-xs font-bold text-stone-700 pl-3 pr-6 py-2 appearance-none focus:outline-none cursor-pointer"
            >
              <option value="">Tous les rayons</option>
              <option value="piments">🌶️ Piments</option>
              <option value="soumbala">🌿 Soumbala</option>
              <option value="ail">🧄 Ail & Oignon</option>
              <option value="gingembre">✨ Gingembre</option>
              <option value="epices">🍃 Aromates</option>
            </select>
            <div className="absolute right-2 pointer-events-none text-stone-400 text-[10px]">
              ▼
            </div>
          </div>
        )}

        <Search 
          className={`shrink-0 transition-colors ${
            isMobile ? 'w-4 h-4 ml-3 text-stone-400' : 'w-4 h-4 ml-3 text-stone-400 group-focus-within:text-amber-600'
          }`} 
        />
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={isMobile ? "Rechercher une épice..." : "Rechercher une épice, piment noble, soumbala, ail..."}
          className={`w-full bg-transparent text-stone-900 placeholder:text-stone-400 font-medium focus:outline-none transition-all ${
            isMobile ? 'py-2 px-2.5 text-xs' : 'py-2 px-3 text-xs lg:text-sm'
          }`}
        />

        {/* Clear button */}
        {(query || activeCategory) && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setActiveCategory(null);
              inputRef.current?.focus();
            }}
            className="p-1 mr-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer shrink-0"
            title="Effacer la recherche"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Fnac Signature Search Action Button */}
        <button
          type="button"
          onClick={() => {
            if (!isOpen) setIsOpen(true);
            inputRef.current?.focus();
          }}
          className={`bg-[#E5A100] hover:bg-[#D97706] text-stone-950 font-black flex items-center justify-center shrink-0 transition cursor-pointer ${
            isMobile ? 'h-full px-3 text-xs' : 'h-full px-4 text-xs tracking-wide'
          }`}
          title="Lancer la recherche"
        >
          <Search className="w-4 h-4" />
          {!isMobile && <span className="ml-1.5 hidden xl:inline">Rechercher</span>}
        </button>
      </div>

      {/* Stylized Floating Results Popover */}
      {isOpen && (
        <div 
          className={`absolute left-0 z-50 mt-2 bg-white/98 backdrop-blur-md rounded-3xl shadow-2xl border border-stone-200/90 overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
            isMobile 
              ? 'w-full right-0 max-h-[75vh] overflow-y-auto' 
              : 'w-[420px] lg:w-[480px] max-h-[580px] overflow-y-auto shadow-stone-900/10'
          }`}
        >
          {/* Quick Filter Pills */}
          <div className="p-3 bg-stone-50/90 border-b border-stone-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {quickFilters.map((f, i) => {
              const isSelected = (!f.query && !activeCategory && !query) || activeCategory === f.query;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setActiveCategory(f.query);
                    setQuery('');
                  }}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap transition cursor-pointer shrink-0 ${
                    isSelected 
                      ? 'bg-[#0F2916] text-amber-300 shadow-xs' 
                      : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* Results List */}
          <div className="p-3 space-y-1.5">
            {query.trim() === '' && !activeCategory ? (
              /* When no query is entered, showcase curated best-sellers */
              <div className="space-y-3 py-1">
                <div className="flex items-center justify-between px-2 pt-1 text-[11px] font-extrabold uppercase tracking-wider text-amber-900/80">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>Suggestions du Terroir</span>
                  </span>
                  <span className="text-[10px] text-stone-400 font-medium">Sélectionné pour vous</span>
                </div>

                <div className="space-y-1.5">
                  {featuredProducts.map(prod => (
                    <div
                      key={prod.id}
                      onClick={() => handleSelectProduct(prod.id)}
                      className="p-2.5 rounded-2xl hover:bg-amber-50/50 border border-transparent hover:border-amber-200/80 transition flex items-center justify-between gap-3 group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-stone-100 border border-stone-200 overflow-hidden shrink-0 flex items-center justify-center">
                          {prod.mainImage ? (
                            <LazyProductImage
                              src={prod.mainImage}
                              alt={prod.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              containerClassName="w-full h-full"
                            />
                          ) : (
                            <span className="text-lg">🌿</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-stone-900 group-hover:text-amber-900 truncate">
                            {prod.name}
                          </h4>
                          <p className="text-[11px] text-stone-500 truncate flex items-center gap-1.5">
                            <span className="font-semibold text-emerald-800">{prod.price}</span>
                            <span>•</span>
                            <span>{prod.format || '100g'}</span>
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleQuickAdd(e, prod)}
                        className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer ${
                          addedItemIds[prod.id]
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-stone-100 hover:bg-[#0F2916] text-stone-700 hover:text-white'
                        }`}
                        title="Ajouter au panier"
                      >
                        {addedItemIds[prod.id] ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-white" />
                            <span className="text-[10px] hidden sm:inline">Ajouté</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span className="text-[10px] hidden sm:inline">Panier</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              /* No matching products found */
              <div className="py-8 text-center space-y-2 px-4">
                <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200">
                  <Search className="w-5 h-5" />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-stone-900">
                  Aucun résultat pour "{query || activeCategory}"
                </h4>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  Essayez avec un mot plus court comme "piment", "soumbala" ou "ail".
                </p>
                <button
                  type="button"
                  onClick={handleViewAllProducts}
                  className="mt-2 text-xs font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer inline-flex items-center gap-1"
                >
                  <span>Explorer tout le catalogue</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ) : (
              /* Live Results list */
              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-2 pt-1 pb-0.5 text-[11px] font-extrabold uppercase tracking-wider text-stone-400">
                  <span>{filteredProducts.length} {filteredProducts.length === 1 ? 'Épice trouvée' : 'Épices trouvées'}</span>
                  <span>Catalogue Horon Mousso</span>
                </div>

                {filteredProducts.slice(0, 6).map(prod => (
                  <div
                    key={prod.id}
                    onClick={() => handleSelectProduct(prod.id)}
                    className="p-2.5 rounded-2xl hover:bg-stone-50 border border-stone-100 hover:border-amber-300/60 transition flex items-center justify-between gap-3 group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200 overflow-hidden shrink-0 flex items-center justify-center relative">
                        {prod.mainImage ? (
                          <LazyProductImage
                            src={prod.mainImage}
                            alt={prod.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            containerClassName="w-full h-full"
                          />
                        ) : (
                          <span className="text-xl">🌿</span>
                        )}
                        {prod.isPromotion && (
                          <span className="absolute top-1 right-1 z-10 w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs sm:text-sm font-bold text-stone-900 group-hover:text-[#0F2916] truncate">
                            {prod.name}
                          </h4>
                          {prod.isPromotion && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.2 bg-red-100 text-red-700 rounded-md">
                              Promo
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-500 truncate flex items-center gap-1.5">
                          <span className="font-extrabold text-[#0F2916]">{prod.price}</span>
                          <span>•</span>
                          <span>{prod.format || '100g'}</span>
                          <span>•</span>
                          <span className="text-amber-800/80 font-medium">{prod.category}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleQuickAdd(e, prod)}
                        className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                          addedItemIds[prod.id]
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-amber-100/70 hover:bg-amber-600 text-amber-900 hover:text-white'
                        }`}
                        title="Ajouter directement au panier"
                      >
                        {addedItemIds[prod.id] ? (
                          <Check className="w-3.5 h-3.5 text-white" />
                        ) : (
                          <ShoppingBag className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <div className="p-1 text-stone-300 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Action Bar in Dropdown */}
          <div className="p-2.5 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span className="text-[10px] text-stone-400 hidden sm:inline">
              Sélectionnez pour voir la fiche et les recettes
            </span>
            <button
              type="button"
              onClick={handleViewAllProducts}
              className="w-full sm:w-auto text-center font-bold text-amber-900 hover:text-amber-950 inline-flex items-center justify-center gap-1 text-[11px] cursor-pointer py-1 px-2 rounded-lg hover:bg-amber-100/50 transition ml-auto"
            >
              <span>Voir tout le catalogue ({products.length} épices)</span>
              <ArrowRight className="w-3 h-3 text-amber-700" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
