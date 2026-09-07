import React, { useState, useEffect } from 'react';
import { Sparkles, X, Gift, Copy, Check, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const WelcomePromoModal: React.FC = () => {
  const { setActiveTab, setIsCartOpen, showToast } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => {
    // Check if dismissed or shown in this session
    const hasDismissed = sessionStorage.getItem('horon_welcome_promo_dismissed');
    if (!hasDismissed) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3500); // Trigger smoothly after 3.5 seconds
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('horon_welcome_promo_dismissed', 'true');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText('BIENVENUE10');
    setHasCopied(true);
    showToast('Code BIENVENUE10 copié ! Vous bénéficiez de -10%', 'success');
    setTimeout(() => setHasCopied(false), 2500);
  };

  const handleUseOffer = () => {
    handleCopyCode();
    handleClose();
    setActiveTab('produits');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="fixed inset-0"
        onClick={handleClose}
      />

      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-stone-200 text-center space-y-4">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 transition cursor-pointer"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Badge */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-xs">
          <Gift className="w-7 h-7 text-amber-700" />
        </div>

        <div className="space-y-1">
          <span className="inline-block px-2.5 py-0.5 bg-emerald-100 text-[#2D5A27] text-xs font-bold rounded-full">
            Cadeau de Bienvenue
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            10% de Réduction Immédiate
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-xs mx-auto">
            Découvrez l'authenticité de nos épices d'exception, piments séchés et soumbala artisanal avec notre offre découverte.
          </p>
        </div>

        {/* Code Voucher Box */}
        <div className="p-3.5 bg-stone-50 rounded-2xl border-2 border-dashed border-emerald-300 flex items-center justify-between gap-3">
          <div className="text-left pl-1">
            <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">Votre code promo</span>
            <span className="font-mono font-black text-lg text-[#2D5A27] tracking-wider">BIENVENUE10</span>
          </div>

          <button
            type="button"
            onClick={handleCopyCode}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-emerald-50 text-[#2D5A27] border border-emerald-300 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
          >
            {hasCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copié !</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copier</span>
              </>
            )}
          </button>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={handleUseOffer}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[#2D5A27] hover:bg-[#23481f] text-white font-bold text-sm shadow-md transition cursor-pointer"
          >
            <span>Profiter de mes -10% maintenant</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleClose}
            className="text-xs text-stone-400 hover:text-stone-600 transition cursor-pointer"
          >
            Non merci, je continue ma visite
          </button>
        </div>
      </div>
    </div>
  );
};
