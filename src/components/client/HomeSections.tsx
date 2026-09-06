import React from 'react';
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
  TrendingUp,
  Award
} from 'lucide-react';

export const HomeSections: React.FC = () => {
  const { products, announcements, settings, setActiveTab, openAnnouncementDetail, openOrderWhatsApp } = useApp();

  // Highlight featured products
  const featuredProducts = products.filter(p => p.isFeatured).slice(0, 4);
  const displayProducts = featuredProducts.length > 0 ? featuredProducts : products.slice(0, 4);

  // New arrivals
  const newProducts = products.filter(p => p.isNew).slice(0, 4);

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

  return (
    <div className="space-y-24 py-16 px-4 sm:px-8 lg:px-10 max-w-7xl mx-auto">
      {/* 1. Section « Nos Produits Phares » */}
      <FadeInView direction="up" distance={30} duration={0.65}>
        <section className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <span className="inline-block px-3 py-1 bg-[#E8F5E9] text-[#2D5A27] text-xs font-bold uppercase tracking-widest rounded-md">
                Gamme Sélection
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1B3022] tracking-tight">
                Nos Produits Phares du Terroir
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                Piments rouges en poudre, piments entiers séchés, gingembre et mélanges d'épices prêts à sublimer vos préparations.
              </p>
            </div>

            <button
              onClick={() => setActiveTab('produits')}
              className="inline-flex items-center gap-2 text-[#2D5A27] hover:text-[#1B3022] font-bold text-sm transition group cursor-pointer"
            >
              <span>Consulter tous les produits ({products.length})</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </button>
          </div>

          <FadeInStagger staggerDelay={0.09} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayProducts.map(product => (
              <FadeInItem key={product.id}>
                <ProductCard product={product} />
              </FadeInItem>
            ))}
          </FadeInStagger>
        </section>
      </FadeInView>

      {/* 2. Section « Nos Nouveautés » (si présentes) */}
      {newProducts.length > 0 && (
        <FadeInView direction="up" distance={30} duration={0.65}>
          <section className="space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-[#E0E0E0] shadow-xs">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2">
                <span className="inline-block px-3 py-1 bg-red-50 text-[#C53030] text-xs font-bold uppercase tracking-widest rounded-md">
                  Récemment Arrivé
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1B3022] tracking-tight">
                  Nos Nouveautés & Recettes Récentes
                </h2>
                <p className="text-gray-600 text-sm">
                  Découvrez les derniers produits transformés issus de nos nouveaux ateliers de séchage.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('produits')}
                className="inline-flex items-center gap-2 text-gray-700 hover:text-[#2D5A27] font-bold text-sm transition cursor-pointer"
              >
                <span>Voir les nouveautés</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <FadeInStagger staggerDelay={0.09} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newProducts.map(product => (
                <FadeInItem key={product.id}>
                  <ProductCard product={product} />
                </FadeInItem>
              ))}
            </FadeInStagger>
          </section>
        </FadeInView>
      )}

      {/* 3. Section « Présentation Brève de l'Entreprise » */}
      <FadeInView direction="up" distance={36} duration={0.7}>
        <section className="bg-[#1B3022] text-white rounded-[32px] p-8 sm:p-12 lg:p-14 overflow-hidden relative shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-block px-3 py-1 bg-[#2D5A27] text-emerald-200 text-xs font-bold uppercase tracking-widest rounded-md">
                Notre Savoir-Faire Agricole
              </span>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
                De la Récolte au Sachet : Une Transformation Artisanale d’Excellence
              </h2>

              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                Chez {settings.companyName}, nous valorisons chaque récolte maraîchère. Nous travaillons main dans la main avec nos producteurs locaux pour déshydrater, moudre et conditionner le piment et les épices avec la plus stricte rigueur sanitaire.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="flex items-start gap-3 bg-white/5 border border-white/10 p-4 rounded-2xl">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <div className="font-bold text-white mb-1">Qualité Sanitaire Rigoureuse</div>
                    <div className="text-gray-400">Nettoyage à l'eau claire et séchage hygiénique thermorégulé.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/5 border border-white/10 p-4 rounded-2xl">
                  <Award className="w-5 h-5 text-[#C53030] shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <div className="font-bold text-white mb-1">100% Naturel & Pur</div>
                    <div className="text-gray-400">Zéro colorant artificiel, zéro additif chimique ni farine de charge.</div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => setActiveTab('a_propos')}
                  className="inline-flex items-center gap-2 bg-[#2D5A27] hover:bg-[#3E7D36] text-white font-bold px-6 py-3.5 rounded-xl shadow-md transition cursor-pointer text-sm"
                >
                  <span>En savoir plus sur notre entreprise</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="aspect-4/3 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80"
                  alt="Transformation des épices"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </section>
      </FadeInView>

      {/* 4. Section « Nos Dernières Annonces » */}
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
                <p className="text-gray-600 text-sm">
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
                    className="h-full bg-white rounded-2xl border border-[#E0E0E0] shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col group cursor-pointer hover:border-[#2D5A27]/40"
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
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
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
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Calendar className="w-3.5 h-3.5 text-[#2D5A27]" />
                          <span>{formatDate(ann.date || ann.createdAt)}</span>
                        </div>
                        <h3 className="font-bold text-base text-[#1B3022] group-hover:text-[#2D5A27] transition line-clamp-2 leading-snug">
                          {ann.title}
                        </h3>
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
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

      {/* 5. Section Contact & Prise de Commande Rapide */}
      <FadeInView direction="up" distance={32} duration={0.65}>
        <section className="bg-white border border-[#E0E0E0] rounded-[32px] p-8 sm:p-12 shadow-sm relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-6">
            <span className="inline-block px-3 py-1 bg-[#E8F5E9] text-[#2D5A27] text-xs font-bold uppercase tracking-widest rounded-md">
              Accès Direct Commercial
            </span>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1B3022] tracking-tight">
              Prêt à commander ou besoin d'un devis pour votre établissement ?
            </h2>

            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              Notre équipe répond à toutes vos demandes pour les formats de détail, demi-gros ou sacs industriels avec réactivité.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={() => openOrderWhatsApp()}
                className="inline-flex items-center gap-2.5 bg-[#C53030] hover:bg-[#A62828] text-white font-bold px-7 py-3.5 rounded-full shadow-lg shadow-red-100 transition transform hover:-translate-y-0.5 cursor-pointer text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Commander sur WhatsApp</span>
              </button>

              <button
                onClick={() => setActiveTab('contact')}
                className="inline-flex items-center gap-2 bg-[#2D5A27] hover:bg-[#23471F] text-white font-semibold px-6 py-3.5 rounded-xl transition cursor-pointer text-sm"
              >
                <span>Accéder à la page Contact</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                className="inline-flex items-center gap-2 text-gray-700 hover:text-[#2D5A27] font-semibold text-xs sm:text-sm px-3 py-2 transition"
              >
                <PhoneCall className="w-4 h-4 text-[#2D5A27]" />
                <span>{settings.phone}</span>
              </a>
            </div>
          </div>
        </section>
      </FadeInView>
    </div>
  );
};

