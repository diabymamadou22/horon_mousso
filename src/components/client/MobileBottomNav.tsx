import React from 'react';
import { useApp, PublicTab } from '../../context/AppContext';
import { Home, Package, Megaphone, Image as ImageIcon, ShoppingBag, MessageCircle } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    cartTotalCount, 
    setIsCartOpen,
    openOrderWhatsApp 
  } = useApp();

  const navItems: { id: PublicTab; label: string; icon: React.ElementType }[] = [
    { id: 'accueil', label: 'Accueil', icon: Home },
    { id: 'produits', label: 'Produits', icon: Package },
    { id: 'actualites', label: 'Actus', icon: Megaphone },
    { id: 'galerie', label: 'Galerie', icon: ImageIcon },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-safe">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-mobile-${item.id}`}
              onClick={() => {
                setActiveTab(item.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex-1 flex flex-col items-center justify-center py-1 relative min-h-[48px] rounded-xl transition-all cursor-pointer ${
                isActive 
                  ? 'text-[#2D5A27] font-bold' 
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <div className={`relative p-1 rounded-xl transition-all ${
                isActive ? 'bg-[#E8F5E9] scale-110' : ''
              }`}>
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              </div>
              <span className={`text-[11px] leading-tight tracking-tight mt-0.5 ${
                isActive ? 'font-black' : 'font-medium'
              }`}>
                {item.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#2D5A27] absolute -bottom-0.5"></span>
              )}
            </button>
          );
        })}

        {/* Panier Button with Badge */}
        <button
          id="nav-mobile-cart"
          onClick={() => setIsCartOpen(true)}
          className="flex-1 flex flex-col items-center justify-center py-1 relative min-h-[48px] text-stone-500 hover:text-stone-800 rounded-xl transition-all cursor-pointer"
          aria-label="Voir le panier"
        >
          <div className="relative p-1 rounded-xl">
            <ShoppingBag className="w-5 h-5 stroke-2" />
            {cartTotalCount > 0 && (
              <span className="absolute -top-1 -right-1.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-[#C53030] px-1 text-[10px] font-black text-white shadow-xs animate-bounce">
                {cartTotalCount}
              </span>
            )}
          </div>
          <span className="text-[11px] font-medium leading-tight tracking-tight mt-0.5">
            Panier
          </span>
        </button>

        {/* WhatsApp Fast Contact Button */}
        <button
          id="nav-mobile-whatsapp"
          onClick={() => openOrderWhatsApp()}
          className="flex-1 flex flex-col items-center justify-center py-1 relative min-h-[48px] text-emerald-700 hover:text-emerald-800 rounded-xl transition-all cursor-pointer"
          aria-label="Contacter sur WhatsApp"
        >
          <div className="relative p-1 rounded-xl bg-emerald-50 text-emerald-600">
            <MessageCircle className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-[11px] font-bold leading-tight tracking-tight mt-0.5 text-emerald-700">
            WhatsApp
          </span>
        </button>
      </div>
    </div>
  );
};
