import React, { useState } from 'react';
import { ChefHat, Sparkles, Flame, Check, ShoppingBag, ArrowRight, Star, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';

interface DishPairing {
  id: string;
  name: string;
  subtitle: string;
  emoji: string;
  secret: string;
  spiceIds: string[];
  duoDiscountName: string;
  bundlePrice: string;
  originalPrice: string;
  flavorProfile: {
    umami: number;
    piquant: number;
    arome: number;
    fraicheur: number;
  };
  culinaryTip: string;
}

export const InteractiveSpiceMatcher: React.FC = () => {
  const { products, addToCart, openProductDetail } = useApp();
  const [selectedDishId, setSelectedDishId] = useState<string>('tchep');
  const [addedDuo, setAddedDuo] = useState<boolean>(false);

  const pairings: DishPairing[] = [
    {
      id: 'tchep',
      name: 'Riz Gras & Tchep Royal',
      subtitle: 'Le joyau des grandes cérémonies',
      emoji: '🥘',
      secret: 'Une base mijotée au Soumbala de Néré relevée d’une pointe de piment rouge pur.',
      spiceIds: ['prod_soumbala', 'prod_1'],
      duoDiscountName: 'Duo Festin Royal (Soumbala + Piment Rouge)',
      bundlePrice: '3 600 FCFA',
      originalPrice: '4 000 FCFA',
      flavorProfile: {
        umami: 95,
        piquant: 78,
        arome: 90,
        fraicheur: 60
      },
      culinaryTip: 'Incorporez le Soumbala dès la torréfaction des oignons pour libérer des sucs caramélisés inimitables.'
    },
    {
      id: 'grillades',
      name: 'Grillades, Suya & Dibi',
      subtitle: 'Braises dorées & viandes fondantes',
      emoji: '🥩',
      secret: 'Croûte parfumée aux 7 épices du terroir, ail torréfié et piment doux.',
      spiceIds: ['prod_5', 'prod_7'],
      duoDiscountName: 'Duo Maître Braiseur (Mélange Grillades + Ail Pur)',
      bundlePrice: '3 700 FCFA',
      originalPrice: '4 100 FCFA',
      flavorProfile: {
        umami: 88,
        piquant: 65,
        arome: 96,
        fraicheur: 70
      },
      culinaryTip: 'Massez la viande avec un filet d’huile 30 minutes avant de passer sur la braise fumante.'
    },
    {
      id: 'sauces',
      name: 'Sauces Feuilles & Mafé',
      subtitle: 'Onctuosité & traditions ouest-africaines',
      emoji: '🥣',
      secret: 'L’arôme profond du néré fermenté sans aucun additif et infusion de gousses entières.',
      spiceIds: ['prod_soumbala', 'prod_2'],
      duoDiscountName: 'Duo Terroir Ancien (Soumbala + Piments Entiers)',
      bundlePrice: '4 000 FCFA',
      originalPrice: '4 500 FCFA',
      flavorProfile: {
        umami: 98,
        piquant: 72,
        arome: 94,
        fraicheur: 50
      },
      culinaryTip: 'Laissez les piments entiers infuser sans les percer pour parfumer délicatement sans brûler.'
    },
    {
      id: 'vitalite',
      name: 'Bouillons Santé & Vitalité',
      subtitle: 'Énergie, anti-inflammatoire & digestion',
      emoji: '🍵',
      secret: 'Curcuma pur ultra-riche en curcumine naturelle combiné au piquant vif du gingembre.',
      spiceIds: ['prod_4', 'prod_3'],
      duoDiscountName: 'Duo Bien-Être Suprême (Curcuma Pur + Gingembre)',
      bundlePrice: '3 100 FCFA',
      originalPrice: '3 500 FCFA',
      flavorProfile: {
        umami: 60,
        piquant: 55,
        arome: 98,
        fraicheur: 95
      },
      culinaryTip: 'Ajoutez une pincée de poivre noir et une goutte d’huile végétale pour décupler l’action de la curcumine.'
    },
    {
      id: 'poisson',
      name: 'Poissons Braisés & Atiéké',
      subtitle: 'Fraîcheur marine & condiment explosif',
      emoji: '🐟',
      secret: 'Purée fraîche de piments pilés au citron vert et gingembre tonique.',
      spiceIds: ['prod_6', 'prod_3'],
      duoDiscountName: 'Duo Marinade Côtière (Purée Piment + Gingembre)',
      bundlePrice: '3 600 FCFA',
      originalPrice: '4 000 FCFA',
      flavorProfile: {
        umami: 82,
        piquant: 88,
        arome: 92,
        fraicheur: 90
      },
      culinaryTip: 'Entaillez le poisson frais et garnissez les chairs de ce duo avant de griller sur feu vif.'
    }
  ];

  const currentPairing = pairings.find(p => p.id === selectedDishId) || pairings[0];
  const matchedSpices = currentPairing.spiceIds.map(id => products.find(p => p.id === id)).filter(Boolean);

  const handleAddDuo = () => {
    matchedSpices.forEach(spice => {
      if (spice) addToCart(spice, 1);
    });
    setAddedDuo(true);
    setTimeout(() => setAddedDuo(false), 2000);
  };

  return (
    <section className="relative bg-gradient-to-br from-[#0A2012] via-[#0D2817] to-[#081B0F] rounded-[36px] p-6 sm:p-10 lg:p-12 text-white overflow-hidden shadow-2xl border border-amber-500/20">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Section Header */}
      <div className="relative z-10 max-w-2xl mb-8 space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-black uppercase tracking-wider">
          <ChefHat className="w-3.5 h-3.5 text-amber-400" />
          <span>Bar à Épices & Accords Culinaires</span>
        </span>
        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight font-serif-heading">
          Quel chef-d’œuvre cuisinez-vous aujourd'hui ?
        </h2>
        <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-medium">
          Sélectionnez votre plat pour découvrir l'assemblage parfait recommandé par nos maîtres-artisans Horon Mousso.
        </p>
      </div>

      {/* Dish Tabs Selector */}
      <div className="relative z-10 flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-3 mb-8">
        {pairings.map(dish => {
          const isActive = dish.id === selectedDishId;
          return (
            <button
              key={dish.id}
              onClick={() => {
                setSelectedDishId(dish.id);
                setAddedDuo(false);
              }}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-300 cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 shadow-lg shadow-amber-500/20 scale-102 font-black'
                  : 'bg-white/10 hover:bg-white/15 text-stone-200 border border-white/10 hover:border-white/20'
              }`}
            >
              <span className="text-lg">{dish.emoji}</span>
              <span>{dish.name}</span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Content Panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPairing.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
          className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
        >
          {/* Left Column: Dish insight & Sensor Bars */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <span className="text-amber-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {currentPairing.subtitle}
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight font-serif-heading">
                {currentPairing.name}
              </h3>
              <p className="text-sm text-stone-300 leading-relaxed font-medium">
                {currentPairing.secret}
              </p>
            </div>

            {/* Flavor Balance Gauges */}
            <div className="p-5 rounded-2xl bg-black/30 backdrop-blur-md border border-white/10 space-y-3.5">
              <div className="flex items-center justify-between text-xs text-amber-200 font-bold">
                <span>Profil Aromatique de l'Accord</span>
                <span className="text-[11px] text-stone-400">Équilibre Terroir</span>
              </div>

              <div className="space-y-2.5">
                <div>
                  <div className="flex justify-between text-[11px] text-stone-300 mb-1">
                    <span>Profondeur Umami (Néré)</span>
                    <span className="font-bold text-amber-300">{currentPairing.flavorProfile.umami}%</span>
                  </div>
                  <div className="h-1.5 bg-white/15 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-400 rounded-full transition-all duration-700" 
                      style={{ width: `${currentPairing.flavorProfile.umami}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-stone-300 mb-1">
                    <span>Intensité & Piquant</span>
                    <span className="font-bold text-red-400">{currentPairing.flavorProfile.piquant}%</span>
                  </div>
                  <div className="h-1.5 bg-white/15 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full transition-all duration-700" 
                      style={{ width: `${currentPairing.flavorProfile.piquant}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-stone-300 mb-1">
                    <span>Persistance Aromatique</span>
                    <span className="font-bold text-emerald-300">{currentPairing.flavorProfile.arome}%</span>
                  </div>
                  <div className="h-1.5 bg-white/15 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-400 rounded-full transition-all duration-700" 
                      style={{ width: `${currentPairing.flavorProfile.arome}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Chef Tip */}
              <div className="pt-2 border-t border-white/10 text-xs text-stone-300 flex items-start gap-2">
                <span className="text-amber-400 font-bold shrink-0">Astuce du Chef :</span>
                <span className="italic">{currentPairing.culinaryTip}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Matched Spices Duo Card & 1-Click Order */}
          <div className="lg:col-span-6 bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-7 border border-white/15 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
                Le Duo Gagnant Horon Mousso
              </span>
              <span className="text-[11px] bg-red-600/80 text-white font-extrabold px-2.5 py-0.5 rounded-full">
                -10% en duo
              </span>
            </div>

            {/* Duo Product Cards Side by Side */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {matchedSpices.map(spice => (
                <div 
                  key={spice?.id}
                  onClick={() => spice && openProductDetail(spice.id)}
                  className="group bg-black/40 rounded-2xl p-3 sm:p-3.5 border border-white/10 hover:border-amber-400/50 transition cursor-pointer flex flex-col justify-between"
                >
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-stone-900 mb-2.5">
                    <img 
                      src={spice?.mainImage} 
                      alt={spice?.name} 
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-1.5 right-1.5 bg-black/60 backdrop-blur-xs text-[10px] font-bold text-amber-300 px-2 py-0.5 rounded-md">
                      100% Pur
                    </div>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-xs sm:text-sm text-white group-hover:text-amber-300 transition line-clamp-1">
                      {spice?.name}
                    </h4>
                    <p className="text-[11px] text-stone-400 line-clamp-1 mt-0.5">
                      {spice?.format}
                    </p>
                    <p className="text-xs font-black text-amber-400 mt-1.5">
                      {spice?.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Combined Pricing & Bundle CTA */}
            <div className="pt-4 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-[11px] text-stone-400 uppercase tracking-wider font-semibold">Prix du Duo Privilège</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-amber-300 tracking-tight">
                    {currentPairing.bundlePrice}
                  </span>
                  <span className="text-xs text-stone-400 line-through">
                    {currentPairing.originalPrice}
                  </span>
                </div>
              </div>

              <button
                onClick={handleAddDuo}
                className={`flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl font-black text-xs sm:text-sm shadow-xl transition-all duration-300 cursor-pointer ${
                  addedDuo
                    ? 'bg-emerald-500 text-white scale-102'
                    : 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-stone-950 hover:shadow-amber-500/25 transform hover:-translate-y-0.5'
                }`}
              >
                {addedDuo ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Duo ajouté au panier !</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-stone-950" />
                    <span>Commander ce Duo (-10%)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
};
