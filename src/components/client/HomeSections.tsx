import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ProductCard } from './ProductCard';
import { CustomerReviewsSection } from './CustomerReviewsSection';
import { DeliveryCalculatorWidget } from './DeliveryCalculatorWidget';
import { FadeInView, FadeInStagger, FadeInItem } from '../common/FadeInView';
import { 
  ArrowRight, 
  Sparkles, 
  Flame, 
  Leaf, 
  ShieldCheck, 
  Play, 
  Calendar, 
  MessageCircle, 
  PhoneCall, 
  Star,
  Award,
  CheckCircle2,
  Utensils,
  ChefHat,
  Heart,
  ChevronDown,
  ShoppingBag,
  Zap,
  HelpCircle,
  Truck,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../../types';

export const HomeSections: React.FC = () => {
  const { 
    products, 
    announcements, 
    settings, 
    setActiveTab, 
    openAnnouncementDetail, 
    openOrderWhatsApp, 
    addToCart,
    openProductDetail 
  } = useApp();

  // Category filter state on homepage
  const [selectedCategory, setSelectedCategory] = useState<string>('tous');

  // Interactive Taste & Hotness Guide level state
  const [activeSpiceLevel, setActiveSpiceLevel] = useState<number>(2);

  // FAQ Accordion open item state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Interactive Process Step state
  const [activeStep, setActiveStep] = useState<number>(0);

  // Pack added toast feedback
  const [addedPack, setAddedPack] = useState<string | null>(null);

  // Filtered products for homepage showcase
  const filteredProducts = products.filter(p => {
    if (selectedCategory === 'tous') return true;
    if (selectedCategory === 'nouveautes') return p.isNew;
    if (selectedCategory === 'phares') return p.isFeatured;
    return p.category === selectedCategory;
  });

  const displayProducts = filteredProducts.slice(0, 8);

  // Recent published announcements
  const recentAnnouncements = announcements
    .filter(a => a.status === 'publie')
    .slice(0, 3);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // 4 Steps of Horon Mousso transformation
  const transformationSteps = [
    {
      title: "1. Récolte & Terroir",
      subtitle: "Partenariats paysans équitables",
      desc: "Piments mûrs, gingembre dense et graines de néré saines récoltés au rythme naturel de nos sols.",
      tag: "Origine Noble",
      image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "2. Tri & Lavage Pur",
      subtitle: "Zéro impureté ni résidu",
      desc: "Bains d'eau claire et tri manuel rigoureux pour retenir uniquement la pulpe et les arômes purs.",
      tag: "Pureté Absolue",
      image: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "3. Séchage Maîtrisé",
      subtitle: "Thermorégulation hygiénique",
      desc: "Séchage doux à l'abri des poussières pour fixer la couleur éclatante, vitamines et capsaïcine.",
      tag: "Séchage Sain",
      image: "https://images.unsplash.com/photo-1526346698789-224822f00545?auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "4. Mouture Fine & Écrin",
      subtitle: "Herméticité sans additif",
      desc: "Broyage à froid évitant tout échauffement puis ensachage protecteur pour des arômes durables.",
      tag: "Fraîcheur Longue",
      image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80"
    }
  ];

  // Hotness levels data
  const spiceLevels = [
    {
      level: 1,
      title: "Doux & Aromatique",
      subtitle: "Sauces douces & famille",
      desc: "Curcuma solaire et gingembre doux. Éveille le plat sans brûler le palais.",
      color: "from-emerald-500 to-green-600",
      flames: 1,
      badge: "Gourmet & Enfant"
    },
    {
      level: 2,
      title: "Chaleur Équilibrée",
      subtitle: "Signature ouest-africaine",
      desc: "Soumbala grand arôme et poivres doux. Une rondeur umami profonde.",
      color: "from-amber-500 to-orange-500",
      flames: 2,
      badge: "Incontournable"
    },
    {
      level: 3,
      title: "Piquant Intense",
      subtitle: "Braises & viandes",
      desc: "Piments entiers séchés au soleil à infuser pour marinades franches.",
      color: "from-orange-600 to-red-600",
      flames: 3,
      badge: "Caractère"
    },
    {
      level: 4,
      title: "Extra Fort Pur",
      subtitle: "Amateurs avertis",
      desc: "Piment rouge pur moulu très fin. Une pointe suffit pour enflammer vos sauces.",
      color: "from-red-600 to-rose-700",
      flames: 4,
      badge: "Force Max"
    }
  ];

  // Recipe inspirations
  const recipes = [
    {
      title: "Mafé Royal au Soumbala",
      time: "45 min",
      type: "Mijoté",
      desc: "Une cuillère de Soumbala de Néré et une pointe de piment pour une rondeur onctueuse inimitable.",
      spiceNeeded: "Soumbala Pur + Piment",
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"
    },
    {
      title: "Marinade Dorée pour Grillades",
      time: "20 min",
      type: "Braise & Suya",
      desc: "Gingembre pur, ail et curcuma émulsionnés pour une croûte dorée croustillante.",
      spiceNeeded: "Gingembre + Curcuma",
      image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80"
    },
    {
      title: "Huile Pimentée Maison",
      time: "10 min",
      type: "Condiment",
      desc: "Huile tiède infusée sur notre piment rouge avec sel marin. Simple, puissant et parfumé.",
      spiceNeeded: "Piment Rouge Extra Fort",
      image: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=600&q=80"
    }
  ];

  // Quick packs to order
  const quickPacks = [
    {
      id: "pack_decouverte",
      name: "Pack Découverte Terroir (Trio)",
      price: "5 500 FCFA",
      description: "1 Piment Rouge Fort 100g + 1 Soumbala Grand Cru 250g + 1 Gingembre Pur 150g.",
      badge: "Idéal pour débuter",
      highlight: false
    },
    {
      id: "pack_famille",
      name: "Pack Famille Gourmet (Gros Volumes)",
      price: "11 500 FCFA",
      description: "Sachets économiques 500g de Piment moulu + Soumbala + Piments entiers séchés + Curcuma.",
      badge: "Meilleure valeur",
      highlight: true
    },
    {
      id: "pack_pro",
      name: "Pack Traiteur & Restaurant (Sacs Pro)",
      price: "Sur Devis Spécial",
      description: "Formats 5kg, 10kg et 25kg pour hôtels, cantines scolaires et restaurants de spécialités.",
      badge: "Tarifs dégressifs",
      highlight: false
    }
  ];

  const handleOrderPackWhatsApp = (packName: string, packPrice: string) => {
    const text = encodeURIComponent(`Bonjour Horon Mousso ! Je souhaite commander le « ${packName} » (${packPrice}). Pouvez-vous m'indiquer la disponibilité et les modalités de livraison svp ?`);
    const cleanPhone = settings.whatsapp.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  // FAQ items
  const faqs = [
    {
      q: "Comment commander et payer ?",
      a: "Validez votre panier en direct sur WhatsApp ou par téléphone. Nous acceptons Wave, Orange Money, Moov Money et le paiement en espèces à la livraison."
    },
    {
      q: "Vos produits sont-ils 100% naturels ?",
      a: "Oui, sans compromis : zéro colorant de synthèse, zéro conservateur chimique, zéro farine de charge ni glutamate. Pureté garantie."
    },
    {
      q: "Quels sont les délais de livraison ?",
      a: "Sous 24h à Bamako et Abidjan. Expédition hebdomadaire sécurisée pour les villes de l'intérieur et la sous-région."
    },
    {
      q: "Avez-vous des formats pour restaurants ?",
      a: "Oui. Nous fournissons des sacs professionnels de 5kg, 10kg et 25kg avec tarifs dégressifs pour chefs et traiteurs."
    }
  ];

  return (
    <div className="space-y-20 py-8 px-4 sm:px-8 lg:px-10 max-w-7xl mx-auto">
      
      {/* 1. SECTION : NOS PRODUITS PHARES AVEC FILTRES INTERACTIFS */}
      <section className="space-y-6">
        <FadeInView direction="up" distance={20} duration={0.6}>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-[#2D5A27] text-xs font-bold rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Nos Créations</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#142618] tracking-tight">
                Épices & Terroir Pur
              </h2>
              <p className="text-stone-500 text-xs sm:text-sm">
                Sélection noble, séchée et moulue dans le respect des arômes.
              </p>
            </div>

            {/* View all button */}
            <button
              onClick={() => setActiveTab('produits')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-stone-200 hover:border-emerald-600 bg-white hover:bg-stone-50 text-stone-700 hover:text-emerald-800 font-semibold text-xs sm:text-sm transition group cursor-pointer shadow-2xs self-start sm:self-auto"
            >
              <span>Tout voir ({products.length})</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
            </button>
          </div>

          {/* Interactive Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-3">
            {[
              { id: 'tous', label: 'Tous' },
              { id: 'phares', label: 'Phares' },
              { id: 'piments', label: 'Piments' },
              { id: 'epices', label: 'Épices' },
              { id: 'produits_transformes', label: 'Soumbala' },
              { id: 'nouveautes', label: 'Nouveaux' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  selectedCategory === tab.id
                    ? 'bg-[#1E3B24] text-white shadow-xs font-bold'
                    : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-400 hover:bg-stone-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </FadeInView>

        {/* Product Cards Grid with animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {displayProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* 2. SECTION INTERACTIVE : GUIDE DES INTENSITÉS & NIVEAUX DE PIQUANT */}
      <FadeInView direction="up" distance={20} duration={0.6}>
        <section className="bg-gradient-to-br from-[#182F1E] via-[#122416] to-[#0D1A10] text-white rounded-3xl p-6 sm:p-9 shadow-xl border border-emerald-900/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-1.5 max-w-lg">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold rounded-full">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Guide des Saveurs</span>
                </span>
                <h3 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                  Échelle de Chaleur Culinaire
                </h3>
                <p className="text-stone-300 text-xs sm:text-sm">
                  Choisissez votre intensité préférée pour doser vos préparations.
                </p>
              </div>

              <div className="flex items-center gap-1 bg-white/10 p-1 rounded-2xl border border-white/10 backdrop-blur-xs self-start md:self-auto">
                {spiceLevels.map(item => (
                  <button
                    key={item.level}
                    onClick={() => setActiveSpiceLevel(item.level)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      activeSpiceLevel === item.level
                        ? 'bg-amber-400 text-[#122416] shadow-sm font-extrabold'
                        : 'text-stone-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span>Niv. {item.level}</span>
                    <Flame className="w-3 h-3" />
                  </button>
                ))}
              </div>
            </div>

            {/* Active Level Detail Card */}
            {(() => {
              const current = spiceLevels.find(s => s.level === activeSpiceLevel) || spiceLevels[1];
              return (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-7 backdrop-blur-md">
                  <div className="lg:col-span-8 space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center gap-0.5 text-red-400">
                        {[...Array(current.flames)].map((_, i) => (
                          <Flame key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                      <span className="text-[11px] font-bold bg-white/15 px-2.5 py-0.5 rounded-full text-amber-200">
                        {current.badge}
                      </span>
                    </div>

                    <h4 className="text-lg sm:text-xl font-bold text-white">
                      {current.title} — <span className="text-amber-300 font-normal">{current.subtitle}</span>
                    </h4>

                    <p className="text-stone-300 text-xs sm:text-sm leading-relaxed max-w-xl">
                      {current.desc}
                    </p>

                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => setActiveTab('produits')}
                        className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-[#122416] font-bold text-xs sm:text-sm py-2 px-4 rounded-xl transition cursor-pointer shadow-xs"
                      >
                        <span>Épices niveau {current.level}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => openOrderWhatsApp()}
                        className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm py-2 px-3.5 rounded-xl transition cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Conseil WhatsApp</span>
                      </button>
                    </div>
                  </div>

                  {/* Right mini graphic */}
                  <div className="lg:col-span-4 flex flex-col items-center justify-center p-5 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl border border-white/10 text-center">
                    <div className="text-3xl mb-1.5">
                      {current.level === 1 ? '🌿' : current.level === 2 ? '🌰' : current.level === 3 ? '🌶️' : '🔥'}
                    </div>
                    <div className="font-bold text-xs text-white">{current.title}</div>
                    <div className="text-[11px] text-stone-300 mt-0.5">Dosage : 1/2 à 1 c. à café par plat</div>
                  </div>
                </div>
              );
            })()}
          </div>
        </section>
      </FadeInView>

      {/* 3. SECTION ARTISANAT & SAVOIR-FAIRE : DE LA TERRE AU SACHET */}
      <FadeInView direction="up" distance={20} duration={0.6}>
        <section className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-emerald-50 text-[#2D5A27] text-xs font-bold rounded-full">
              <Leaf className="w-3.5 h-3.5" />
              <span>Savoir-Faire Artisanal</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#142618] tracking-tight">
              De la Terre au Sachet
            </h2>
            <p className="text-stone-500 text-xs sm:text-sm">
              Quatre étapes rigoureuses garantissant fraîcheur et pureté.
            </p>
          </div>

          {/* Interactive Stepper Navigation */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {transformationSteps.map((step, idx) => (
              <button
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  activeStep === idx 
                    ? 'bg-[#1E3B24] text-white border-[#1E3B24] shadow-md shadow-emerald-950/15 scale-[1.01]' 
                    : 'bg-white border-stone-200 text-stone-700 hover:border-stone-400 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                    activeStep === idx ? 'bg-white/20 text-emerald-200' : 'bg-stone-100 text-stone-600'
                  }`}>
                    0{idx + 1}
                  </span>
                  {activeStep === idx && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />}
                </div>
                <div className="font-bold text-xs sm:text-sm truncate">{step.title.split('. ')[1] || step.title}</div>
                <div className={`text-[11px] mt-0.5 ${activeStep === idx ? 'text-emerald-200' : 'text-stone-400'}`}>
                  {step.tag}
                </div>
              </button>
            ))}
          </div>

          {/* Detailed Active Step Showcase */}
          {(() => {
            const currentStepData = transformationSteps[activeStep];
            return (
              <div className="bg-white rounded-3xl border border-stone-200/90 shadow-2xs p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-7 space-y-3">
                  <span className="inline-block px-2.5 py-0.5 bg-emerald-50 text-[#2D5A27] text-xs font-bold rounded-md">
                    {currentStepData.tag}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-[#142618]">
                    {currentStepData.title}
                  </h3>
                  <div className="text-xs sm:text-sm font-semibold text-[#2D5A27]">
                    {currentStepData.subtitle}
                  </div>
                  <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                    {currentStepData.desc}
                  </p>

                  <div className="pt-2 flex items-center gap-4 text-xs font-semibold text-stone-600">
                    <span className="flex items-center gap-1.5 text-[#2D5A27]">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      100% Hygiénique
                    </span>
                    <span className="flex items-center gap-1.5 text-[#2D5A27]">
                      <Award className="w-3.5 h-3.5 text-emerald-600" />
                      Qualité Contrôlée
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <div className="aspect-4/3 rounded-2xl overflow-hidden border border-stone-200 shadow-xs">
                    <img
                      src={currentStepData.image}
                      alt={currentStepData.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              </div>
            );
          })()}
        </section>
      </FadeInView>

      {/* 4. SECTION INSPIRATIONS CULINAIRES & IDÉES RECETTES */}
      <FadeInView direction="up" distance={20} duration={0.6}>
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1.5 max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-amber-50 text-amber-900 text-xs font-bold rounded-full">
                <ChefHat className="w-3.5 h-3.5 text-amber-700" />
                <span>Inspirations Culinaires</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#142618] tracking-tight">
                Idées & Accords Saveurs
              </h2>
              <p className="text-stone-500 text-xs sm:text-sm">
                Des accords simples pour sublimer vos tables quotidiennes.
              </p>
            </div>

            <button
              onClick={() => setActiveTab('a_propos')}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#2D5A27] hover:underline"
            >
              <span>Notre histoire</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {recipes.map((rec, i) => (
              <div 
                key={i} 
                className="bg-white rounded-2xl border border-stone-200 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col group hover:border-[#2D5A27]/40"
              >
                <div className="relative aspect-16/10 overflow-hidden bg-stone-100">
                  <img
                    src={rec.image}
                    alt={rec.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-[#142618]/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                    {rec.type}
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 bg-white/90 text-stone-900 text-[10px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-xs">
                    ⏱️ {rec.time}
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-sm sm:text-base text-[#142618] group-hover:text-[#2D5A27] transition">
                      {rec.title}
                    </h3>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {rec.desc}
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-medium text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/50">
                      {rec.spiceNeeded}
                    </span>
                    <button
                      onClick={() => setActiveTab('produits')}
                      className="text-xs font-bold text-[#2D5A27] hover:text-[#142618] inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Produit</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </FadeInView>

      {/* 5. SECTION PACKS COMMANDE RAPIDE EN 1 CLIC */}
      <FadeInView direction="up" distance={20} duration={0.6}>
        <section className="bg-stone-50 border border-stone-200/80 rounded-3xl p-6 sm:p-9 space-y-6">
          <div className="text-center max-w-lg mx-auto space-y-1.5">
            <span className="inline-flex items-center gap-1 px-3 py-0.5 bg-amber-500/20 text-amber-900 text-xs font-bold rounded-full">
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>Commande Express WhatsApp</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#142618] tracking-tight">
              Packs Dégustation
            </h2>
            <p className="text-stone-500 text-xs sm:text-sm">
              Formules composées prêtes à commander en 1 clic.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {quickPacks.map(pack => (
              <div 
                key={pack.id} 
                className={`rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all ${
                  pack.highlight 
                    ? 'bg-[#1E3B21] text-white shadow-lg ring-1 ring-emerald-400/40' 
                    : 'bg-white border border-stone-200 text-stone-800 shadow-2xs hover:shadow-md'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      pack.highlight ? 'bg-amber-400 text-[#122416]' : 'bg-emerald-50 text-emerald-800'
                    }`}>
                      {pack.badge}
                    </span>
                    {pack.highlight && <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />}
                  </div>

                  <h3 className="font-bold text-base sm:text-lg">
                    {pack.name}
                  </h3>

                  <div className={`text-xl font-black ${pack.highlight ? 'text-amber-300' : 'text-[#2D5A27]'}`}>
                    {pack.price}
                  </div>

                  <p className={`text-xs leading-relaxed ${pack.highlight ? 'text-stone-200' : 'text-stone-500'}`}>
                    {pack.description}
                  </p>
                </div>

                <button
                  onClick={() => handleOrderPackWhatsApp(pack.name, pack.price)}
                  className={`w-full py-2.5 px-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs ${
                    pack.highlight 
                      ? 'bg-amber-400 hover:bg-amber-300 text-[#122416]' 
                      : 'bg-[#2D5A27] hover:bg-[#1E3B21] text-white'
                  }`}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Commander sur WhatsApp</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      </FadeInView>

      {/* 6. SECTION ACTUALITÉS & ANNONCES RÉCENTES */}
      {recentAnnouncements.length > 0 && (
        <FadeInView direction="up" distance={30} duration={0.65}>
          <section className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2">
                <span className="inline-block px-3 py-1 bg-[#E8F5E9] text-[#2D5A27] text-xs font-bold uppercase tracking-widest rounded-md">
                  Actualités & Événements
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1B3022] tracking-tight">
                  Nos Dernières Annonces
                </h2>
                <p className="text-stone-600 text-sm">
                  Restez informés sur les arrivages de stock, foires agricoles et événements de notre unité.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('actualites')}
                className="inline-flex items-center gap-2 text-[#2D5A27] hover:text-[#1B3022] font-bold text-sm transition cursor-pointer"
              >
                <span>Voir toutes les actualités</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <FadeInStagger staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentAnnouncements.map(ann => (
                <FadeInItem key={ann.id}>
                  <article
                    onClick={() => {
                      setActiveTab('actualites');
                      openAnnouncementDetail(ann.id);
                    }}
                    className="h-full bg-white rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col group cursor-pointer hover:border-[#2D5A27]/40"
                  >
                    <div className="relative aspect-16/10 w-full bg-[#FAF9F6] overflow-hidden">
                      {ann.image ? (
                        <img
                          src={ann.image}
                          alt={ann.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-stone-100 text-stone-400">
                          <Sparkles className="w-8 h-8" />
                        </div>
                      )}
                      {ann.video && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition">
                          <div className="w-10 h-10 rounded-full bg-[#2D5A27] text-white flex items-center justify-center shadow">
                            <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
                          </div>
                        </div>
                      )}
                      {ann.category && (
                        <div className="absolute top-2.5 left-2.5 bg-[#1B3022]/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded">
                          {ann.category}
                        </div>
                      )}
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs text-stone-400">
                          <Calendar className="w-3.5 h-3.5 text-[#2D5A27]" />
                          <span>{formatDate(ann.date || ann.createdAt)}</span>
                        </div>
                        <h3 className="font-bold text-base text-[#1B3022] group-hover:text-[#2D5A27] transition line-clamp-2 leading-snug">
                          {ann.title}
                        </h3>
                        <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                          {ann.description}
                        </p>
                      </div>

                      <div className="text-xs font-bold text-[#2D5A27] group-hover:translate-x-0.5 transition inline-flex items-center gap-1 pt-2">
                        <span>{ann.video ? 'Visionner la vidéo' : 'Lire l\'annonce'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </article>
                </FadeInItem>
              ))}
            </FadeInStagger>
          </section>
        </FadeInView>
      )}

      {/* 7. SECTION AVIS CLIENTS & GESTION FIREBASE */}
      <FadeInView direction="up" distance={30} duration={0.65}>
        <CustomerReviewsSection />
      </FadeInView>

      {/* 7.5. SECTION SIMULATEUR DE LIVRAISON EXPRESS */}
      <FadeInView direction="up" distance={25} duration={0.6}>
        <DeliveryCalculatorWidget />
      </FadeInView>

      {/* 8. SECTION FAQ INTERACTIVE (ACCORDÉON) */}
      <FadeInView direction="up" distance={20} duration={0.6}>
        <section className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-9 space-y-5 shadow-2xs">
          <div className="text-center max-w-lg mx-auto space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-stone-100 text-stone-700 text-xs font-bold rounded-full">
              <HelpCircle className="w-3.5 h-3.5 text-stone-500" />
              <span>Questions Fréquentes</span>
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-[#142618]">
              Tout savoir avant de commander
            </h3>
          </div>

          <div className="max-w-2xl mx-auto divide-y divide-stone-100">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div key={index} className="py-3.5">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between gap-3 text-left font-bold text-sm sm:text-base text-[#142618] hover:text-[#2D5A27] transition cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-emerald-700' : 'text-stone-400'}`} />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <p className="text-xs sm:text-sm text-stone-500 leading-relaxed pt-2">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>
      </FadeInView>

      {/* 9. SECTION CONTACT & PRISE DE COMMANDE FINALE */}
      <FadeInView direction="up" distance={20} duration={0.6}>
        <section className="bg-gradient-to-r from-[#182F1E] to-[#112315] text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-block px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full">
              À votre écoute
            </span>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Sublimez Votre Cuisine Aujourd'hui
            </h2>

            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
              Particulier ou chef restaurateur, notre équipe vous conseille et traite votre commande en direct.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => openOrderWhatsApp()}
                className="inline-flex items-center gap-2 bg-[#B82B2B] hover:bg-[#9E2424] text-white font-bold px-5 py-2.5 rounded-xl shadow-sm transition cursor-pointer text-xs sm:text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Commander sur WhatsApp</span>
              </button>

              <button
                onClick={() => setActiveTab('contact')}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer text-xs sm:text-sm"
              >
                <span>Formulaire</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <a
                href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                className="inline-flex items-center gap-1.5 text-stone-300 hover:text-white font-semibold text-xs sm:text-sm px-2 py-2 transition"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                <span>{settings.phone}</span>
              </a>
            </div>
          </div>
        </section>
      </FadeInView>

    </div>
  );
};
