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
  Heart,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Award
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

  // Find featured products for the interactive hero carousel
  const heroProducts = products.filter(p => p.isFeatured || p.isNew).slice(0, 4);
  const activeHeroList = heroProducts.length > 0 ? heroProducts : products.slice(0, 4);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [justAdded, setJustAdded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Auto cycle every 6.5 seconds, pauses if user hovers
  useEffect(() => {
    if (isHovered || activeHeroList.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % activeHeroList.length);
    }, 6500);
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

  // --- PARALLAX ENGINE ---
  // 1. Scroll-driven parallax
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const scrollTextY = useTransform(scrollYProgress, [0, 1], [0, 50]);
  const scrollCardY = useTransform(scrollYProgress, [0, 1], [0, 30]);
  const scrollBgY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const scrollOpacity = useTransform(scrollYProgress, [0, 0.9, 1], [1, 0.92, 0.8]);

  // 2. Mouse-movement cursor parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs with damping for natural organic fluidity
  const springConfig = { damping: 26, stiffness: 130, mass: 0.8 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // Layer 0: Deep background glows (counter-shift)
  const bgOrb1X = useTransform(smoothMouseX, [-0.5, 0.5], [-35, 35]);
  const bgOrb1Y = useTransform(smoothMouseY, [-0.5, 0.5], [-30, 30]);

  const bgOrb2X = useTransform(smoothMouseX, [-0.5, 0.5], [30, -30]);
  const bgOrb2Y = useTransform(smoothMouseY, [-0.5, 0.5], [25, -25]);

  // Layer 1: Subtle floating badge particles
  const floatBadge1X = useTransform(smoothMouseX, [-0.5, 0.5], [-24, 24]);
  const floatBadge1Y = useTransform(smoothMouseY, [-0.5, 0.5], [-20, 20]);

  const floatBadge2X = useTransform(smoothMouseX, [-0.5, 0.5], [20, -20]);
  const floatBadge2Y = useTransform(smoothMouseY, [-0.5, 0.5], [18, -18]);

  // Layer 2: Left Content text
  const textParallaxX = useTransform(smoothMouseX, [-0.5, 0.5], [-10, 10]);
  const textParallaxY = useTransform(smoothMouseY, [-0.5, 0.5], [-8, 8]);

  // Layer 3: 3D Tilt Card (Right showcase)
  const cardRotateX = useTransform(smoothMouseY, [-0.5, 0.5], [7, -7]);
  const cardRotateY = useTransform(smoothMouseX, [-0.5, 0.5], [-9, 9]);
  const cardParallaxX = useTransform(smoothMouseX, [-0.5, 0.5], [14, -14]);
  const cardParallaxY = useTransform(smoothMouseY, [-0.5, 0.5], [12, -12]);

  // Layer 4: Floating product image inside the showcase card (extra depth)
  const imageFloatX = useTransform(smoothMouseX, [-0.5, 0.5], [14, -14]);
  const imageFloatY = useTransform(smoothMouseY, [-0.5, 0.5], [10, -10]);

  // Layer 5: Bottom mini feature cards
  const miniCardsX = useTransform(smoothMouseX, [-0.5, 0.5], [-8, 8]);
  const miniCardsY = useTransform(smoothMouseY, [-0.5, 0.5], [-6, 6]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    // Normalize coordinates between -0.5 and +0.5
    const normalizedX = (e.clientX - rect.left) / rect.width - 0.5;
    const normalizedY = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(normalizedX);
    mouseY.set(normalizedY);
  };

  const handleMouseLeave = () => {
    // Reset smoothly to 0
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  return (
    <div 
      ref={heroRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative bg-gradient-to-b from-[#FAF7F0] via-[#F5F2EB] to-[#FAF9F6] border-b border-stone-200/80 overflow-hidden select-none perspective-[1200px]"
    >
      {/* --- PARALLAX LAYER 0: Ambient Background Glowing Orbs --- */}
      <motion.div 
        style={{ x: bgOrb1X, y: bgOrb1Y }}
        className="absolute top-0 right-0 -mr-28 -mt-28 w-96 h-96 bg-[#2D5A27]/12 rounded-full blur-3xl pointer-events-none transition-transform will-change-transform" 
      />
      <motion.div 
        style={{ x: bgOrb2X, y: bgOrb2Y }}
        className="absolute bottom-10 left-10 -ml-24 w-80 h-80 bg-amber-500/12 rounded-full blur-3xl pointer-events-none transition-transform will-change-transform" 
      />
      <motion.div 
        style={{ y: scrollBgY }}
        className="absolute top-1/2 left-1/3 w-72 h-72 bg-red-500/5 rounded-full blur-2xl pointer-events-none" 
      />

      {/* --- PARALLAX LAYER 1: Subtle Floating Depth Particles / Chips --- */}
      <motion.div 
        style={{ x: floatBadge1X, y: floatBadge1Y }}
        className="hidden xl:flex items-center gap-2 absolute top-14 left-10 z-10 bg-white/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-stone-200/80 shadow-sm text-stone-700 text-xs font-bold pointer-events-none"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
        <Leaf className="w-3.5 h-3.5 text-emerald-700" />
        <span>Récoltes Fraîches du Terroir</span>
      </motion.div>

      <motion.div 
        style={{ x: floatBadge2X, y: floatBadge2Y }}
        className="hidden xl:flex items-center gap-1.5 absolute bottom-24 left-1/4 z-10 bg-amber-50/90 backdrop-blur-md px-3 py-1 rounded-full border border-amber-200/80 shadow-xs text-amber-900 text-[11px] font-extrabold pointer-events-none"
      >
        <Flame className="w-3.5 h-3.5 text-amber-600" />
        <span>Capsaïcine & Arômes Naturels Préservés</span>
      </motion.div>

      {/* Main Hero Content Container with Scroll-driven Parallax */}
      <motion.div 
        style={{ opacity: scrollOpacity }}
        className="relative max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 pt-10 pb-12 lg:pt-16 lg:pb-20 z-10"
      >
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-14">
          
          {/* --- PARALLAX LAYER 2: Left Column (Text & Calls to Action) --- */}
          <motion.div 
            style={{ x: textParallaxX, y: scrollTextY }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.25, 1, 0.5, 1] }}
            className="flex-1 flex flex-col justify-center space-y-7 will-change-transform"
          >
            {/* Top Interactive Badges */}
            <div className="flex flex-wrap items-center gap-2.5">
              <motion.span 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2D5A27] text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-xs"
              >
                <Leaf className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
                <span>Terroir & Transformation Noble</span>
              </motion.span>

              <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100/80 border border-amber-200/70 text-amber-900 text-xs font-semibold rounded-full shadow-2xs">
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>100% Naturel • Zéro additif chimique</span>
              </span>
            </div>

            {/* Hero Heading with Warm Gradient Accent */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-black text-[#142618] leading-[1.12] tracking-tight">
                L’excellence de nos terres, <br />
                <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#C53030] via-[#E56B2D] to-[#D48B28]">
                  sublimée en épices d’or
                  <svg 
                    className="absolute -bottom-2 left-0 w-full h-2.5 text-[#E56B2D]/40" 
                    viewBox="0 0 100 20" 
                    preserveAspectRatio="none"
                  >
                    <path d="M0 15 Q 50 0, 100 15" stroke="currentColor" strokeWidth="4" fill="none" />
                  </svg>
                </span>.
              </h1>

              <p className="text-base sm:text-lg text-stone-600 max-w-xl leading-relaxed pt-2">
                {settings.shortDescription || "Sélection rigoureuse, séchage sain et mouture pure de piments rouges, soumbala traditionnel et épices d'Afrique de l'Ouest pour réveiller vos créations culinaires."}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <button
                id="btn-hero-explore"
                onClick={() => setActiveTab('produits')}
                className="group relative overflow-hidden px-8 py-4 bg-[#2D5A27] hover:bg-[#1f3f1b] text-white rounded-2xl font-extrabold shadow-lg shadow-emerald-950/20 flex items-center gap-3 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer text-sm sm:text-base"
              >
                {/* Shimmer sweep effect */}
                <div className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out" />
                <span>Découvrir le Catalogue</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                id="btn-hero-whatsapp"
                onClick={() => openOrderWhatsApp()}
                className="px-6 py-4 bg-white border border-stone-300 hover:border-emerald-600 text-stone-800 hover:text-emerald-800 rounded-2xl font-bold shadow-xs hover:shadow-md transition-all duration-300 flex items-center gap-2.5 cursor-pointer text-sm sm:text-base"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Commander sur WhatsApp</span>
              </button>
            </div>

            {/* Customer Trust & Ratings Bar */}
            <div className="pt-5 border-t border-stone-200/90 flex flex-wrap items-center justify-between gap-4 text-stone-700">
              {/* Star Rating & Avatar Stack */}
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2 overflow-hidden">
                  <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-amber-600 text-white text-[11px] font-bold flex items-center justify-center">
                    AD
                  </div>
                  <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-emerald-700 text-white text-[11px] font-bold flex items-center justify-center">
                    MT
                  </div>
                  <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-red-600 text-white text-[11px] font-bold flex items-center justify-center">
                    FS
                  </div>
                  <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-[#142618] text-amber-300 text-[10px] font-bold flex items-center justify-center">
                    +5k
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                    <span className="text-xs font-bold text-stone-900 ml-1">4.9/5</span>
                  </div>
                  <p className="text-[11px] text-stone-500 font-medium">Recommandé par les familles & restaurateurs</p>
                </div>
              </div>

              {/* Badges Highlight */}
              <div className="flex items-center gap-4 text-xs font-semibold text-stone-600">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#2D5A27]" />
                  <span>Livraison Rapide</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#2D5A27]" />
                  <span>Séchage Hygiénique</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* --- PARALLAX LAYER 3: 3D Tilt Card (Right Showcase) --- */}
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
            className="w-full lg:w-[450px] flex flex-col gap-4 shrink-0 will-change-transform"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Top Interactive Product Showcase Card */}
            <div 
              onClick={() => currentProduct && openProductDetail(currentProduct.id)}
              className="relative min-h-[460px] bg-gradient-to-b from-[#1E3B21] to-[#122416] rounded-[32px] p-6 sm:p-7 overflow-hidden group shadow-2xl shadow-emerald-950/25 cursor-pointer border border-emerald-800/40 transition-all duration-300 hover:border-emerald-500/50"
              style={{ transform: "translateZ(20px)" }}
            >
              {/* Background ambient decorative light circle */}
              <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute bottom-0 left-0 w-56 h-56 bg-amber-500/10 rounded-full blur-2xl pointer-events-none -ml-16 -mb-16" />

              {/* Floating Spice Badge with Depth */}
              <div 
                className="absolute -top-1 right-8 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-b-xl shadow-md z-20 flex items-center gap-1"
                style={{ transform: "translateZ(40px)" }}
              >
                <Flame className="w-3 h-3 text-red-900 fill-current" />
                <span>Coup de Cœur Terroir</span>
              </div>

              <div className="relative z-10 h-full flex flex-col justify-between space-y-4">
                
                {/* Product Header & Category */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-[11px] text-emerald-200 font-bold tracking-wide uppercase">
                      {currentProduct?.category === 'piments' ? '🌶️ Piment Noble' : currentProduct?.category === 'epices' ? '🌿 Épice Pure' : '✨ Spécialité Artisanal'}
                    </span>
                    <span className="text-[11px] text-emerald-300/80 font-medium">
                      {currentIndex + 1} sur {activeHeroList.length}
                    </span>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.h3 
                      key={currentProduct?.id + '_title'}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="text-white text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight pt-1"
                    >
                      {currentProduct ? currentProduct.name : 'Piment Rouge Pur'}
                    </motion.h3>
                  </AnimatePresence>
                </div>

                {/* Rotating Product Visual Box with Floating Image Parallax */}
                <div className="flex items-center justify-center py-2 relative">
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={currentProduct?.id + '_img'}
                      initial={{ opacity: 0, scale: 0.88, rotate: -4 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.88, rotate: 4 }}
                      transition={{ duration: 0.4 }}
                      style={{ x: imageFloatX, y: imageFloatY, transform: "translateZ(35px)" }}
                      className="w-52 h-52 sm:w-56 sm:h-56 bg-stone-100 rounded-3xl shadow-2xl border-4 border-white/25 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-500 relative will-change-transform"
                    >
                      {currentProduct?.mainImage ? (
                        <img
                          src={currentProduct.mainImage}
                          alt={currentProduct.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="text-6xl select-none">🌶️</div>
                      )}

                      {/* Hotness / Natural sticker */}
                      <div className="absolute bottom-2.5 left-2.5 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 border border-white/10">
                        <Award className="w-3 h-3 text-amber-400" />
                        <span>Qualité Supérieure</span>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Carousel navigation arrows */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex(prev => (prev - 1 + activeHeroList.length) % activeHeroList.length);
                    }}
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition cursor-pointer"
                    aria-label="Produit précédent"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex(prev => (prev + 1) % activeHeroList.length);
                    }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition cursor-pointer"
                    aria-label="Produit suivant"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Product Dots / Mini Switcher */}
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
                  <div className="text-white">
                    <p className="text-[11px] text-emerald-200/80 uppercase tracking-wider font-semibold">Format & Conditionnement</p>
                    <p className="font-bold text-xs sm:text-sm text-white truncate max-w-[170px]">
                      {currentProduct ? currentProduct.format : 'Flacon saupoudreur & sachet'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-emerald-200/80 uppercase tracking-wider font-semibold">Prix Direct</p>
                    <p className="text-xl sm:text-2xl font-black text-amber-300 tracking-tight">
                      {currentProduct?.price || '1 500 FCFA'}
                    </p>
                  </div>
                </div>

                {/* Action quick buttons on the card */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleQuickAdd}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs shadow-md transition-all duration-300 cursor-pointer ${
                      justAdded 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-white hover:bg-amber-400 text-[#142618] hover:shadow-lg'
                    }`}
                  >
                    {justAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>Ajouté au panier !</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-3.5 h-3.5 text-[#142618]" />
                        <span>Ajouter au panier</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (currentProduct) openProductDetail(currentProduct.id);
                    }}
                    className="px-3.5 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-semibold backdrop-blur-xs transition cursor-pointer"
                  >
                    Voir fiche
                  </button>
                </div>

              </div>
            </div>

            {/* --- PARALLAX LAYER 4: Bottom 2 Mini Feature Cards --- */}
            <motion.div 
              style={{ x: miniCardsX, y: miniCardsY }}
              className="grid grid-cols-2 gap-3.5 will-change-transform"
            >
              <div className="bg-white border border-stone-200 rounded-2xl p-3.5 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-stone-900">Arrivages Frais</h4>
                  <p className="text-[10px] text-stone-500">Séchage récent en stock</p>
                </div>
              </div>

              <div className="bg-white border border-stone-200 rounded-2xl p-3.5 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#2D5A27] flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-stone-900">Livraison Directe</h4>
                  <p className="text-[10px] text-stone-500">À domicile ou atelier</p>
                </div>
              </div>
            </motion.div>

          </motion.div>

        </div>
      </motion.div>

      {/* Infinite Seamless Marquee Ticker */}
      <div className="bg-[#142618] text-white py-3 border-y border-emerald-900/50 overflow-hidden select-none relative z-20">
        <div className="animate-marquee flex items-center gap-10 whitespace-nowrap text-xs sm:text-sm font-semibold tracking-wide">
          <span className="flex items-center gap-2 text-emerald-300">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>100% Naturel • Sans Colorant ni Additif de Synthèse</span>
          </span>
          <span className="text-stone-500">•</span>
          <span className="flex items-center gap-2 text-amber-200">
            <Flame className="w-4 h-4 text-red-400" />
            <span>Piments d'Origine Sélectionnés & Séchés avec Rigueur</span>
          </span>
          <span className="text-stone-500">•</span>
          <span className="flex items-center gap-2 text-emerald-300">
            <Leaf className="w-4 h-4 text-emerald-400" />
            <span>Soumbala Pur de Néré Artisanal Grand Arôme</span>
          </span>
          <span className="text-stone-500">•</span>
          <span className="flex items-center gap-2 text-white">
            <Truck className="w-4 h-4 text-amber-400" />
            <span>Expédition Rapide Partout en Zone Urbaine & Intérieur</span>
          </span>
          <span className="text-stone-500">•</span>
          <span className="flex items-center gap-2 text-amber-200">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Formats Détail, Demi-Gros & Sacs Professionnels pour Restaurateurs</span>
          </span>
          <span className="text-stone-500">•</span>
          
          {/* Duplicate set for seamless looping */}
          <span className="flex items-center gap-2 text-emerald-300">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>100% Naturel • Sans Colorant ni Additif de Synthèse</span>
          </span>
          <span className="text-stone-500">•</span>
          <span className="flex items-center gap-2 text-amber-200">
            <Flame className="w-4 h-4 text-red-400" />
            <span>Piments d'Origine Sélectionnés & Séchés avec Rigueur</span>
          </span>
          <span className="text-stone-500">•</span>
          <span className="flex items-center gap-2 text-emerald-300">
            <Leaf className="w-4 h-4 text-emerald-400" />
            <span>Soumbala Pur de Néré Artisanal Grand Arôme</span>
          </span>
          <span className="text-stone-500">•</span>
          <span className="flex items-center gap-2 text-white">
            <Truck className="w-4 h-4 text-amber-400" />
            <span>Expédition Rapide Partout en Zone Urbaine & Intérieur</span>
          </span>
        </div>
      </div>
    </div>
  );
};
