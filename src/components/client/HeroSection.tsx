import React from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowRight, Package, Truck, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export const HeroSection: React.FC = () => {
  const { settings, setActiveTab, openProductDetail, products } = useApp();

  // Find a flagship product or default to first
  const heroProduct = products.find(p => p.isFeatured || p.isNew) || products[0];

  return (
    <section className="bg-[#FAF9F6] border-b border-[#E0E0E0] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 py-12 lg:py-16">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-14">
          
          {/* Left Column: Text & CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.25, 1, 0.5, 1] }}
            className="flex-1 flex flex-col justify-center space-y-8"
          >
            <div className="space-y-4">
              <span className="inline-block px-3 py-1 bg-[#E8F5E9] text-[#2D5A27] text-xs font-bold uppercase tracking-widest rounded-md">
                Transformation Agricole
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1B3022] leading-[1.1] tracking-tight">
                L'excellence de la terre, <br />
                <span className="text-[#C53030]">sublimée</span> par nos soins.
              </h1>

              <p className="text-base sm:text-lg text-gray-600 max-w-lg leading-relaxed">
                {settings.shortDescription || "Découvrez nos piments séchés, épices rares et produits transformés issus d'une agriculture locale et responsable."}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => setActiveTab('produits')}
                className="px-8 py-4 bg-[#2D5A27] text-white rounded-xl font-bold shadow-xl shadow-green-900/15 flex items-center gap-2.5 hover:bg-[#23471F] transition transform hover:-translate-y-0.5 cursor-pointer text-sm sm:text-base"
              >
                <span>Découvrir nos produits</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveTab('contact')}
                className="px-8 py-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition cursor-pointer text-sm sm:text-base"
              >
                Nous contacter
              </button>
            </div>

            {/* Stat Counters */}
            <motion.div 
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25, ease: [0.25, 1, 0.5, 1] }}
              className="flex items-center gap-10 pt-8 border-t border-[#E0E0E0]"
            >
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-[#1B3022]">{products.length || 12}+</p>
                <p className="text-xs text-gray-500 uppercase tracking-tighter font-semibold">Produits Phares</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-[#1B3022]">100%</p>
                <p className="text-xs text-gray-500 uppercase tracking-tighter font-semibold">Naturel & Pur</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-[#1B3022]">5k+</p>
                <p className="text-xs text-gray-500 uppercase tracking-tighter font-semibold">Clients Satisfaits</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column: Sleek Showcase Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 1, 0.5, 1] }}
            className="w-full lg:w-[420px] flex flex-col gap-5 shrink-0"
          >
            {/* Top Showcase Container */}
            <div 
              onClick={() => heroProduct && openProductDetail(heroProduct.id)}
              className="relative min-h-[420px] bg-[#2D5A27] rounded-[32px] p-8 overflow-hidden group shadow-xl cursor-pointer transition-transform duration-300 hover:shadow-2xl"
            >
              {/* Background gradient decorative circle */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#3E7D36] rounded-full -mr-20 -mt-20 opacity-50 pointer-events-none transition-transform duration-700 group-hover:scale-110"></div>

              <div className="relative z-10 h-full flex flex-col justify-between space-y-6">
                <div className="space-y-2">
                  <div className="bg-white/20 backdrop-blur-md w-fit px-3 py-1 rounded-full text-[10px] text-white font-bold uppercase tracking-wider">
                    Best Seller
                  </div>
                  <h3 className="text-white text-2xl sm:text-3xl font-bold leading-tight">
                    {heroProduct ? heroProduct.name : 'Piment Rouge en Poudre'}
                  </h3>
                </div>

                {/* Rotating Product Visual Box */}
                <div className="flex flex-col items-center justify-center py-2">
                  <div className="w-48 h-48 bg-[#FAF9F6] rounded-2xl shadow-inner border-4 border-white/20 flex items-center justify-center rotate-6 group-hover:rotate-0 transition-transform duration-500 overflow-hidden">
                    {heroProduct?.mainImage ? (
                      <img
                        src={heroProduct.mainImage}
                        alt={heroProduct.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="text-6xl select-none">🌶️</div>
                    )}
                  </div>
                </div>

                {/* Format & Price bottom bar */}
                <div className="flex items-center justify-between pt-2 border-t border-white/15">
                  <div className="text-white">
                    <p className="text-xs opacity-80 uppercase tracking-wide">Format</p>
                    <p className="font-bold text-sm sm:text-base">
                      {heroProduct ? heroProduct.format : '250g / 500g'}
                    </p>
                  </div>
                  <div className="text-white text-right">
                    <p className="text-xs opacity-80 uppercase tracking-wide">Prix</p>
                    <p className="text-2xl font-black italic text-emerald-200">
                      {heroProduct?.price || '2.500 CFA'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom 2 mini info cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-[#E0E0E0] rounded-2xl p-4 shadow-xs flex flex-col gap-1.5">
                <div className="w-8 h-8 bg-[#FFF3E0] rounded-lg flex items-center justify-center text-orange-600">
                  <Package className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-[#1B3022]">Arrivage</h4>
                <p className="text-[10px] text-gray-500 uppercase font-semibold">Nouveaux Stocks</p>
              </div>

              <div className="bg-white border border-[#E0E0E0] rounded-2xl p-4 shadow-xs flex flex-col gap-1.5">
                <div className="w-8 h-8 bg-[#E8F5E9] rounded-lg flex items-center justify-center text-[#2D5A27]">
                  <Truck className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-[#1B3022]">Livraison</h4>
                <p className="text-[10px] text-gray-500 uppercase font-semibold">Zone Urbaine</p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
