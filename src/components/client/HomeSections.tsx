import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ProductCard } from './ProductCard';
import { CustomerReviewsSection } from './CustomerReviewsSection';
import { DeliveryCalculatorWidget } from './DeliveryCalculatorWidget';
import { CustomBoxBuilder } from './CustomBoxBuilder';
import { FadeInView, FadeInStagger, FadeInItem } from '../common/FadeInView';
import { 
  ArrowRight, 
  Sparkles, 
  Flame, 
  Leaf, 
  Play, 
  Calendar, 
  MessageCircle, 
  PhoneCall, 
  Award, 
  CheckCircle2, 
  Utensils, 
  Heart, 
  ChevronDown, 
  ShoppingBag, 
  HelpCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../../types';
import { LazyProductImage } from '../common/LazyProductImage';

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
    <div className="space-y-24 sm:space-y-32 lg:space-y-36 py-8 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* 1. SECTION : NOS PRODUITS PHARES AVEC FILTRES INTERACTIFS */}
      <FadeInView direction="up" distance={26} duration={0.65}>
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-5 border-b border-stone-200">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E5A100] text-stone-950 text-[11px] font-black uppercase tracking-wider rounded-md shadow-2xs">
                  <Award className="w-3.5 h-3.5" />
                  <span>Rayon Vedette</span>
                </span>
                <span className="text-xs font-bold text-stone-400">Terroir Malien</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-900 tracking-tight">
                Les Incontournables Horon Mousso
              </h2>
              <p className="text-stone-500 text-xs sm:text-sm font-medium max-w-2xl leading-relaxed">
                Piments séchés au soleil, véritable soumbala de néré et poudres aromatiques garanties sans aucun adjuvant chimique.
              </p>
            </div>

            {/* View all button */}
            <button
              onClick={() => setActiveTab('produits')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-stone-300 hover:border-[#E5A100] bg-white hover:bg-stone-50 text-stone-900 font-bold text-xs sm:text-sm transition group cursor-pointer shadow-2xs self-start sm:self-auto shrink-0"
            >
              <span>Voir tout le rayon ({products.length})</span>
              <ArrowRight className="w-4 h-4 text-stone-950 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Interactive Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1 pb-1">
            {[
              { id: 'tous', label: 'Toutes les créations' },
              { id: 'phares', label: '⭐ Coups de Cœur' },
              { id: 'piments', label: '🌶️ Piments Rares' },
              { id: 'epices', label: '🌿 Épices & Aromates' },
              { id: 'produits_transformes', label: '✨ Soumbala & Néré' },
              { id: 'nouveautes', label: '🔥 Nouveautés' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  selectedCategory === tab.id
                    ? 'bg-stone-900 text-[#E5A100] shadow-sm font-black'
                    : 'bg-white border border-stone-200 text-stone-700 hover:border-stone-400 hover:bg-stone-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Product Cards Grid with progressive staggered animation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FadeInStagger staggerDelay={0.06} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7 lg:gap-8">
                {displayProducts.map(product => (
                  <FadeInItem key={product.id} withScale distance={18} duration={0.5}>
                    <ProductCard product={product} />
                  </FadeInItem>
                ))}
              </FadeInStagger>
            </motion.div>
          </AnimatePresence>
        </section>
      </FadeInView>

      {/* 2. SECTION INTERACTIVE : GUIDE DES INTENSITÉS & NIVEAUX DE PIQUANT */}
      <FadeInView direction="up" distance={30} duration={0.65} withScale={true}>
        <section className="bg-gradient-to-br from-[#182F1E] via-[#122416] to-[#0D1A10] text-white rounded-[32px] p-8 sm:p-12 lg:p-14 shadow-xl border border-emerald-900/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-8 sm:space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2 max-w-lg">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-wider rounded-full">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Guide Sensoriel & Intensité</span>
                </span>
                <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-serif-heading">
                  Échelle de Chaleur Culinaire
                </h3>
                <p className="text-stone-300 text-xs sm:text-sm font-medium leading-relaxed">
                  Du doux parfumé aux piments torrides d'Afrique de l'Ouest, trouvez le dosage parfait.
                </p>
              </div>

              <div className="flex items-center gap-1.5 bg-white/10 p-1.5 rounded-2xl border border-white/15 backdrop-blur-md self-start md:self-auto">
                {spiceLevels.map(item => (
                  <button
                    key={item.level}
                    onClick={() => setActiveSpiceLevel(item.level)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeSpiceLevel === item.level
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-[#0F2916] shadow-md font-extrabold scale-105'
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
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center bg-white/5 border border-white/15 rounded-[24px] p-6 sm:p-9 backdrop-blur-md">
                  <div className="lg:col-span-8 space-y-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center gap-1 text-red-400">
                        {[...Array(current.flames)].map((_, i) => (
                          <Flame key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                      <span className="text-[11px] font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-0.5 rounded-full uppercase tracking-wider">
                        {current.badge}
                      </span>
                    </div>

                    <h4 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white font-serif-heading">
                      {current.title} — <span className="text-amber-300 font-normal">{current.subtitle}</span>
                    </h4>

                    <p className="text-stone-300 text-xs sm:text-sm leading-relaxed max-w-xl">
                      {current.desc}
                    </p>

                    <div className="pt-2 flex flex-wrap items-center gap-3.5">
                      <button
                        onClick={() => setActiveTab('produits')}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#0F2916] font-extrabold text-xs sm:text-sm py-3 px-5 rounded-xl transition cursor-pointer shadow-md"
                      >
                        <span>Découvrir le niveau {current.level}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => openOrderWhatsApp()}
                        className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm py-3 px-4.5 rounded-xl transition cursor-pointer border border-white/10"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Conseil sur WhatsApp</span>
                      </button>
                    </div>
                  </div>

                  {/* Right mini graphic */}
                  <div className="lg:col-span-4 flex flex-col items-center justify-center p-7 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl border border-white/10 text-center">
                    <div className="text-4xl sm:text-5xl mb-3">
                      {current.level === 1 ? '🌿' : current.level === 2 ? '🌰' : current.level === 3 ? '🌶️' : '🔥'}
                    </div>
                    <div className="font-extrabold text-base text-white font-serif-heading">{current.title}</div>
                    <div className="text-xs text-amber-200/90 mt-1.5 font-medium">Dosage suggéré : 1/2 à 1 c. à café par plat</div>
                  </div>
                </div>
              );
            })()}
          </div>
        </section>
      </FadeInView>

      {/* 4.5. BESPOKE LUXURY CUSTOM BOX BUILDER */}
      <FadeInView direction="up" distance={30} duration={0.7}>
        <CustomBoxBuilder />
      </FadeInView>

      {/* 6. SECTION ACTUALITÉS & ANNONCES RÉCENTES */}
      {recentAnnouncements.length > 0 && (
        <FadeInView direction="up" distance={30} duration={0.65}>
          <section className="space-y-8 sm:space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
              <div className="space-y-2">
                <span className="inline-block px-3 py-1 bg-[#E8F5E9] text-[#2D5A27] text-xs font-bold uppercase tracking-widest rounded-md">
                  Actualités & Événements
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1B3022] tracking-tight">
                  Nos Dernières Annonces
                </h2>
                <p className="text-stone-600 text-xs sm:text-sm max-w-xl">
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

            <FadeInStagger staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
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
                        <LazyProductImage
                          src={ann.image}
                          alt={ann.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          containerClassName="w-full h-full"
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

                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
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
      <FadeInView direction="up" distance={30} duration={0.7} withScale={true}>
        <CustomerReviewsSection />
      </FadeInView>

      {/* 7.5. SECTION SIMULATEUR DE LIVRAISON EXPRESS */}
      <FadeInView direction="up" distance={30} duration={0.7} withScale={true}>
        <DeliveryCalculatorWidget />
      </FadeInView>

      {/* 8. SECTION FAQ INTERACTIVE (ACCORDÉON AVEC EFFET PROGRESSIF) */}
      <FadeInView direction="up" distance={30} duration={0.7}>
        <section className="bg-white border border-stone-200/90 rounded-[32px] p-8 sm:p-12 lg:p-16 space-y-8 sm:space-y-10 shadow-2xs">
          <div className="text-center max-w-lg mx-auto space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 text-[#0F2916] text-xs font-black uppercase tracking-wider rounded-full border border-stone-200">
              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Foire Aux Questions</span>
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-[#0B1E11] font-serif-heading">
              Tout savoir avant de commander
            </h3>
            <p className="text-stone-600 text-xs sm:text-sm font-medium leading-relaxed">
              Transparence totale sur nos origines, notre séchage et la livraison rapide.
            </p>
          </div>

          <FadeInStagger staggerDelay={0.07} className="max-w-2xl mx-auto divide-y divide-stone-100">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <FadeInItem key={index} distance={14} duration={0.45}>
                  <div className="py-5 sm:py-6">
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full flex items-center justify-between gap-4 text-left font-bold text-sm sm:text-base text-[#0B1E11] hover:text-[#0F2916] transition cursor-pointer font-serif-heading"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-amber-600' : 'text-stone-400'}`} />
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
                          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed pt-3.5 font-medium">
                            {faq.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </FadeInItem>
              );
            })}
          </FadeInStagger>
        </section>
      </FadeInView>

      {/* 9. SECTION CONTACT & PRISE DE COMMANDE FINALE */}
      <FadeInView direction="up" distance={30} duration={0.75} withScale={true}>
        <section className="bg-gradient-to-r from-[#0A180E] via-[#0F2916] to-[#163D20] text-white rounded-[32px] p-8 sm:p-12 lg:p-16 shadow-2xl relative overflow-hidden border border-emerald-600/30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl space-y-5">
            <span className="inline-block px-3.5 py-1 bg-amber-400/20 text-amber-300 text-xs font-black uppercase tracking-wider rounded-full border border-amber-400/30">
              Service Client Dédié & Artisanal
            </span>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-serif-heading text-white">
              Sublimez Votre Cuisine Aujourd'hui
            </h2>

            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed font-medium">
              Particulier gourmand ou chef de cuisine, notre équipe vous conseille avec passion et expédie votre commande partout à Bamako et dans les régions.
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-3.5">
              <button
                type="button"
                onClick={() => openOrderWhatsApp()}
                className="inline-flex items-center gap-2.5 bg-gradient-to-r from-[#B82B2B] to-[#D93838] hover:from-[#A02222] hover:to-[#C02E2E] text-white font-extrabold px-6 py-3.5 rounded-2xl shadow-lg transition cursor-pointer text-xs sm:text-sm border border-red-400/30"
              >
                <MessageCircle className="w-4 h-4 text-white" />
                <span>Commander sur WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('contact')}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-3.5 rounded-2xl transition cursor-pointer text-xs sm:text-sm border border-white/15"
              >
                <span>Envoyer un message</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
              </button>

              <a
                href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                className="inline-flex items-center gap-2 text-stone-300 hover:text-white font-semibold text-xs sm:text-sm px-3 py-2 transition"
              >
                <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
                <span>{settings.phone}</span>
              </a>
            </div>
          </div>
        </section>
      </FadeInView>

    </div>
  );
};
