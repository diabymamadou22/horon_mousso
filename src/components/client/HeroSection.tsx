import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ArrowRight, 
  Package, 
  Truck, 
  Sparkles, 
  ShoppingBag, 
  Check, 
  Star, 
  Flame, 
  Leaf, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight, 
  MessageCircle, 
  Award,
  Zap
} from 'lucide-react';
import { 
  motion, 
  AnimatePresence, 
  useScroll, 
  useTransform, 
  useSpring, 
  useMotionValue 
} from 'motion/react';

export const HeroSection: React.FC = () => {
  const { settings, setActiveTab, openProductDetail, products, addToCart, openOrderWhatsApp } = useApp();
  const heroRef = useRef<HTMLDivElement>(null);

  // Find 4 star products for the interactive hero
  const heroProducts = products.filter(p => p.isFeatured || p.isNew).slice(0, 4);
  const activeHeroList = heroProducts.length > 0 ? heroProducts : products.slice(0, 4);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [justAdded, setJustAdded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Auto cycle every 7 seconds, pauses if user hovers
  useEffect(() => {
    if (isHovered || activeHeroList.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % activeHeroList.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [isHovered, activeHeroList.length]);

  const currentProduct = activeHeroList[currentIndex] || products[0];

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentProduct) return;
    addToCart(currentProduct, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  // --- PARALLAX & 3D TILT ENGINE ---
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const scrollTextY = useTransform(scrollYProgress, [0, 1], [0, 40]);
  const scrollCardY = useTransform(scrollYProgress, [0, 1], [0, 25]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 28, stiffness: 140, mass: 0.7 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // Parallax transforms
  const cardRotateX = useTransform(smoothMouseY, [-0.5, 0.5], [6, -6]);
  const cardRotateY = useTransform(smoothMouseX, [-0.5, 0.5], [-8, 8]);
  const cardParallaxX = useTransform(smoothMouseX, [-0.5, 0.5], [12, -12]);
  const textParallaxX = useTransform(smoothMouseX, [-0.5, 0.5], [-8, 8]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const normalizedX = (e.clientX - rect.left) / rect.width - 0.5;
    const normalizedY = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(normalizedX);
    mouseY.set(normalizedY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  // Heat index calculation for active product
  const getProductHeatInfo = (p?: typeof currentProduct) => {
    if (!p) return { level: 2, label: 'Équilibré & Aromatique' };
    if (p.category === 'piments') {
      if (p.name.toLowerCase().includes('extra fort')) return { level: 4, label: 'Piquant Explosif (Scoville 80k+)' };
      return { level: 3, label: 'Piquant Intense & Fruité' };
    }
    if (p.id === 'prod_soumbala') return { level: 2, label: 'Umami Noble 72h' };
    return { level: 1, label: 'Doux, Tonique & Réchauffant' };
  };

  const heatInfo = getProductHeatInfo(currentProduct);

  return (
    <div 
      ref={heroRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative bg-gradient-to-b from-[#06140B] via-[#091E11] to-[#0D2817] text-white border-b border-amber-500/20 overflow-hidden select-none"
    >
      {/* Background ambient lighting effects */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Subtle geometric luxury grid overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40" />

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 pt-10 pb-14 lg:pt-16 lg:pb-20 z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-14">
          
          {/* Left Column: Typography, Value Proposition & CTAs */}
          <motion.div 
            style={{ x: textParallaxX, y: scrollTextY }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.25, 1, 0.5, 1] }}
            className="flex-1 flex flex-col justify-center space-y-7 will-change-transform"
          >
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-black uppercase tracking-wider shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Maison d'Épices & Gastronomie du Terroir</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-stone-200 text-xs font-bold border border-white/15">
                <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% Pur & Naturel • 0 Additif</span>
              </span>
            </div>

            {/* Majestic Editorial Heading */}
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-5xl lg:text-[56px] font-black text-white leading-[1.12] tracking-tight font-serif-heading">
                La Noblesse des Épices, <br />
                <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200">
                  L’Âme Gourmande du Terroir
                  <svg 
                    className="absolute -bottom-1.5 left-0 w-full h-2.5 text-amber-400/50" 
                    viewBox="0 0 100 20" 
                    preserveAspectRatio="none"
                  >
                    <path d="M0 15 Q 50 0, 100 15" stroke="currentColor" strokeWidth="4" fill="none" />
                  </svg>
                </span>
              </h1>

              <p className="text-sm sm:text-base text-stone-300 max-w-xl leading-relaxed font-medium">
                Piments séchés au soleil, véritable soumbala de néré noble et assemblages culinaires artisanaux. Redécouvrez la pureté gustative sans cube chimique ni conservateur.
              </p>
            </div>

            {/* Direct CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                id="btn-hero-explore"
                onClick={() => setActiveTab('produits')}
                className="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-stone-950 rounded-2xl font-black shadow-xl shadow-amber-500/20 flex items-center gap-2.5 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer text-sm"
              >
                <div className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out" />
                <span>Découvrir le Catalogue</span>
                <ArrowRight className="w-4 h-4 text-stone-950 group-hover:translate-x-1 transition-transform stroke-[2.5]" />
              </button>

              <button
                id="btn-hero-whatsapp"
                onClick={() => openOrderWhatsApp()}
                className="px-6 py-4 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-amber-400/60 text-white rounded-2xl font-bold shadow-sm transition-all duration-300 flex items-center gap-2 cursor-pointer text-sm backdrop-blur-md"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>Commande Express WhatsApp</span>
              </button>
            </div>

            {/* Quick Interactive Interactive Switcher Tabs on the Left */}
            <div className="space-y-2 pt-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-300/80">
                Nos 4 Créations Phares en Vitrine :
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {activeHeroList.map((prod, idx) => (
                  <button
                    key={prod.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`p-2 rounded-xl text-left transition-all cursor-pointer border ${
                      currentIndex === idx
                        ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                        : 'bg-white/5 border-white/10 text-stone-300 hover:bg-white/10'
                    }`}
                  >
                    <p className="text-[11px] font-bold truncate">{prod.name}</p>
                    <p className="text-[10px] text-amber-400 font-extrabold">{prod.price || '1 500 F'}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Customer Trust & Ratings Bar */}
            <div className="pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-3 text-stone-300">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2 overflow-hidden">
                  <div className="inline-block h-8 w-8 rounded-full ring-2 ring-stone-900 bg-amber-600 text-white text-[10px] font-bold flex items-center justify-center">
                    AD
                  </div>
                  <div className="inline-block h-8 w-8 rounded-full ring-2 ring-stone-900 bg-emerald-700 text-white text-[10px] font-bold flex items-center justify-center">
                    MT
                  </div>
                  <div className="inline-block h-8 w-8 rounded-full ring-2 ring-stone-900 bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
                    FS
                  </div>
                  <div className="inline-block h-8 w-8 rounded-full ring-2 ring-stone-900 bg-amber-400 text-stone-950 text-[10px] font-black flex items-center justify-center">
                    +5k
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                    <span className="text-xs font-black text-white ml-1">4.9 / 5</span>
                  </div>
                  <p className="text-[11px] text-stone-400 font-medium">+5,400 ménages & chefs conquis</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold text-stone-300">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-amber-400" />
                  <span>Livraison Rapide</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Qualité Certifiée</span>
                </div>
              </div>
            </div>

          </motion.div>

          {/* Right Column: 3D Interactive Tilt Showcase Card */}
          <motion.div 
            style={{ 
              x: cardParallaxX, 
              y: scrollCardY,
              rotateX: cardRotateX,
              rotateY: cardRotateY,
              transformStyle: "preserve-3d"
            }}
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 1, 0.5, 1] }}
            className="w-full lg:w-[460px] flex flex-col gap-4 shrink-0 will-change-transform"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Interactive Showcase Box */}
            <div 
              onClick={() => currentProduct && openProductDetail(currentProduct.id)}
              className="relative min-h-[490px] bg-gradient-to-b from-[#14331E] to-[#0A1F12] rounded-[36px] p-6 sm:p-7 overflow-hidden group shadow-2xl shadow-black/50 cursor-pointer border border-amber-500/30 transition-all duration-300 hover:border-amber-400"
              style={{ transform: "translateZ(20px)" }}
            >
              {/* Background ambient lighting */}
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

              {/* Floating Top Ribbon */}
              <div 
                className="absolute top-4 right-6 bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 text-[11px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-lg z-20 flex items-center gap-1.5"
                style={{ transform: "translateZ(40px)" }}
              >
                <Award className="w-3.5 h-3.5 text-stone-950" />
                <span>Sélection Privilège</span>
              </div>

              <div className="relative z-10 h-full flex flex-col justify-between space-y-4">
                
                {/* Product Header */}
                <div className="space-y-1.5 pt-1">
                  <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[11px] text-amber-300 font-bold uppercase tracking-wider border border-white/10">
                    {currentProduct?.category === 'piments' ? '🌶️ Piment Noble' : currentProduct?.category === 'epices' ? '🌿 Épice Pure' : '✨ Soumbala & Terroir'}
                  </span>

                  <AnimatePresence mode="wait">
                    <motion.h3 
                      key={currentProduct?.id + '_title'}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="text-white text-2xl sm:text-3xl font-black leading-tight tracking-tight pt-1 font-serif-heading"
                    >
                      {currentProduct ? currentProduct.name : 'Soumbala Pur Grand Cru'}
                    </motion.h3>
                  </AnimatePresence>
                </div>

                {/* Rotating Product Visual Box */}
                <div className="flex items-center justify-center py-2 relative">
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={currentProduct?.id + '_img'}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.35 }}
                      className="w-56 h-56 sm:w-60 sm:h-60 bg-stone-900/90 rounded-3xl shadow-2xl border-2 border-amber-400/30 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-500 relative"
                      style={{ transform: "translateZ(35px)" }}
                    >
                      {currentProduct?.mainImage ? (
                        <img
                          src={currentProduct.mainImage}
                          alt={currentProduct.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="text-6xl select-none">🌿</div>
                      )}

                      {/* Flavor & Heat Badge */}
                      <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md text-amber-300 text-[10px] font-extrabold px-3 py-1 rounded-xl flex items-center gap-1.5 border border-amber-400/30">
                        <Flame className="w-3.5 h-3.5 text-amber-400" />
                        <span>{heatInfo.label}</span>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Carousel navigation arrows */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex(prev => (prev - 1 + activeHeroList.length) % activeHeroList.length);
                    }}
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md transition cursor-pointer border border-white/20"
                    aria-label="Produit précédent"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex(prev => (prev + 1) % activeHeroList.length);
                    }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md transition cursor-pointer border border-white/20"
                    aria-label="Produit suivant"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Dots indicator */}
                <div className="flex items-center justify-center gap-2 py-1">
                  {activeHeroList.map((p, idx) => (
                    <button
                      key={p.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentIndex(idx);
                      }}
                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        currentIndex === idx ? 'w-8 bg-amber-400' : 'w-2 bg-white/30 hover:bg-white/60'
                      }`}
                      aria-label={`Voir ${p.name}`}
                    />
                  ))}
                </div>

                {/* Format & Price bottom bar */}
                <div className="pt-3 border-t border-white/15 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-stone-400 uppercase tracking-wider font-semibold">Conditionnement</p>
                    <p className="font-bold text-xs sm:text-sm text-white truncate max-w-[180px]">
                      {currentProduct ? currentProduct.format : 'Pot hermétique & sachet'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-amber-300/80 uppercase tracking-wider font-semibold">Prix Direct Atelier</p>
                    <p className="text-2xl sm:text-3xl font-black text-amber-300 tracking-tight">
                      {currentProduct?.price || '1 500 FCFA'}
                    </p>
                  </div>
                </div>

                {/* Action quick buttons on the card */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleQuickAdd}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-black text-xs shadow-lg transition-all duration-300 cursor-pointer ${
                      justAdded 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950'
                    }`}
                  >
                    {justAdded ? (
                      <>
                        <Check className="w-4 h-4 text-white" />
                        <span>Ajouté au panier !</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4 text-stone-950" />
                        <span>Ajouter au panier</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (currentProduct) openProductDetail(currentProduct.id);
                    }}
                    className="px-4 py-3 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold backdrop-blur-md transition cursor-pointer border border-white/15"
                  >
                    Détails
                  </button>
                </div>

              </div>
            </div>

            {/* Bottom 2 Mini Feature Cards */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3.5 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-400/30">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-white">Arrivages Frais</h4>
                  <p className="text-[10px] text-stone-300">Séchage récent en stock</p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3.5 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-400/30">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-white">Livraison Directe</h4>
                  <p className="text-[10px] text-stone-300">À domicile ou atelier</p>
                </div>
              </div>
            </div>

          </motion.div>

        </div>
      </div>

      {/* Infinite Seamless Marquee Ticker */}
      <div className="bg-[#051108] text-white py-3 border-y border-amber-500/20 overflow-hidden select-none relative z-20">
        <div className="animate-marquee flex items-center gap-8 whitespace-nowrap text-xs font-bold tracking-wide">
          <span className="flex items-center gap-2 text-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>100% Naturel • Zéro Conservateur Chimique</span>
          </span>
          <span className="text-emerald-700">•</span>
          <span className="flex items-center gap-2 text-white">
            <Flame className="w-3.5 h-3.5 text-red-400" />
            <span>Piments d'Exception Séchés au Soleil</span>
          </span>
          <span className="text-emerald-700">•</span>
          <span className="flex items-center gap-2 text-amber-300">
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
            <span>Soumbala Pur de Néré Artisanal Grand Cru</span>
          </span>
          <span className="text-emerald-700">•</span>
          <span className="flex items-center gap-2 text-white">
            <Truck className="w-3.5 h-3.5 text-amber-400" />
            <span>Livraison Rapide Bamako & Abidjan</span>
          </span>
          <span className="text-emerald-700">•</span>
          <span className="flex items-center gap-2 text-amber-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Paiement Sécurisé Wave & Orange Money</span>
          </span>
          <span className="text-emerald-700">•</span>
          
          {/* Duplicate set for seamless looping */}
          <span className="flex items-center gap-2 text-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>100% Naturel • Zéro Conservateur Chimique</span>
          </span>
          <span className="text-emerald-700">•</span>
          <span className="flex items-center gap-2 text-white">
            <Flame className="w-3.5 h-3.5 text-red-400" />
            <span>Piments d'Exception Séchés au Soleil</span>
          </span>
          <span className="text-emerald-700">•</span>
          <span className="flex items-center gap-2 text-amber-300">
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
            <span>Soumbala Pur de Néré Artisanal Grand Cru</span>
          </span>
          <span className="text-emerald-700">•</span>
          <span className="flex items-center gap-2 text-white">
            <Truck className="w-3.5 h-3.5 text-amber-400" />
            <span>Livraison Rapide Bamako & Abidjan</span>
          </span>
        </div>
      </div>
    </div>
  );
};
