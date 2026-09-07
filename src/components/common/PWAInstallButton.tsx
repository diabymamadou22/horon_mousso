import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Smartphone, Download, Check, Share, PlusSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PWAInstallButtonProps {
  variant?: 'navbar' | 'banner' | 'footer' | 'pill';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ 
  variant = 'navbar',
  className = ''
}) => {
  const { isInstallable, isInstalled, isStandalone, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    try {
      return sessionStorage.getItem('horon_pwa_prompt_dismissed') === 'true';
    } catch {
      return false;
    }
  });

  // If running in standalone mode (already installed), no need for prompt banner
  if (isStandalone || isInstalled) {
    if (variant === 'navbar' || variant === 'footer') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-full font-medium">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">App Installée</span>
        </span>
      );
    }
    return null;
  }

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }
    if (isInstallable) {
      await install();
    } else {
      // Guide non-iOS desktop/mobile users if prompt not yet fired
      setShowIOSModal(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem('horon_pwa_prompt_dismissed', 'true');
    } catch {}
  };

  // 1. NAVBAR / COMPACT BUTTON
  if (variant === 'navbar') {
    return (
      <>
        <button
          onClick={handleInstallClick}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-[#2D5A27] hover:from-emerald-500 hover:to-[#23471f] shadow-md hover:shadow-lg transition-all transform hover:scale-105 active:scale-95 border border-emerald-400/30 cursor-pointer ${className}`}
          title="Installer Horon Mousso sur votre écran d'accueil"
          id="btn-pwa-install-navbar"
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-300" />
          <span>Installer l'App</span>
        </button>

        {/* Modal guidance for iOS / manual install */}
        <IOSInstallModal isOpen={showIOSModal} onClose={() => setShowIOSModal(false)} />
      </>
    );
  }

  // 2. FOOTER BUTTON
  if (variant === 'footer') {
    return (
      <>
        <button
          onClick={handleInstallClick}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-emerald-200 bg-[#1B3022] hover:bg-[#2D5A27] border border-emerald-700/50 hover:text-white transition shadow-sm cursor-pointer ${className}`}
          id="btn-pwa-install-footer"
        >
          <Download className="w-4 h-4 text-amber-400" />
          <span>Installer l'application mobile / tablette</span>
        </button>
        <IOSInstallModal isOpen={showIOSModal} onClose={() => setShowIOSModal(false)} />
      </>
    );
  }

  // 3. FLOATING MOBILE BANNER
  if (variant === 'banner') {
    if (isDismissed) return null;

    return (
      <>
        <AnimatePresence>
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 bg-[#0F1D13]/95 backdrop-blur-md border border-amber-500/30 rounded-2xl p-4 shadow-2xl text-white"
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#2D5A27] border border-amber-400/50 flex items-center justify-center shrink-0 p-2 overflow-hidden shadow-inner">
                <img src="/icon.svg" alt="Horon Mousso Logo" className="w-full h-full object-contain" />
              </div>

              <div className="flex-1 min-w-0 pr-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  Installer Horon Mousso
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-semibold px-1.5 py-0.5 rounded border border-amber-500/30 uppercase">
                    PWA
                  </span>
                </h4>
                <p className="text-xs text-stone-300 mt-0.5 line-clamp-2">
                  Accédez aux épices, passez vos commandes hors-ligne et profitez d'un accès direct ultra rapide sur votre écran.
                </p>

                <div className="flex items-center gap-2.5 mt-3">
                  <button
                    onClick={handleInstallClick}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-neutral-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-md transition transform hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Installer Maintenant</span>
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="text-xs text-stone-400 hover:text-white px-2 py-1 transition cursor-pointer"
                  >
                    Plus tard
                  </button>
                </div>
              </div>

              <button
                onClick={handleDismiss}
                className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
                aria-label="Fermer la notification d'installation"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        <IOSInstallModal isOpen={showIOSModal} onClose={() => setShowIOSModal(false)} />
      </>
    );
  }

  return null;
};

/* Modal Guide for iOS Safari & Manual Browsers */
const IOSInstallModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-stone-900 border border-amber-500/40 rounded-3xl max-w-sm w-full p-6 text-white shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#2D5A27] flex items-center justify-center border border-amber-400/40">
                  <img src="/icon.svg" alt="HM" className="w-6 h-6 object-contain" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Installer sur votre écran</h3>
                  <p className="text-[11px] text-emerald-400 font-medium">Compatible Téléphone, Tablette & PC</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-1 text-stone-400 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-stone-300">
              <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                  1
                </div>
                <div>
                  <p className="font-semibold text-white">Sur iPhone / iPad (Safari) :</p>
                  <p className="mt-1 flex items-center gap-1.5">
                    Appuyez sur le bouton Partager <Share className="w-3.5 h-3.5 text-sky-400 inline" /> dans la barre de votre navigateur.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                  2
                </div>
                <div>
                  <p className="font-semibold text-white">Ajouter à l'écran d'accueil :</p>
                  <p className="mt-1 flex items-center gap-1.5">
                    Faites défiler vers le bas et sélectionnez <strong className="text-amber-300 flex items-center gap-1">« Sur l'écran d'accueil » <PlusSquare className="w-3.5 h-3.5 text-amber-300" /></strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                  ✓
                </div>
                <div>
                  <p className="font-semibold text-white">Sur Android & Ordinateur (Chrome / Edge) :</p>
                  <p className="mt-1">
                    Cliquez sur les 3 points du navigateur puis <strong>« Installer l'application Horon Mousso »</strong>.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-1">
              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-[#2D5A27] text-white font-bold text-xs hover:brightness-110 transition cursor-pointer"
              >
                Compris, merci !
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
