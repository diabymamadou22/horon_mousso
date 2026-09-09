import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { PromoBanner, PublicTab } from '../../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  ArrowRight, 
  MessageCircle, 
  ShoppingBag, 
  Pause, 
  Play,
  Layers,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const DEFAULT_BANNERS: PromoBanner[] = [
  {
    id: 'banner_1',
    title: "L'Or Noir du Terroir : Soumbala Pur d'Exception",
    subtitle: "Graines de néré nobles fermentées 72h selon la tradition • 100% Naturel • Arôme profond & umami authentique.",
    badge: "PRODUIT PHARE HORON MOUSSO",
    imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1920&q=80',
    linkTab: 'produits',
    buttonText: 'Découvrir nos produits',
    isPureImage: false,
    active: true,
    order: 1
  },
  {
    id: 'banner_2',
    title: "Piments Rouges Extra Forts & Épices Nobles",
    subtitle: "Séchage solaire hygiénique, arôme piquant explosif et couleur éclatante préservée de la récolte au sachet.",
    badge: "NOUVEL ARRIVAGE FRAÎCHEUR",
    imageUrl: 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?auto=format&fit=crop&w=1920&q=80',
    linkTab: 'produits',
    buttonText: 'Commander nos épices',
    isPureImage: false,
    active: true,
    order: 2
  },
  {
    id: 'banner_3',
    title: "Livraison Express Bamako & Expéditions Sous-Région",
    subtitle: "Pots étanches, sachets hermétiques et sacs de gros pour particuliers, traiteurs et restaurateurs exigeants.",
    badge: "EXPÉDITION IMMÉDIATE",
    imageUrl: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=1920&q=80',
    linkTab: 'contact',
    buttonText: 'Commander sur WhatsApp',
    isPureImage: false,
    active: true,
    order: 3
  }
];

export const HeroSection: React.FC = () => {
  const { settings, setActiveTab, openOrderWhatsApp } = useApp();

  // Retrieve banners from admin settings or fallback to default
  const configuredBanners = settings.heroBanners && settings.heroBanners.length > 0
    ? settings.heroBanners.filter(b => b.active)
    : [];

  const banners = configuredBanners.length > 0 
    ? [...configuredBanners].sort((a, b) => a.order - b.order) 
    : DEFAULT_BANNERS;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const touchStartXRef = useRef<number | null>(null);

  const isAutoplayEnabled = settings.heroBannerAutoplay !== false;
  const slideDurationSeconds = settings.heroBannerInterval && settings.heroBannerInterval >= 2 
    ? settings.heroBannerInterval 
    : 6;
  const SLIDE_DURATION = slideDurationSeconds * 1000;
  const transitionType = settings.heroBannerTransition || 'slide';

  // Ensure currentIndex stays within bounds if banner count changes
  useEffect(() => {
    if (currentIndex >= banners.length) {
      setCurrentIndex(0);
    }
  }, [banners.length, currentIndex]);

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex(prev => (prev + 1) % banners.length);
    setProgress(0);
  }, [banners.length]);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex(prev => (prev - 1 + banners.length) % banners.length);
    setProgress(0);
  }, [banners.length]);

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
    setProgress(0);
  };

  // Autoplay timer with progress bar
  useEffect(() => {
    if (isPaused || banners.length <= 1 || !isAutoplayEnabled) return;

    const intervalTime = 50; // update progress every 50ms
    const step = (intervalTime / SLIDE_DURATION) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPaused, banners.length, handleNext, isAutoplayEnabled, SLIDE_DURATION]);

  // Touch gesture support for mobile swiping
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;
    if (Math.abs(diff) > 45) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartXRef.current = null;
  };

  const currentBanner = banners[currentIndex] || banners[0];

  const handleBannerAction = (banner: PromoBanner) => {
    if (banner.linkTab === 'whatsapp') {
      const msg = banner.customWhatsAppMessage || `Bonjour ${settings.companyName}, je souhaite profiter de votre offre publicitaire : *${banner.title || 'Offre Spéciale'}*`;
      openOrderWhatsApp(msg);
      return;
    }
    if (banner.productId) {
      setActiveTab('produits');
      setTimeout(() => {
        const el = document.getElementById(`product-${banner.productId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('ring-4', 'ring-amber-400');
          setTimeout(() => el.classList.remove('ring-4', 'ring-amber-400'), 2500);
        }
      }, 300);
      return;
    }
    if (banner.linkTab) {
      setActiveTab(banner.linkTab as PublicTab);
      return;
    }
    // Default action
    setActiveTab('produits');
  };

  // Slide animation variants depending on settings transition
  const getVariants = () => {
    if (transitionType === 'fade') {
      return {
        enter: () => ({ opacity: 0, scale: 1 }),
        center: { opacity: 1, scale: 1, transition: { duration: 0.6 } },
        exit: () => ({ opacity: 0, scale: 1, transition: { duration: 0.4 } })
      };
    }
    if (transitionType === 'zoom') {
      return {
        enter: () => ({ opacity: 0, scale: 1.12 }),
        center: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
        exit: () => ({ opacity: 0, scale: 0.94, transition: { duration: 0.4 } })
      };
    }
    // Default slide
    return {
      enter: (dir: number) => ({
        x: dir > 0 ? '100%' : '-100%',
        opacity: 0,
        scale: 1.04
      }),
      center: {
        x: 0,
        opacity: 1,
        scale: 1,
        transition: {
          x: { type: 'spring', stiffness: 280, damping: 30 },
          opacity: { duration: 0.4 },
          scale: { duration: 0.5 }
        }
      },
      exit: (dir: number) => ({
        x: dir > 0 ? '-100%' : '100%',
        opacity: 0,
        scale: 0.98,
        transition: {
          x: { type: 'spring', stiffness: 280, damping: 30 },
          opacity: { duration: 0.3 }
        }
      })
    };
  };

  const slideVariants = getVariants();

  // Badge Color styling
  const getBadgeStyle = (color?: string) => {
    switch (color) {
      case 'green':
        return 'bg-emerald-600 text-white border-emerald-400';
      case 'red':
        return 'bg-rose-600 text-white border-rose-400';
      case 'blue':
        return 'bg-sky-600 text-white border-sky-400';
      case 'black':
        return 'bg-neutral-900 text-amber-400 border-amber-500/40';
      case 'gold':
      default:
        return 'bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 font-black border-amber-300';
    }
  };

  // Overlay Opacity styling
  const getOverlayStyle = (opacity?: string, isPure?: boolean) => {
    if (isPure) {
      return 'bg-gradient-to-t from-black/60 via-transparent to-black/20';
    }
    switch (opacity) {
      case 'light':
        return 'bg-gradient-to-t sm:bg-gradient-to-r from-black/70 via-black/35 to-transparent';
      case 'dark':
        return 'bg-gradient-to-t sm:bg-gradient-to-r from-black/95 via-black/80 to-black/40';
      case 'none':
        return 'bg-gradient-to-t sm:bg-gradient-to-r from-black/40 via-transparent to-transparent';
      case 'medium':
      default:
        return 'bg-gradient-to-t sm:bg-gradient-to-r from-black/90 via-black/65 to-black/20';
    }
  };

  // Text alignment styling
  const getTextAlignmentStyle = (align?: string) => {
    switch (align) {
      case 'center':
        return 'text-center items-center mx-auto';
      case 'right':
        return 'text-right items-end ml-auto';
      case 'left':
      default:
        return 'text-left items-start mr-auto';
    }
  };

  return (
    <section 
      className="relative w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2 sm:pt-4"
      aria-label="Panneau publicitaire et offres promotionnelles"
    >
      {/* Outer Billboard Frame Container */}
      <div 
        className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl bg-neutral-950 border border-amber-500/20 group select-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Aspect Ratio Container for True Advertising Billboard */}
        <div className="relative w-full h-[320px] sm:h-[420px] md:h-[480px] lg:h-[530px] overflow-hidden">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentBanner.id || currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0 w-full h-full cursor-pointer"
              onClick={() => handleBannerAction(currentBanner)}
            >
              {/* Background Poster Image */}
              <img
                src={currentBanner.imageUrl}
                alt={currentBanner.title || 'Affiche publicitaire Horon Mousso'}
                className="w-full h-full object-cover object-center transform scale-100 transition-transform duration-7000 ease-out group-hover:scale-105"
                loading={currentIndex === 0 ? 'eager' : 'lazy'}
                referrerPolicy="no-referrer"
              />

              {/* Dynamic Gradient Overlay */}
              <div 
                className={`absolute inset-0 transition-opacity duration-500 ${getOverlayStyle(currentBanner.overlayOpacity, currentBanner.isPureImage)}`} 
              />

              {/* Billboard Banner Content */}
              {!currentBanner.isPureImage && (
                <div className={`absolute inset-0 p-5 sm:p-8 md:p-12 lg:p-14 flex flex-col justify-end sm:justify-center max-w-2xl sm:max-w-xl md:max-w-2xl text-white z-10 space-y-3 sm:space-y-4 ${getTextAlignmentStyle(currentBanner.textAlignment)}`}>
                  {/* Badge */}
                  {currentBanner.badge && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15, duration: 0.4 }}
                    >
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full font-black text-[10px] sm:text-xs tracking-wider uppercase shadow-lg backdrop-blur-md border ${getBadgeStyle(currentBanner.badgeColor)}`}>
                        <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span>{currentBanner.badge}</span>
                      </span>
                    </motion.div>
                  )}

                  {/* Title */}
                  {currentBanner.title && (
                    <motion.h2
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25, duration: 0.45 }}
                      className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15] text-white drop-shadow-md font-serif-heading"
                    >
                      {currentBanner.title}
                    </motion.h2>
                  )}

                  {/* Subtitle */}
                  {currentBanner.subtitle && (
                    <motion.p
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35, duration: 0.45 }}
                      className="text-xs sm:text-sm md:text-base text-stone-200 line-clamp-2 sm:line-clamp-3 leading-relaxed drop-shadow-sm font-medium"
                    >
                      {currentBanner.subtitle}
                    </motion.p>
                  )}

                  {/* Action Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45, duration: 0.45 }}
                    className="pt-1 sm:pt-2"
                  >
                    <button
                      id={`btn-banner-action-${currentBanner.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBannerAction(currentBanner);
                      }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-xl hover:shadow-emerald-600/40 transition-all transform hover:scale-105 active:scale-95 cursor-pointer border border-emerald-400/40"
                    >
                      {currentBanner.linkTab === 'whatsapp' ? (
                        <MessageCircle className="w-4 h-4 text-emerald-200" />
                      ) : (
                        <ShoppingBag className="w-4 h-4 text-amber-300" />
                      )}
                      <span>{currentBanner.buttonText || 'Découvrir la sélection'}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-white/80" />
                    </button>
                  </motion.div>
                </div>
              )}

              {/* If Pure Image, show floating pill badge in corner indicating it's clickable */}
              {currentBanner.isPureImage && (
                <div className="absolute bottom-5 left-5 sm:bottom-8 sm:left-8 z-10">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/60 text-white/90 text-xs font-semibold backdrop-blur-md border border-white/20">
                    <span>Cliquez pour voir les offres</span>
                    <ArrowRight className="w-3 h-3 text-amber-400" />
                  </span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Left Arrow Button */}
          {banners.length > 1 && (
            <button
              id="btn-hero-carousel-prev"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/80 text-white/90 hover:text-white flex items-center justify-center backdrop-blur-md border border-white/20 shadow-lg transition-all transform hover:scale-110 active:scale-95 cursor-pointer opacity-80 sm:opacity-0 sm:group-hover:opacity-100"
              title="Affiche précédente"
              aria-label="Affiche précédente"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Right Arrow Button */}
          {banners.length > 1 && (
            <button
              id="btn-hero-carousel-next"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/80 text-white/90 hover:text-white flex items-center justify-center backdrop-blur-md border border-white/20 shadow-lg transition-all transform hover:scale-110 active:scale-95 cursor-pointer opacity-80 sm:opacity-0 sm:group-hover:opacity-100"
              title="Affiche suivante"
              aria-label="Affiche suivante"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Top Right Controls: Counter & Pause/Play Indicator */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center gap-2">
            <button
              id="btn-toggle-hero-pause"
              onClick={(e) => {
                e.stopPropagation();
                setIsPaused(!isPaused);
              }}
              className="px-2.5 py-1 rounded-full bg-black/50 hover:bg-black/70 text-white/90 text-[11px] font-semibold backdrop-blur-md border border-white/20 flex items-center gap-1.5 transition cursor-pointer"
              title={isPaused ? "Reprendre le défilement automatique" : "Mettre en pause le défilement"}
            >
              {isPaused ? (
                <>
                  <Play className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                  <span className="hidden sm:inline">Pause</span>
                </>
              ) : (
                <>
                  <Pause className="w-3 h-3 text-amber-400" />
                  <span className="hidden sm:inline">Défilement</span>
                </>
              )}
            </button>

            <span className="px-2.5 py-1 rounded-full bg-black/50 text-white/90 text-[11px] font-bold backdrop-blur-md border border-white/20 tabular-nums">
              {currentIndex + 1} / {banners.length}
            </span>
          </div>

          {/* Bottom Indicators & Progress Bar */}
          <div className="absolute bottom-3 sm:bottom-4 inset-x-0 z-20 flex flex-col items-center gap-2 pointer-events-none">
            {/* Dots */}
            {banners.length > 1 && (
              <div className="flex items-center gap-2 pointer-events-auto bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/15 shadow-md">
                {banners.map((b, idx) => (
                  <button
                    key={b.id || idx}
                    id={`btn-hero-dot-${idx}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      goToSlide(idx);
                    }}
                    className={`transition-all rounded-full cursor-pointer ${
                      idx === currentIndex 
                        ? 'w-6 sm:w-8 h-2 sm:h-2.5 bg-amber-400 shadow-sm' 
                        : 'w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white/40 hover:bg-white/80'
                    }`}
                    title={`Aller à la pub ${idx + 1}`}
                    aria-label={`Aller à la pub ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Continuous Bottom Progress Line */}
          {banners.length > 1 && !isPaused && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20 overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-amber-400 to-emerald-400"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
