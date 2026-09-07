import React, { useState } from 'react';
import { useApp, PublicTab } from '../../context/AppContext';
import { Menu, X, PhoneCall, MessageCircle, Lock, ShoppingBag, ChevronRight, Cloud } from 'lucide-react';
import { SyncStatusModal } from '../common/SyncStatusModal';
import { PWAInstallButton } from '../common/PWAInstallButton';

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
    { id: 'produits', label: 'Produits' },
    { id: 'grossiste', label: 'Espace Grossiste', badge: 'B2B' },
    { id: 'actualites', label: 'Actualités' },
    { id: 'galerie', label: 'Galerie' },
    { id: 'a_propos', label: 'À Propos' },
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
    <header className="sticky top-0 z-40 bg-white border-b border-[#E0E0E0] transition-all">
      {/* Top micro-bar */}
      <div className="bg-[#1B3022] text-stone-300 text-xs py-1 px-3 sm:px-10 flex items-center justify-between border-b border-[#2D5A27]/40">
        <div className="flex items-center gap-3 overflow-hidden">
          <span className="flex items-center gap-1.5 text-emerald-300 font-medium truncate text-[11px] sm:text-xs">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shrink-0"></span>
            <span className="truncate">Horon Mousso • Épices, Soumbala & Terroir</span>
          </span>
          <span className="hidden md:inline text-stone-500">|</span>
          <span className="hidden md:inline text-stone-400">
            {settings.cityCountry}
          </span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <button
            onClick={() => setIsSyncModalOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-300 hover:text-white bg-[#2D5A27]/60 hover:bg-[#2D5A27] px-2.5 py-0.5 rounded-full transition cursor-pointer"
            title="Statut synchronisation Cloud & Locale (Multi-Appareils)"
          >
            <Cloud className="w-3 h-3 text-emerald-400" />
            <span>{syncStatus.isOnline ? 'Cloud Synchro' : 'Mode Local'}</span>
          </button>
          <a 
            href={`tel:${settings.phone.replace(/\s+/g, '')}`}
            className="hidden sm:flex items-center gap-1.5 hover:text-white transition"
          >
            <PhoneCall className="w-3 h-3 text-emerald-400" />
            <span>{settings.phone}</span>
          </a>
          <button
            onClick={() => setIsAdminMode(true)}
            className="flex items-center gap-1 text-stone-400 hover:text-emerald-300 font-medium transition py-0.5 px-2 rounded hover:bg-stone-800 cursor-pointer text-[11px] sm:text-xs"
            title="Accès Administrateur"
          >
            <Lock className="w-3 h-3" />
            <span>{currentUser ? 'Admin' : 'Espace Admin'}</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-8 lg:px-10 h-16 sm:h-20 flex items-center justify-between">
        {/* Logo & Company Name */}
        <button
          onClick={() => handleNavClick('accueil')}
          className="flex items-center gap-2.5 sm:gap-3 text-left group focus:outline-none cursor-pointer"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#2D5A27] rounded-lg flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
            {settings.logo ? (
              <img 
                src={settings.logo} 
                alt={settings.companyName}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-5 h-5 border-2 border-white rounded-full flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
              </div>
            )}
          </div>
          <div>
            <div className="text-base sm:text-xl font-bold tracking-tight text-[#1B3022]">
              {renderBrandName(settings.companyName)}
            </div>
            <div className="text-[10px] sm:text-[11px] text-gray-500 font-medium tracking-tight line-clamp-1">
              Commerce & Transformation
            </div>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7">
          {navLinks.map(link => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'text-[#2D5A27] font-bold border-b-2 border-[#2D5A27] pb-1'
                    : 'text-gray-600 hover:text-[#2D5A27]'
                }`}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="px-1.5 py-0.2 bg-amber-100 text-amber-900 text-[10px] font-extrabold rounded-md">
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cart Trigger */}
          <button
            id="btn-navbar-cart"
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-stone-100 hover:bg-stone-200 text-neutral-800 transition-colors cursor-pointer"
            aria-label="Ouvrir le panier"
          >
            <ShoppingBag className="w-4 h-4 text-[#2D5A27]" />
            <span className="text-xs font-bold hidden md:inline">Panier</span>
            {cartTotalCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-[#2D5A27] text-white text-[11px] font-bold">
                {cartTotalCount}
              </span>
            )}
          </button>

          {/* PWA Install Action Button */}
          <div className="hidden md:flex items-center">
            <PWAInstallButton variant="navbar" />
          </div>

          {/* Direct WhatsApp Action Button (Desktop/Tablet) */}
          <div className="hidden sm:flex items-center">
            <button
              onClick={() => openOrderWhatsApp()}
              className="bg-[#C53030] text-white px-5 py-2 rounded-full text-sm font-semibold shadow-md hover:bg-[#A62828] transition-all transform active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Commander</span>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2.5 rounded-lg text-stone-700 hover:text-stone-950 hover:bg-stone-100 transition focus:outline-none cursor-pointer"
            aria-label="Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#E0E0E0] px-6 pt-3 pb-6 space-y-2 shadow-xl animate-in slide-in-from-top-2">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2 pt-2 pb-1">
            Menu Principal
          </div>
          {navLinks.map(link => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-left transition cursor-pointer ${
                  isActive
                    ? 'bg-[#E8F5E9] text-[#2D5A27] font-bold'
                    : 'text-gray-600 hover:bg-stone-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="px-1.5 py-0.2 bg-amber-100 text-amber-900 text-[10px] font-extrabold rounded-md">
                      {link.badge}
                    </span>
                  )}
                </span>
                <ChevronRight className={`w-4 h-4 ${isActive ? 'text-[#2D5A27]' : 'text-gray-300'}`} />
              </button>
            );
          })}

          <div className="pt-4 border-t border-gray-100 flex flex-col gap-2.5">
            <button
              onClick={() => {
                setIsCartOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 bg-[#2D5A27] text-white font-semibold py-2.5 rounded-xl shadow-sm transition"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Voir mon Panier ({cartTotalCount})</span>
            </button>

            <button
              onClick={() => {
                openOrderWhatsApp();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 bg-[#C53030] text-white font-semibold py-2.5 rounded-xl shadow-sm hover:bg-[#A62828] transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Contact direct WhatsApp</span>
            </button>

            <div className="pt-1">
              <PWAInstallButton variant="navbar" className="w-full justify-center py-2.5" />
            </div>

            <button
              onClick={() => {
                setIsSyncModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium py-2 rounded-xl text-xs transition cursor-pointer"
            >
              <Cloud className="w-3.5 h-3.5 text-emerald-600" />
              <span>{syncStatus.isOnline ? 'Base en ligne & locale synchronisée' : 'Mode local hors-ligne'}</span>
            </button>

            <button
              onClick={() => {
                setIsAdminMode(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 bg-stone-100 text-gray-700 hover:bg-stone-200 font-medium py-2.5 rounded-xl text-xs transition"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Accès Espace Administrateur</span>
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
