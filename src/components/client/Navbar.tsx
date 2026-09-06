import React, { useState } from 'react';
import { useApp, PublicTab } from '../../context/AppContext';
import { Menu, X, PhoneCall, MessageCircle, Lock, Sparkles, ChevronRight } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, settings, setIsAdminMode, currentUser, openOrderWhatsApp } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks: { id: PublicTab; label: string }[] = [
    { id: 'accueil', label: 'Accueil' },
    { id: 'produits', label: 'Produits' },
    { id: 'actualites', label: 'Actualités' },
    { id: 'galerie', label: 'Galerie' },
    { id: 'a_propos', label: 'À Propos' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (tabId: PublicTab) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  // Helper to stylize brand name with sleek chili accent
  const renderBrandName = (name: string) => {
    if (!name) return <span>AGRI<span className="text-[#C53030]">TRANS</span></span>;
    const parts = name.split(' ');
    if (parts.length === 1) {
      const mid = Math.ceil(parts[0].length / 2);
      return (
        <span>
          {parts[0].slice(0, mid)}
          <span className="text-[#C53030]">{parts[0].slice(mid)}</span>
        </span>
      );
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
      <div className="bg-[#1B3022] text-stone-300 text-xs py-1.5 px-4 sm:px-10 flex items-center justify-between border-b border-[#2D5A27]/40">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-300 font-medium">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            Unité de transformation agricole & épices d’excellence
          </span>
          <span className="hidden md:inline text-stone-500">|</span>
          <span className="hidden md:inline text-stone-400">
            {settings.cityCountry}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <a 
            href={`tel:${settings.phone.replace(/\s+/g, '')}`}
            className="flex items-center gap-1.5 hover:text-white transition"
          >
            <PhoneCall className="w-3 h-3 text-emerald-400" />
            <span className="hidden sm:inline">{settings.phone}</span>
          </a>
          <button
            onClick={() => setIsAdminMode(true)}
            className="flex items-center gap-1 text-stone-400 hover:text-emerald-300 font-medium transition py-0.5 px-2 rounded hover:bg-stone-800"
            title="Accès Administrateur"
          >
            <Lock className="w-3 h-3" />
            <span>{currentUser ? 'Admin (Connecté)' : 'Espace Admin'}</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 h-20 flex items-center justify-between">
        {/* Logo & Company Name */}
        <button
          onClick={() => handleNavClick('accueil')}
          className="flex items-center gap-3 text-left group focus:outline-none"
        >
          <div className="w-10 h-10 bg-[#2D5A27] rounded-lg flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
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
            <div className="text-xl font-bold tracking-tight text-[#1B3022]">
              {renderBrandName(settings.companyName)}
            </div>
            <div className="text-[11px] text-gray-500 font-medium tracking-tight">
              Commerce & Transformation Agricole
            </div>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map(link => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-[#2D5A27] font-bold'
                    : 'text-gray-500 hover:text-[#2D5A27]'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Action Button */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={() => openOrderWhatsApp()}
            className="bg-[#C53030] text-white px-6 py-2.5 rounded-full text-sm font-semibold shadow-lg shadow-red-100 hover:bg-[#A62828] transition-all transform active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Commander</span>
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={() => openOrderWhatsApp()}
            className="p-2 bg-[#C53030] text-white rounded-full text-xs font-semibold flex items-center gap-1 sm:hidden shadow-sm"
            aria-label="Commander"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2.5 rounded-lg text-stone-700 hover:text-stone-950 hover:bg-stone-100 transition focus:outline-none"
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
            Menu
          </div>
          {navLinks.map(link => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-left transition ${
                  isActive
                    ? 'bg-[#E8F5E9] text-[#2D5A27] font-bold'
                    : 'text-gray-600 hover:bg-stone-50'
                }`}
              >
                <span>{link.label}</span>
                <ChevronRight className={`w-4 h-4 ${isActive ? 'text-[#2D5A27]' : 'text-gray-300'}`} />
              </button>
            );
          })}

          <div className="pt-4 border-t border-gray-100 flex flex-col gap-2.5">
            <button
              onClick={() => {
                openOrderWhatsApp();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 bg-[#C53030] text-white font-semibold py-3 rounded-full shadow-lg shadow-red-100 hover:bg-[#A62828] transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Commander sur WhatsApp</span>
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
    </header>
  );
};
