import React, { useState, useEffect } from 'react';
import { ShoppingBag, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PurchaseNotification {
  name: string;
  location: string;
  product: string;
  timeAgo: string;
  avatar: string;
}

export const LiveSocialProofToast: React.FC = () => {
  const [currentNotification, setCurrentNotification] = useState<PurchaseNotification | null>(null);
  const [dismissed, setDismissed] = useState<boolean>(false);

  const notifications: PurchaseNotification[] = [
    {
      name: 'Aminata T.',
      location: 'Hamdallaye ACI 2000, Bamako',
      product: '2x Soumbala Pur de Néré (Grand Cru)',
      timeAgo: 'il y a 4 min',
      avatar: 'AT'
    },
    {
      name: 'Chef Ousmane D.',
      location: 'Cocody, Abidjan',
      product: '1x Sac 5kg Piment Rouge Extra Fort',
      timeAgo: 'il y a 9 min',
      avatar: 'OD'
    },
    {
      name: 'Fatoumata S.',
      location: 'Kalaban Coura, Bamako',
      product: '1x Pack Découverte Terroir Trio',
      timeAgo: 'il y a 14 min',
      avatar: 'FS'
    },
    {
      name: 'Mariam C.',
      location: 'Marcory Zone 4, Abidjan',
      product: '3x Curcuma Pur & Gingembre Grand Arôme',
      timeAgo: 'il y a 22 min',
      avatar: 'MC'
    },
    {
      name: 'Ibrahim B.',
      location: 'Baco-Djicoroni, Bamako',
      product: '1x Mélange Spécial Grillades & Sauces',
      timeAgo: 'il y a 31 min',
      avatar: 'IB'
    }
  ];

  useEffect(() => {
    if (dismissed) return;

    // Show first after 5 seconds
    const initialTimeout = setTimeout(() => {
      setCurrentNotification(notifications[0]);
    }, 5000);

    // Rotate every 20 seconds
    let index = 1;
    const interval = setInterval(() => {
      setCurrentNotification(notifications[index % notifications.length]);
      index++;

      // Auto dismiss after 6 seconds of display
      setTimeout(() => {
        setCurrentNotification(null);
      }, 6000);
    }, 22000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [dismissed]);

  if (dismissed || !currentNotification) return null;

  return (
    <div className="fixed bottom-20 left-4 z-40 max-w-sm hidden sm:block select-none pointer-events-auto">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 320, damping: 25 }}
          className="bg-white/95 backdrop-blur-md rounded-2xl p-3.5 border border-amber-500/25 shadow-2xl flex items-center gap-3.5 relative"
        >
          {/* Avatar / Icon with live pulse */}
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-full bg-[#0F2916] text-amber-300 font-extrabold text-xs flex items-center justify-center border border-amber-400/40">
              {currentNotification.avatar}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
              <CheckCircle2 className="w-2.5 h-2.5 text-white" />
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-black text-stone-900 truncate">
                {currentNotification.name}
              </p>
              <span className="text-[10px] text-stone-400 font-medium">
                • {currentNotification.timeAgo}
              </span>
            </div>
            <p className="text-[11px] font-bold text-[#0F2916] truncate">
              {currentNotification.product}
            </p>
            <p className="text-[10px] text-stone-500 truncate">
              Livraison : {currentNotification.location}
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={() => {
              setCurrentNotification(null);
              setDismissed(true);
            }}
            className="text-stone-400 hover:text-stone-600 p-1 rounded-md transition cursor-pointer"
            aria-label="Fermer la notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
