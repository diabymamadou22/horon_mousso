import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ProductCard } from './ProductCard';
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
      title: "1. Récolte & Sélection Maraîchère",
      subtitle: "Partenariat solidaire avec les coopératives",
      desc: "Nous sélectionnons uniquement des piments rouges mûrs à point, des rhizomes de gingembre denses et des graines de néré saines récoltées dans le respect des cycles naturels de nos sols africains.",
      tag: "Terroir Vivant",
      image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "2. Lavage & Tri Manuel Minutieux",
      subtitle: "Normes d'hygiène et élimination des impuretés",
      desc: "Chaque lot est débarrassé de ses pédoncules et lavé à l'eau claire en plusieurs bains contrôlés. Le tri manuel élimine toute pièce imparfaite pour ne conserver que la quintessence aromatique.",
      tag: "Pureté Absolue",
      image: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "3. Séchage Thermorégulé & Propre",
      subtitle: "Préservation des vitamines et de la capsaïcine",
      desc: "À l'abri des poussières et des insectes, notre unité utilise des séchoirs hygiéniques régulés. Ce séchage doux préserve l'huile essentielle, la couleur pourpre flamboyante et le parfum originel.",
      tag: "Séchage Sûr",
      image: "https://images.unsplash.com/photo-1526346698789-224822f00545?auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "4. Mouture Fine & Conditionnement Hermétique",
      subtitle: "Fraîcheur longue durée sans aucun conservateur",
      desc: "Broyage à froid pour éviter d'échauffer les épices, tamisage fin régulier et ensachage immédiat dans des contenants hermétiques qui garantissent des mois de fraîcheur gustative.",
      tag: "Prêt à Cuisiner",
      image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80"
    }
  ];

  // Hotness levels data
  const spiceLevels = [
    {
      level: 1,
      title: "Doux & Aromatique",
      subtitle: "Pour toute la famille et sauces délicates",
      desc: "Curcuma riche en curcumine, gingembre doux citronné. Éveille le plat sans piquant agressif.",
      color: "from-emerald-500 to-green-600",
      flames: 1,
      badge: "Idéal enfants & gourmets"
    },
    {
      level: 2,
      title: "Chaleur Équilibrée",
      subtitle: "La signature culinaire ouest-africaine",
      desc: "Soumbala grand arôme, poivres sélectionnés et mélanges mijotés. Une profondeur umami inimitable.",
      color: "from-amber-500 to-orange-500",
      flames: 2,
      badge: "Le plus populaire"
    },
    {
      level: 3,
      title: "Piquant Intense & Charnu",
      subtitle: "Pour amateurs de saveurs franches",
      desc: "Piments entiers séchés au soleil à infuser ou piler. Idéal pour marinades de poulet braisé et poissons.",
      color: "from-orange-600 to-red-600",
      flames: 3,
      badge: "Grillades & Sauces fortes"
    },
    {
      level: 4,
      title: "Extra Fort Authentique",
      subtitle: "Pour connaisseurs et piments de table",
      desc: "Piment rouge pur moulu très fin. Une simple pointe de couteau suffit à enflammer une sauce d'un arôme pur.",
      color: "from-red-600 to-rose-700",
      flames: 4,
      badge: "Force maximale garantie"
    }
  ];

  // Recipe inspirations
  const recipes = [
    {
      title: "Tigadèguèna & Mafé Royal du Terroir",
      time: "45 min",
      type: "Plat Traditionnel",
      desc: "Sublimez la pâte d'arachide avec 1 cuillère de Soumbala de Néré Horon Mousso et une pointe de piment rouge séché. La sauce acquiert une onctuosité et une profondeur dignes des grandes tables.",
      spiceNeeded: "Soumbala Pur + Piment Rouge",
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"
    },
    {
      title: "Marinade Dorée pour Poulet Braisé & Suya",
      time: "20 min",
      type: "Grillades & Braises",
      desc: "Mélangez du gingembre pur en poudre, de l'ail écrasé, du curcuma et du piment fort moulu dans un filet d'huile. Enrobez vos viandes 2h avant le passage au feu de braise pour une croûte parfumée.",
      spiceNeeded: "Gingembre Pur + Curcuma",
      image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80"
    },
    {
      title: "Piment de Table Émulsionné à l'Huile Tiède",
      time: "10 min",
      type: "Condiment Maison",
      desc: "Versez une huile d'arachide ou de sésame chaude sur 3 cuillères de notre piment rouge en poudre avec une pincée de sel marin. Laissez infuser : vous obtenez le meilleur piment de table artisanal.",
      spiceNeeded: "Piment Rouge Extra Fort",
      image: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=600&q=80"
    }
  ];

  // Customer testimonials
  const testimonials = [
    {
      quote: "Le Soumbala Horon Mousso a complètement changé la qualité de mes sauces au restaurant. Il n'a aucune odeur désagréable et donne un goût de bouillon naturel qu'on ne trouve nulle part ailleurs.",
      name: "Chef Amadou K.",
      role: "Restaurateur & Traiteur",
      location: "Bamako, Badalabougou",
      rating: 5,
      productUsed: "Soumbala Pur Grand Cru"
    },
    {
      quote: "Enfin un piment en poudre qui n'est pas mélangé à de la farine ou à des colorants ! La couleur rouge est éclatante et le piquant est authentique. Mes enfants et mon époux adorent.",
      name: "Mme Aïssata Traoré",
      role: "Mère de famille passionnée de cuisine",
      location: "Abidjan, Cocody",
      rating: 5,
      productUsed: "Piment Rouge Extra Fort"
    },
    {
      quote: "La pureté du gingembre et du curcuma se sent dès l'ouverture du pot : ça sent frais, ça sent le champ. Livraison reçue le lendemain de ma commande WhatsApp sans tracas.",
      name: "Dr. Oumar Diallo",
      role: "Amateur de cuisine saine",
      location: "Bamako, ACI 2000",
      rating: 5,
      productUsed: "Pack Trio Épices"
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
      q: "Comment commander et quels sont les moyens de paiement acceptés ?",
      a: "Vous pouvez commander directement en ligne en ajoutant les produits à votre panier pour finaliser sur WhatsApp, ou nous appeler directement. Nous acceptons Wave, Orange Money, Moov Money et le paiement en espèces à la livraison."
    },
    {
      q: "Vos piments et épices sont-ils garantis sans produits chimiques ?",
      a: "Absolument. Tous nos produits sont 100% naturels : zéro colorant synthétique, zéro conservateur chimique, zéro farine de charge et aucun glutamate de synthèse. Tout est issu d'une transformation pure et propre."
    },
    {
      q: "Comment se déroulent la livraison et les expéditions ?",
      a: "Nous assurons la livraison rapide à domicile et sur votre lieu de travail dans la journée ou sous 24h à Bamako et Abidjan. Pour l'intérieur du pays et la sous-région, nous expédions par colis sécurisé chaque semaine."
    },
    {
      q: "Proposez-vous des tarifs grossistes pour les restaurants et épiceries ?",
      a: "Oui ! Nous travaillons avec de nombreux chefs cuisiniers, hôtels et boutiques. Nous disposons de formats pro en 5kg, 10kg et 25kg avec des tarifs dégressifs très compétitifs."
    }
  ];

  return (
    <div className="space-y-24 py-12 px-4 sm:px-8 lg:px-10 max-w-7xl mx-auto">
      
      {/* 1. SECTION : NOS PRODUITS PHARES AVEC FILTRES INTERACTIFS */}
      <section className="space-y-8">
        <FadeInView direction="up" distance={20} duration={0.6}>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-[#2D5A27] text-xs font-bold uppercase tracking-wider rounded-md">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>Nos Trésors Culinaires</span>
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-[#142618] tracking-tight">
                Découvrez la Noblesse de Nos Épices
              </h2>
              <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                Piments rouges déshydratés, soumbala traditionnel, gingembre sauvage et mélanges savoureux conditionnés pour préserver 100% des arômes.
              </p>
            </div>

            {/* View all button */}
            <button
              onClick={() => setActiveTab('produits')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-stone-300 hover:border-emerald-600 bg-white hover:bg-stone-50 text-stone-800 hover:text-emerald-800 font-bold text-xs sm:text-sm transition group cursor-pointer shadow-xs shrink-0 self-start lg:self-auto"
            >
              <span>Voir tout le catalogue ({products.length})</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </button>
          </div>

          {/* Interactive Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-4">
            {[
              { id: 'tous', label: '✨ Tous les incontournables' },
              { id: 'phares', label: '⭐ Produits Phares' },
              { id: 'piments', label: '🌶️ Piments & Séchés' },
              { id: 'epices', label: '🌿 Épices & Aromates' },
              { id: 'produits_transformes', label: '🌰 Soumbala & Terroir' },
              { id: 'nouveautes', label: '⚡ Nouveaux Arrivages' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                  selectedCategory === tab.id
                    ? 'bg-[#2D5A27] text-white shadow-md shadow-emerald-950/20 scale-[1.02]'
                    : 'bg-white border border-stone-200 text-stone-700 hover:border-stone-400 hover:bg-stone-50'
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
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {displayProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* 2. SECTION INTERACTIVE : GUIDE DES INTENSITÉS & NIVEAUX DE PIQUANT */}
      <FadeInView direction="up" distance={25} duration={0.65}>
        <section className="bg-gradient-to-br from-[#1B3022] via-[#122416] to-[#0A160D] text-white rounded-[32px] p-6 sm:p-10 lg:p-12 shadow-2xl border border-emerald-900/60 relative overflow-hidden">
          {/* Ambient light flares */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2 max-w-xl">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider rounded-md">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Guide Culinaire Interactif</span>
                </span>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                  Quel niveau de piquant correspond à votre cuisine ?
                </h3>
                <p className="text-stone-300 text-xs sm:text-sm">
                  Sélectionnez votre intensité préférée pour découvrir les saveurs et les dosages recommandés par notre maître artisan.
                </p>
              </div>

              <div className="flex items-center gap-1 bg-white/10 p-1 rounded-2xl border border-white/10 backdrop-blur-xs self-start md:self-auto">
                {spiceLevels.map(item => (
                  <button
                    key={item.level}
                    onClick={() => setActiveSpiceLevel(item.level)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      activeSpiceLevel === item.level
                        ? 'bg-amber-400 text-[#122416] shadow-md font-extrabold'
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
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-md">
                  <div className="lg:col-span-8 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-0.5 text-red-400">
                        {[...Array(current.flames)].map((_, i) => (
                          <Flame key={i} className="w-5 h-5 fill-current animate-pulse" />
                        ))}
                      </div>
                      <span className="text-xs font-bold bg-white/15 px-3 py-1 rounded-full text-amber-200">
                        {current.badge}
                      </span>
                    </div>

                    <h4 className="text-xl sm:text-2xl font-black text-white">
                      {current.title} : <span className="text-amber-300 font-medium text-base sm:text-xl">{current.subtitle}</span>
                    </h4>

                    <p className="text-stone-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
                      {current.desc}
                    </p>

                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => setActiveTab('produits')}
                        className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-[#122416] font-black text-xs sm:text-sm py-2.5 px-5 rounded-xl transition cursor-pointer shadow-md"
                      >
                        <span>Voir les épices niveau {current.level}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => openOrderWhatsApp()}
                        className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl transition cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4 text-emerald-400" />
                        <span>Demander conseil au spécialiste</span>
                      </button>
                    </div>
                  </div>

                  {/* Right mini graphic */}
                  <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl border border-white/10 text-center">
                    <div className="text-4xl mb-2">
                      {current.level === 1 ? '🌿' : current.level === 2 ? '🌰' : current.level === 3 ? '🌶️' : '🔥'}
                    </div>
                    <div className="font-extrabold text-sm text-white">{current.title}</div>
                    <div className="text-[11px] text-stone-300 mt-1">Dosage recommandé : 1/2 à 1 c. à café par plat</div>
                  </div>
                </div>
              );
            })()}
          </div>
        </section>
      </FadeInView>

      {/* 3. SECTION ARTISANAT & SAVOIR-FAIRE : DE LA TERRE AU SACHET */}
      <FadeInView direction="up" distance={30} duration={0.65}>
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-emerald-100 text-[#2D5A27] text-xs font-bold uppercase tracking-wider rounded-full">
              <Leaf className="w-3.5 h-3.5" />
              <span>Notre Processus Rigoureux</span>
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#142618] tracking-tight">
              De la Récolte au Sachet : Une Transformation Exemplaire
            </h2>
            <p className="text-stone-600 text-sm sm:text-base">
              Chaque grain, chaque piment et chaque racine est transformé selon une charte d’hygiène et d’authenticité intransigeante.
            </p>
          </div>

          {/* Interactive Stepper Navigation */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {transformationSteps.map((step, idx) => (
              <button
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  activeStep === idx 
                    ? 'bg-[#2D5A27] text-white border-[#2D5A27] shadow-lg shadow-emerald-950/20 scale-[1.02]' 
                    : 'bg-white border-stone-200 text-stone-700 hover:border-stone-400 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-extrabold px-2 py-0.5 rounded-md ${
                    activeStep === idx ? 'bg-white/20 text-emerald-200' : 'bg-stone-100 text-stone-600'
                  }`}>
                    Étape 0{idx + 1}
                  </span>
                  {activeStep === idx && <CheckCircle2 className="w-4 h-4 text-emerald-300" />}
                </div>
                <div className="font-bold text-xs sm:text-sm line-clamp-1">{step.title.split('. ')[1] || step.title}</div>
                <div className={`text-[11px] mt-1 ${activeStep === idx ? 'text-emerald-100' : 'text-stone-500'}`}>
                  {step.tag}
                </div>
              </button>
            ))}
          </div>

          {/* Detailed Active Step Showcase */}
          {(() => {
            const currentStepData = transformationSteps[activeStep];
            return (
              <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <div className="inline-block px-3 py-1 bg-[#E8F5E9] text-[#2D5A27] text-xs font-bold rounded-lg uppercase tracking-wide">
                    {currentStepData.tag}
                  </div>
                  <h3 className="text-xl sm:text-3xl font-extrabold text-[#142618]">
                    {currentStepData.title}
                  </h3>
                  <div className="text-sm font-semibold text-[#2D5A27]">
                    {currentStepData.subtitle}
                  </div>
                  <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                    {currentStepData.desc}
                  </p>

                  <div className="pt-3 flex items-center gap-4 text-xs font-bold text-stone-700">
                    <span className="flex items-center gap-1.5 text-[#2D5A27]">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      100% Hygiénique
                    </span>
                    <span className="flex items-center gap-1.5 text-[#2D5A27]">
                      <Award className="w-4 h-4 text-emerald-600" />
                      Contrôle Qualité
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <div className="aspect-4/3 rounded-2xl overflow-hidden border border-stone-200 shadow-md">
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
      <FadeInView direction="up" distance={30} duration={0.65}>
        <section className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider rounded-md">
                <ChefHat className="w-3.5 h-3.5 text-amber-700" />
                <span>Inspirations Culinaires</span>
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-[#142618] tracking-tight">
                Idées Recettes & Accords Saveurs
              </h2>
              <p className="text-stone-600 text-sm">
                Comment réveiller vos sauces traditionnelles, viandes braisées et marinades du quotidien avec nos épices.
              </p>
            </div>

            <button
              onClick={() => setActiveTab('a_propos')}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#2D5A27] hover:underline"
            >
              <span>Découvrir l'histoire de nos saveurs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recipes.map((rec, i) => (
              <div 
                key={i} 
                className="bg-white rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col group hover:border-[#2D5A27]/50"
              >
                <div className="relative aspect-16/10 overflow-hidden bg-stone-100">
                  <img
                    src={rec.image}
                    alt={rec.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-[#142618]/90 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md backdrop-blur-xs">
                    {rec.type}
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 bg-white/90 text-stone-900 text-[11px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-xs">
                    ⏱️ {rec.time}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-base text-[#142618] group-hover:text-[#2D5A27] transition">
                      {rec.title}
                    </h3>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {rec.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-1 rounded-md border border-amber-200/50">
                      Épice : {rec.spiceNeeded}
                    </span>
                    <button
                      onClick={() => setActiveTab('produits')}
                      className="text-xs font-extrabold text-[#2D5A27] hover:text-[#142618] inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Voir le produit</span>
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
      <FadeInView direction="up" distance={30} duration={0.65}>
        <section className="bg-stone-100/90 border border-stone-200 rounded-[32px] p-6 sm:p-10 lg:p-12 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/20 text-amber-900 text-xs font-bold uppercase tracking-wider rounded-md">
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>Commande Express WhatsApp</span>
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#142618] tracking-tight">
              Nos Packs Spéciaux Prêts à Commander
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm">
              Sélectionnez votre formule : un message prérempli s'ouvre instantanément sur WhatsApp pour finaliser avec notre équipe.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickPacks.map(pack => (
              <div 
                key={pack.id} 
                className={`rounded-3xl p-6 flex flex-col justify-between space-y-5 transition-all ${
                  pack.highlight 
                    ? 'bg-[#1E3B21] text-white shadow-xl ring-2 ring-emerald-500' 
                    : 'bg-white border border-stone-200 text-stone-800 shadow-xs hover:shadow-md'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      pack.highlight ? 'bg-amber-400 text-[#122416]' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {pack.badge}
                    </span>
                    {pack.highlight && <Star className="w-4 h-4 text-amber-400 fill-current" />}
                  </div>

                  <h3 className="font-extrabold text-lg sm:text-xl">
                    {pack.name}
                  </h3>

                  <div className={`text-2xl font-black ${pack.highlight ? 'text-amber-300' : 'text-[#2D5A27]'}`}>
                    {pack.price}
                  </div>

                  <p className={`text-xs leading-relaxed ${pack.highlight ? 'text-stone-200' : 'text-stone-600'}`}>
                    {pack.description}
                  </p>
                </div>

                <button
                  onClick={() => handleOrderPackWhatsApp(pack.name, pack.price)}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-md ${
                    pack.highlight 
                      ? 'bg-amber-400 hover:bg-amber-300 text-[#122416]' 
                      : 'bg-[#2D5A27] hover:bg-[#1E3B21] text-white'
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Commander ce Pack sur WhatsApp</span>
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

      {/* 7. SECTION TÉMOIGNAGES CLIENTS & AVIS VÉRIFIÉS */}
      <FadeInView direction="up" distance={30} duration={0.65}>
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider rounded-md">
              <Star className="w-3.5 h-3.5 text-amber-600 fill-current" />
              <span>Avis & Retours d'Expérience</span>
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#142618] tracking-tight">
              Ce que disent les amateurs de bonne cuisine
            </h2>
            <p className="text-stone-600 text-sm">
              Chefs de restaurant, traiteurs et familles qui ont adopté la pureté de nos épices au quotidien.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-600/40 transition"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-stone-700 italic leading-relaxed">
                    « {t.quote} »
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    <div className="font-extrabold text-xs sm:text-sm text-[#142618]">{t.name}</div>
                    <div className="text-[11px] text-stone-500">{t.role} • {t.location}</div>
                  </div>
                  <div className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                    Vérifié
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </FadeInView>

      {/* 8. SECTION FAQ INTERACTIVE (ACCORDÉON) */}
      <FadeInView direction="up" distance={30} duration={0.65}>
        <section className="bg-white border border-stone-200 rounded-[32px] p-6 sm:p-10 lg:p-12 space-y-6 shadow-xs">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 text-stone-700 text-xs font-bold uppercase tracking-wider rounded-md">
              <HelpCircle className="w-3.5 h-3.5 text-stone-600" />
              <span>Questions Fréquentes</span>
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-[#142618]">
              Tout savoir avant de passer commande
            </h3>
          </div>

          <div className="max-w-3xl mx-auto divide-y divide-stone-100">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div key={index} className="py-4">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between gap-4 text-left font-bold text-sm sm:text-base text-[#142618] hover:text-[#2D5A27] transition cursor-pointer"
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
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed pt-2.5">
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
      <FadeInView direction="up" distance={32} duration={0.65}>
        <section className="bg-gradient-to-r from-[#1B3022] to-[#122416] text-white rounded-[32px] p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-6">
            <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-widest rounded-md">
              Service Client Réactif
            </span>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              Prêt à sublimer votre cuisine ou besoin d'un devis grossiste ?
            </h2>

            <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
              Notre équipe répond en direct à toutes vos questions pour les particuliers comme pour les restaurateurs professionnels.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={() => openOrderWhatsApp()}
                className="inline-flex items-center gap-2.5 bg-[#C53030] hover:bg-[#A62828] text-white font-bold px-7 py-3.5 rounded-full shadow-lg shadow-red-950/20 transition transform hover:-translate-y-0.5 cursor-pointer text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Commander sur WhatsApp</span>
              </button>

              <button
                onClick={() => setActiveTab('contact')}
                className="inline-flex items-center gap-2 bg-[#2D5A27] hover:bg-[#3E7D36] text-white font-semibold px-6 py-3.5 rounded-xl transition cursor-pointer text-sm"
              >
                <span>Accéder au formulaire de contact</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                className="inline-flex items-center gap-2 text-stone-200 hover:text-white font-semibold text-xs sm:text-sm px-3 py-2 transition"
              >
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <span>{settings.phone}</span>
              </a>
            </div>
          </div>
        </section>
      </FadeInView>

    </div>
  );
};
