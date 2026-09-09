import React, { useState } from 'react';
import { useApp, PublicTab } from '../../context/AppContext';
import { Menu, X, PhoneCall, MessageCircle, Lock, ShoppingBag, ChevronRight, Cloud } from 'lucide-react';
import { SyncStatusModal } from '../common/SyncStatusModal';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { HeaderSearchBar } from './HeaderSearchBar';

export const Navbar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    settings, 
    setIsAdminMode, 
    currentUser, 
    openOrderWhatsApp,
    cartTotalCount,
    setIsCartOpen,
    syncStatus
  } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  const navLinks: { id: PublicTab; label: string; badge?: string }[] = [
    { id: 'accueil', label: 'Accueil' },
    { id: 'produits', label: 'Nos Épices', badge: '100% Pur' },
    { id: 'actualites', label: 'Actualités' },
    { id: 'galerie', label: 'Galerie & Récoltes' },
    { id: 'a_propos', label: 'Notre Histoire' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (tabId: PublicTab) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  // Helper to stylize brand name with sleek accent
  const renderBrandName = (name: string) => {
    if (!name) return <span>HORON <span className="text-[#C53030]">MOUSSO</span></span>;
    const parts = name.split(' ');
    if (parts.length === 1) {
      return <span>{parts[0]}</span>;
    }
    return (
      <span>
        {parts.slice(0, -1).join(' ')}{' '}
        <span className="text-[#C53030]">{parts[parts.length - 1]}</span>
      </span>
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-stone-200 shadow-sm transition-all">
      {/* Top micro-bar - Fnac Style Charcoal */}
      <div className="bg-[#191C20] text-stone-300 text-xs py-1.5 px-3 sm:px-8 flex items-center justify-between border-b border-stone-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <span className="flex items-center gap-2 text-[#E5A100] font-black truncate text-[11px] sm:text-xs tracking-wide">
            <span className="w-2 h-2 bg-[#E5A100] rounded-full animate-pulse shrink-0"></span>
            <span className="truncate">Le Grand Magasin du Terroir Malien • Horon Mousso</span>
          </span>
          <span className="hidden md:inline text-stone-600">•</span>
          <span className="hidden md:inline text-stone-400 text-xs">
            {settings.cityCountry || 'Bamako, Mali'} • Livraison Express à domicile & Retrait 1h
          </span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <a 
            href={`tel:${settings.phone.replace(/\s+/g, '')}`}
            className="hidden sm:flex items-center gap-1.5 text-stone-300 hover:text-[#E5A100] transition"
          >
            <PhoneCall className="w-3 h-3 text-[#E5A100]" />
            <span className="font-semibold">{settings.phone}</span>
          </a>
          <button
            type="button"
            onClick={() => setIsAdminMode(true)}
            className="flex items-center gap-1 text-stone-400 hover:text-[#E5A100] font-medium transition py-0.5 px-2 rounded hover:bg-stone-800 cursor-pointer text-[11px] sm:text-xs"
            title="Accès Administrateur"
          >
            <Lock className="w-3 h-3" />
            <span>{currentUser ? 'Admin' : 'Espace Admin'}</span>
          </button>
        </div>
      </div>

      {/* Main Navbar - Fnac Style */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-2.5 flex items-center justify-between gap-2.5 sm:gap-4">
        {/* Logo - Fnac Yellow Badge Style */}
        <button
          type="button"
          onClick={() => handleNavClick('accueil')}
          className="flex items-center gap-2 sm:gap-2.5 text-left group focus:outline-none cursor-pointer shrink-0"
        >
          {settings.logo ? (
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border border-stone-200 overflow-hidden shadow-2xs shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
              <img 
                src={settings.logo} 
                alt={settings.companyName}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#E5A100] text-stone-950 font-black text-xs flex flex-col items-center justify-center leading-none shadow-2xs border border-amber-600/30 group-hover:scale-105 transition-transform">
              <span className="font-black text-sm tracking-tighter">HM</span>
              <span className="text-[6.5px] uppercase font-extrabold tracking-widest mt-0.5">TERROIR</span>
            </div>
          )}
          <div>
            <div className="text-sm sm:text-base font-black tracking-tight text-stone-900 leading-tight">
              {renderBrandName(settings.companyName)}
            </div>
            <div className="text-[9.5px] sm:text-[10px] text-[#E5A100] font-black uppercase tracking-wider line-clamp-1">
              Épicerie Fine • Terroir Malien
            </div>
          </div>
        </button>

        {/* Central Search Bar (Fnac centerpiece) */}
        <div className="hidden md:block flex-1 max-w-xl mx-auto">
          <HeaderSearchBar />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Direct WhatsApp Action Button (Desktop/Tablet) */}
          <div className="hidden sm:flex items-center">
            <button
              type="button"
              onClick={() => openOrderWhatsApp()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
              title="Poser une question ou commander par WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-100" />
              <span className="hidden lg:inline">Aide & Commandes</span>
              <span className="lg:hidden">WhatsApp</span>
            </button>
          </div>

          {/* Cart Trigger - Fnac Style */}
          <button
            id="btn-navbar-cart"
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-stone-100 hover:bg-stone-200/90 text-stone-900 border border-stone-200 transition-all cursor-pointer shadow-2xs"
            aria-label="Ouvrir le panier"
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-stone-800" />
              {cartTotalCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-4.5 min-w-4.5 px-1 items-center justify-center rounded-full bg-[#E5A100] text-stone-950 text-[10px] font-black shadow-2xs border border-white">
                  {cartTotalCount}
                </span>
              )}
            </div>
            <div className="hidden sm:flex flex-col text-left leading-tight">
              <span className="text-[9.5px] uppercase font-bold text-stone-500">Mon Panier</span>
              <span className="text-xs font-extrabold text-stone-900">
                {cartTotalCount > 0 ? `${cartTotalCount} article${cartTotalCount > 1 ? 's' : ''}` : 'Vide'}
              </span>
            </div>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-xl text-stone-700 hover:text-stone-950 hover:bg-stone-100 transition focus:outline-none cursor-pointer"
            aria-label="Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar Row */}
      <div className="md:hidden px-3 pb-2">
        <HeaderSearchBar isMobile={true} />
      </div>

      {/* Secondary Ribbon - Fnac Department Bar ("Rayons") */}
      <div className="bg-stone-100 border-t border-stone-200 hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-0.5">
            {/* Tous les rayons button */}
            <button
              type="button"
              onClick={() => handleNavClick('produits')}
              className="bg-[#E5A100] hover:bg-[#D97706] text-stone-950 font-black text-xs px-3.5 py-1.5 flex items-center gap-1.5 uppercase tracking-wide transition cursor-pointer"
            >
              <Menu className="w-3.5 h-3.5" />
              <span>Tous nos rayons</span>
            </button>

            {/* Department Links */}
            {navLinks.map(link => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => handleNavClick(link.id)}
                  className={`text-xs font-bold transition-all px-2.5 py-1.5 cursor-pointer flex items-center gap-1 ${
                    isActive
                      ? 'text-stone-950 bg-white border-b-2 border-[#E5A100] shadow-2xs font-extrabold'
                      : 'text-stone-700 hover:text-stone-950 hover:bg-stone-200/60'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="px-1.5 py-0.2 text-[8.5px] font-black rounded-xs bg-red-600 text-white uppercase">
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right quick promo badge */}
          <button
            type="button"
            onClick={() => handleNavClick('produits')}
            className="text-xs font-black text-red-700 hover:text-red-800 flex items-center gap-1.5 px-2.5 py-0.5 bg-red-50 hover:bg-red-100 rounded-full border border-red-200 transition cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
            <span>Bons Plans & Packs Terroir</span>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#FCFAF7] border-b border-stone-200 px-4 pt-2 pb-5 space-y-1.5 shadow-2xl animate-in slide-in-from-top-2">
          <div className="text-[11px] font-bold text-amber-800/80 uppercase tracking-widest px-2 pt-1 pb-0.5">
            Menu Horon Mousso
          </div>
          {navLinks.map(link => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                type="button"
                onClick={() => handleNavClick(link.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-left transition cursor-pointer ${
                  isActive
                    ? 'bg-[#0F2916] text-white shadow-xs'
                    : 'text-stone-700 hover:bg-stone-200/60'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className={`px-1.5 py-0.5 text-[9px] font-black rounded-md ${
                      isActive ? 'bg-amber-400 text-stone-950' : 'bg-amber-100 text-amber-900'
                    }`}>
                      {link.badge}
                    </span>
                  )}
                </span>
                <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300' : 'text-stone-400'}`} />
              </button>
            );
          })}

          <div className="pt-4 border-t border-stone-200 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => {
                setIsCartOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold py-3 rounded-xl shadow-md transition cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Voir mon Panier ({cartTotalCount})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                openOrderWhatsApp();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 bg-[#123B1E] text-white font-bold py-3 rounded-xl shadow-md transition cursor-pointer border border-emerald-500/30"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Commander sur WhatsApp</span>
            </button>

            <div className="pt-1">
              <PWAInstallButton variant="navbar" className="w-full justify-center py-2.5" />
            </div>

            <button
              type="button"
              onClick={() => {
                setIsAdminMode(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 bg-stone-200/70 text-stone-700 hover:bg-stone-200 font-medium py-2.5 rounded-xl text-xs transition cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Espace Administrateur</span>
            </button>
          </div>
        </div>
      )}

      {/* Database & Multi-Device Sync Modal */}
      <SyncStatusModal 
        isOpen={isSyncModalOpen} 
        onClose={() => setIsSyncModalOpen(false)} 
      />
    </header>
  );
};
