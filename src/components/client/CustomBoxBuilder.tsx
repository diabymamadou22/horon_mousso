import React, { useState } from 'react';
import { Gift, Sparkles, Check, Plus, Trash2, ShoppingBag, MessageCircle, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { LazyProductImage } from '../common/LazyProductImage';

export const CustomBoxBuilder: React.FC = () => {
  const { products, addToCart, openOrderWhatsApp } = useApp();
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([
    'prod_soumbala',
    'prod_1',
    'prod_3'
  ]);
  const [boxAdded, setBoxAdded] = useState(false);

  // Maximum items in the luxury box
  const MAX_BOX_ITEMS = 4;
  const MIN_BOX_ITEMS = 3;

  const toggleProduct = (productId: string) => {
    if (selectedProductIds.includes(productId)) {
      if (selectedProductIds.length > 1) {
        setSelectedProductIds(selectedProductIds.filter(id => id !== productId));
      }
    } else {
      if (selectedProductIds.length < MAX_BOX_ITEMS) {
        setSelectedProductIds([...selectedProductIds, productId]);
      }
    }
  };

  const selectedProducts = selectedProductIds
    .map(id => products.find(p => p.id === id))
    .filter((p): p is Product => Boolean(p));

  // Compute calculated pricing
  const parsePriceNum = (priceStr?: string) => {
    if (!priceStr) return 1500;
    const match = priceStr.replace(/\s+/g, '').match(/\d+/);
    return match ? parseInt(match[0], 10) : 1500;
  };

  const subtotal = selectedProducts.reduce((sum, p) => sum + parsePriceNum(p.price), 0);
  const discountRate = selectedProducts.length >= 4 ? 0.15 : selectedProducts.length >= 3 ? 0.10 : 0;
  const discountAmount = Math.round(subtotal * discountRate);
  const finalPrice = subtotal - discountAmount;

  const handleAddBoxToCart = () => {
    selectedProducts.forEach(p => {
      addToCart(p, 1);
    });
    setBoxAdded(true);
    setTimeout(() => setBoxAdded(false), 2200);
  };

  return (
    <section className="relative bg-gradient-to-b from-[#FAF7F2] via-white to-[#F7F4EE] rounded-[36px] border border-stone-200/90 p-8 sm:p-12 lg:p-16 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
      {/* Decorative luxury stamps */}
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="space-y-2.5">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100 text-amber-950 text-xs font-black uppercase tracking-wider border border-amber-300/40">
            <Gift className="w-3.5 h-3.5 text-amber-700" />
            <span>Expérience Sur-Mesure • Coffret Prestige</span>
          </span>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#0B1E11] tracking-tight font-serif-heading">
            Composez Votre Coffret Découverte
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 max-w-xl font-medium leading-relaxed">
            Sélectionnez 3 ou 4 épices artisanales d'exception pour concevoir votre coffret cadeau ou votre assortiment de cuisine personnelle avec réduction exclusive.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200/80 px-4 py-2.5 rounded-2xl self-start md:self-auto text-xs font-bold text-[#0F2916]">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>-10% pour 3 épices • -15% pour 4 épices</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Left Column: Product Picker (Catalog of Spices) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between text-xs text-stone-500 font-bold px-1">
            <span>Épices disponibles ({products.length})</span>
            <span>Sélectionnés : {selectedProducts.length} / {MAX_BOX_ITEMS}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {products.map(product => {
              const isSelected = selectedProductIds.includes(product.id);
              const isDisabled = !isSelected && selectedProductIds.length >= MAX_BOX_ITEMS;

              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => toggleProduct(product.id)}
                  disabled={isDisabled}
                  className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-[#0F2916] text-white border-emerald-600 shadow-md shadow-emerald-950/15 scale-[1.01]'
                      : isDisabled
                        ? 'bg-stone-50/60 border-stone-200/60 opacity-50 cursor-not-allowed text-stone-400'
                        : 'bg-white hover:bg-amber-50/40 border-stone-200/80 text-stone-800 hover:border-amber-300'
                  }`}
                >
                  <LazyProductImage
                    src={product.mainImage}
                    alt={product.name}
                    containerClassName="w-14 h-14 rounded-xl shrink-0 border border-black/10"
                    className="w-full h-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-xs sm:text-sm truncate ${isSelected ? 'text-white' : 'text-stone-900'}`}>
                      {product.name}
                    </p>
                    <p className={`text-[11px] truncate ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                      {product.format}
                    </p>
                    <p className={`text-xs font-black mt-1 ${isSelected ? 'text-amber-300' : 'text-[#0F2916]'}`}>
                      {product.price || '1 500 FCFA'}
                    </p>
                  </div>

                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    isSelected 
                      ? 'bg-amber-400 text-stone-950' 
                      : 'border border-stone-300 text-stone-400'
                  }`}>
                    {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Plus className="w-3.5 h-3.5" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Interactive Box Visual Preview & Summary */}
        <div className="lg:col-span-5 bg-[#0F2916] rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-amber-500/30 flex flex-col justify-between space-y-6 sm:space-y-8">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-white/15 pb-4">
              <div className="flex items-center gap-2.5">
                <Gift className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-base sm:text-lg text-white font-serif-heading">
                  Mon Écrin Terroir Horon Mousso
                </h3>
              </div>
              <span className="text-xs bg-amber-400 text-stone-950 font-black px-2.5 py-0.5 rounded-full">
                {selectedProducts.length} / {MAX_BOX_ITEMS}
              </span>
            </div>

            {/* Visual Box Slots Grid */}
            <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
              {[0, 1, 2, 3].map(slotIndex => {
                const item = selectedProducts[slotIndex];
                return (
                  <div
                    key={slotIndex}
                    className={`aspect-4/3 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-3 text-center relative overflow-hidden transition-all duration-300 ${
                      item
                        ? 'border-amber-400/60 bg-black/40'
                        : 'border-white/20 bg-white/5'
                    }`}
                  >
                    {item ? (
                      <>
                        <LazyProductImage
                          src={item.mainImage}
                          alt={item.name}
                          containerClassName="w-full h-14 sm:h-16 rounded-lg mb-1.5"
                          className="w-full h-full object-cover"
                        />
                        <p className="text-[11px] font-bold text-white truncate w-full px-1">
                          {item.name}
                        </p>
                        <button
                          type="button"
                          onClick={() => toggleProduct(item.id)}
                          className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-red-600/90 text-white flex items-center justify-center hover:bg-red-500 transition cursor-pointer"
                          title="Retirer cet article"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <div className="text-stone-400 space-y-1">
                        <Plus className="w-4 h-4 mx-auto opacity-50" />
                        <span className="text-[10px] block font-medium">Emplacement {slotIndex + 1}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {selectedProducts.length < MIN_BOX_ITEMS && (
              <p className="text-xs text-amber-300/90 bg-amber-400/10 p-3 rounded-xl border border-amber-400/20 text-center font-medium">
                Sélectionnez au moins {MIN_BOX_ITEMS} épices pour bénéficier de la réduction coffret.
              </p>
            )}

            {/* Price Calculations */}
            <div className="space-y-2.5 pt-3 border-t border-white/15 text-xs">
              <div className="flex justify-between text-stone-300">
                <span>Total unitaire brut :</span>
                <span className="font-bold">{subtotal.toLocaleString('fr-FR')} FCFA</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-amber-300 font-bold">
                  <span>Remise Coffret Privilège ({(discountRate * 100)}%) :</span>
                  <span>-{discountAmount.toLocaleString('fr-FR')} FCFA</span>
                </div>
              )}
              <div className="flex justify-between text-sm sm:text-base font-black text-white pt-2.5 border-t border-white/10">
                <span>Prix Final du Coffret :</span>
                <span className="text-xl sm:text-2xl text-amber-300 tracking-tight">
                  {finalPrice.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            </div>
          </div>

          {/* Action CTA */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleAddBoxToCart}
              disabled={selectedProducts.length < MIN_BOX_ITEMS}
              className={`w-full py-4 px-5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-xl cursor-pointer ${
                selectedProducts.length < MIN_BOX_ITEMS
                  ? 'bg-white/15 text-stone-400 cursor-not-allowed'
                  : boxAdded
                    ? 'bg-emerald-500 text-white scale-102'
                    : 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-stone-950 hover:shadow-amber-500/30'
              }`}
            >
              {boxAdded ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Coffret complet ajouté au panier !</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 text-stone-950" />
                  <span>Ajouter le Coffret au Panier (-{discountRate * 100}%)</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                const names = selectedProducts.map(p => p.name).join(', ');
                const text = encodeURIComponent(`Bonjour Horon Mousso ! J'ai composé mon Coffret Découverte personnalisé avec : ${names} pour ${finalPrice.toLocaleString('fr-FR')} FCFA. Pouvez-vous confirmer ma commande ?`);
                window.open(`https://wa.me/22370123456?text=${text}`, '_blank');
              }}
              className="w-full py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer border border-white/10"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Commander directement sur WhatsApp</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
