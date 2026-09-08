import React, { useState, useEffect } from 'react';
import { Sparkles, X, ChevronLeft, ChevronRight, ShoppingBag, Flame, Leaf, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';

interface Story {
  id: string;
  title: string;
  category: string;
  icon: string;
  tagline: string;
  image: string;
  description: string;
  quote: string;
  spiceName: string;
  spiceId: string;
}

export const StoryHighlights: React.FC = () => {
  const { openProductDetail, addToCart, products } = useApp();
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const stories: Story[] = [
    {
      id: 'story_sikasso',
      title: 'Récolte Sikasso',
      category: 'Terroir Noble',
      icon: '🌾',
      tagline: 'Au cœur des terres fertiles du Mali',
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=85',
      description: 'Chaque matin dès l’aube, nos coopératives partenaires sélectionnent les plus beaux piments et graines de néré arrivés à maturité parfaite. Zéro pesticide, respect absolu de la terre nourricière.',
      quote: '« La noblesse d’une épice réside dans la patience et l’amour de la terre. »',
      spiceName: 'Piments Forts Entiers',
      spiceId: 'prod_2'
    },
    {
      id: 'story_soumbala',
      title: 'Or Noir du Néré',
      category: 'Savoir-Faire',
      icon: '✨',
      tagline: '72h de fermentation artisanale',
      image: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=1200&q=85',
      description: 'Le véritable Soumbala Horon Mousso est préparé selon le procédé millénaire des femmes mandingues : cuisson lente au feu de bois, fermentation naturelle et séchage doux. Un trésor d’arômes umami sans aucun bouillon chimique.',
      quote: '« Redonner à nos plats la saveur royale que nos aïeules nous ont transmise. »',
      spiceName: 'Soumbala Pur Grand Cru',
      spiceId: 'prod_soumbala'
    },
    {
      id: 'story_piments',
      title: 'Piments Royaux',
      category: 'Intensité & Feu',
      icon: '🔥',
      tagline: 'Capsaïcine & parfums préservés',
      image: 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?auto=format&fit=crop&w=1200&q=85',
      description: 'Nos piments sont séchés à basse température à l’abri de la poussière pour capturer la vivacité de leur couleur rubis et la puissance de leurs huiles essentielles.',
      quote: '« Un piquant net, éclatant, qui réchauffe sans jamais dénaturer vos mets. »',
      spiceName: 'Piment Rouge Extra Fort',
      spiceId: 'prod_1'
    },
    {
      id: 'story_gingembre',
      title: 'Rhizomes Dorés',
      category: 'Santé & Vitalité',
      icon: '🌿',
      tagline: 'Gingembre & Curcuma pur jus',
      image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=1200&q=85',
      description: 'Lavage méticuleux et broyage cryogénique à froid. Notre curcuma affiche un taux de curcumine maximal, tandis que le gingembre exhale une fraîcheur citronnée explosive.',
      quote: '« L’alliance suprême du goût incomparable et des vertus médicinales du terroir. »',
      spiceName: 'Curcuma Pur en Poudre',
      spiceId: 'prod_4'
    },
    {
      id: 'story_secrets',
      title: 'Secrets des Chefs',
      category: 'Art Culinaire',
      icon: '👩‍🍳',
      tagline: 'L’accord parfait pour chaque plat',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=85',
      description: 'De Bamako à Paris, les plus grands amoureux de gastronomie africaine utilisent nos assemblages signature pour sublimer Mafé, Tchep, poissons braisés et marinades dorées.',
      quote: '« Horon Mousso est devenu le secret jalousement gardé des meilleures tables. »',
      spiceName: 'Mélange Spécial Grillades',
      spiceId: 'prod_5'
    }
  ];

  // Story autoplay progression timer
  useEffect(() => {
    if (selectedStoryIndex === null || isPaused) return;

    const DURATION = 6500; // 6.5s per story
    const INTERVAL = 50;
    const step = (INTERVAL / DURATION) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          if (selectedStoryIndex < stories.length - 1) {
            setSelectedStoryIndex(selectedStoryIndex + 1);
            return 0;
          } else {
            setSelectedStoryIndex(null);
            return 0;
          }
        }
        return prev + step;
      });
    }, INTERVAL);

    return () => clearInterval(timer);
  }, [selectedStoryIndex, isPaused, stories.length]);

  const openStory = (idx: number) => {
    setSelectedStoryIndex(idx);
    setProgress(0);
  };

  const closeStory = () => {
    setSelectedStoryIndex(null);
    setProgress(0);
  };

  const nextStory = () => {
    if (selectedStoryIndex !== null && selectedStoryIndex < stories.length - 1) {
      setSelectedStoryIndex(selectedStoryIndex + 1);
      setProgress(0);
    } else {
      closeStory();
    }
  };

  const prevStory = () => {
    if (selectedStoryIndex !== null && selectedStoryIndex > 0) {
      setSelectedStoryIndex(selectedStoryIndex - 1);
      setProgress(0);
    }
  };

  const activeStory = selectedStoryIndex !== null ? stories[selectedStoryIndex] : null;
  const matchedProduct = activeStory ? products.find(p => p.id === activeStory.spiceId) : null;

  return (
    <>
      {/* Luxury Stories Horizontal Bar */}
      <div className="relative py-4 select-none">
        <div className="flex items-center justify-between pb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-[#0F2916]">
              Immersion Terroir • Nos Histoires & Secrets
            </span>
          </div>
          <span className="text-[11px] text-stone-500 font-medium">
            Cliquez pour vivre l’expérience
          </span>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar py-2 px-1">
          {stories.map((story, idx) => (
            <button
              key={story.id}
              onClick={() => openStory(idx)}
              className="flex flex-col items-center gap-2 group cursor-pointer focus:outline-none shrink-0 transition-transform duration-300 hover:scale-105"
            >
              {/* Animated Glowing Ring Avatar */}
              <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-amber-500 via-emerald-600 to-amber-300 shadow-md group-hover:shadow-amber-500/30 group-hover:scale-105 transition-all duration-300">
                <div className="p-0.5 bg-white rounded-full">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden relative bg-stone-900">
                    <img 
                      src={story.image} 
                      alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-115 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/25 group-hover:bg-transparent transition-colors" />
                    <span className="absolute bottom-1 right-1 text-sm bg-white/90 rounded-full w-5 h-5 flex items-center justify-center shadow-xs">
                      {story.icon}
                    </span>
                  </div>
                </div>
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-stone-800 group-hover:text-[#0F2916] transition-colors max-w-[80px] sm:max-w-[95px] text-center truncate">
                {story.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Fullscreen Interactive Luxury Story Viewer Modal */}
      <AnimatePresence>
        {activeStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4"
            onClick={closeStory}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="relative w-full max-w-md h-[88vh] max-h-[780px] bg-[#07170C] rounded-[32px] overflow-hidden shadow-2xl flex flex-col justify-between border border-amber-500/30 text-white"
              onClick={(e) => e.stopPropagation()}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* Background Image with Cinematic Gradient */}
              <div className="absolute inset-0 z-0">
                <img 
                  src={activeStory.image} 
                  alt={activeStory.title}
                  className="w-full h-full object-cover opacity-65 scale-105 transform animate-pulse-subtle"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#051108] via-[#08180E]/70 to-[#07170C]/90" />
              </div>

              {/* Top Bar: Progress Bars & Controls */}
              <div className="relative z-20 p-4 sm:p-5 space-y-3">
                {/* Multi-story Segment Progress Indicators */}
                <div className="flex items-center gap-1.5 w-full">
                  {stories.map((s, i) => (
                    <div key={s.id} className="h-1 flex-1 bg-white/25 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-300 to-amber-500 transition-all duration-75"
                        style={{
                          width: i < (selectedStoryIndex ?? 0) 
                            ? '100%' 
                            : i === (selectedStoryIndex ?? 0) 
                              ? `${progress}%` 
                              : '0%'
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Header User info & Close */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center font-black text-sm shadow-md">
                      HM
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-extrabold text-xs sm:text-sm text-white tracking-wide">
                          Horon Mousso
                        </h4>
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <p className="text-[10px] text-amber-200/90 font-medium">
                        {activeStory.category}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={closeStory}
                    className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition cursor-pointer border border-white/10"
                    aria-label="Fermer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Navigation Click Hotspots (Left / Right) */}
              <button 
                onClick={prevStory}
                className="absolute left-0 top-20 bottom-32 w-1/3 z-10 cursor-w-resize focus:outline-none"
                aria-label="Histoire précédente"
              />
              <button 
                onClick={nextStory}
                className="absolute right-0 top-20 bottom-32 w-1/3 z-10 cursor-e-resize focus:outline-none"
                aria-label="Histoire suivante"
              />

              {/* Story Central Content */}
              <div className="relative z-20 px-6 sm:px-8 space-y-4 my-auto">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  {activeStory.tagline}
                </span>

                <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight font-serif-heading">
                  {activeStory.title}
                </h3>

                <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-medium">
                  {activeStory.description}
                </p>

                <div className="p-3.5 rounded-2xl bg-black/40 backdrop-blur-md border-l-3 border-amber-400 text-amber-200 text-xs italic">
                  {activeStory.quote}
                </div>
              </div>

              {/* Bottom Interactive Product Card & CTA */}
              <div className="relative z-20 p-4 sm:p-5 bg-gradient-to-t from-black via-black/80 to-transparent pt-6 border-t border-white/10">
                {matchedProduct && (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 mb-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img 
                        src={matchedProduct.mainImage} 
                        alt={matchedProduct.name}
                        className="w-12 h-12 rounded-xl object-cover shrink-0 border border-white/20"
                        referrerPolicy="no-referrer"
                      />
                      <div className="truncate">
                        <p className="text-xs font-extrabold text-white truncate">
                          {matchedProduct.name}
                        </p>
                        <p className="text-xs text-amber-300 font-black">
                          {matchedProduct.price || '1 500 FCFA'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        addToCart(matchedProduct, 1);
                        closeStory();
                      }}
                      className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md shrink-0"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Ajouter</span>
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-stone-400 px-1">
                  <span>Touchez à gauche ou droite pour naviguer</span>
                  <button 
                    onClick={() => {
                      if (matchedProduct) openProductDetail(matchedProduct.id);
                      closeStory();
                    }}
                    className="text-amber-300 font-bold hover:underline cursor-pointer"
                  >
                    Voir la fiche détaillée →
                  </button>
                </div>
              </div>

              {/* Prev / Next desktop hover buttons */}
              <button
                onClick={prevStory}
                className="hidden sm:flex absolute -left-14 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white items-center justify-center backdrop-blur-md transition cursor-pointer"
                aria-label="Précédent"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextStory}
                className="hidden sm:flex absolute -right-14 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white items-center justify-center backdrop-blur-md transition cursor-pointer"
                aria-label="Suivant"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
