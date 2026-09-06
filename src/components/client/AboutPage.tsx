import React from 'react';
import { useApp } from '../../context/AppContext';
import { FadeInView, FadeInStagger, FadeInItem } from '../common/FadeInView';
import { 
  Building2, 
  Leaf, 
  Eye, 
  Target, 
  Award, 
  Handshake, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Info
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { settings, setActiveTab, openOrderWhatsApp } = useApp();

  return (
    <div className="py-12 px-4 sm:px-8 lg:px-10 max-w-7xl mx-auto space-y-16">
      {/* Notice Banner */}
      <FadeInView direction="up" distance={15} duration={0.5}>
        <div className="bg-[#FAF9F6] border border-[#E0E0E0] rounded-2xl p-4 flex items-start gap-3 text-gray-700 text-xs sm:text-sm">
          <Info className="w-5 h-5 text-[#2D5A27] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-[#1B3022]">Contenu personnalisable :</p>
            <p className="text-gray-600 leading-relaxed">
              Les textes, missions et coordonnées ci-dessous sont modifiables à tout moment depuis l’onglet « Paramètres » de l’espace Admin.
            </p>
          </div>
        </div>
      </FadeInView>

      {/* Header / Intro */}
      <FadeInView direction="up" distance={20} duration={0.6}>
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="inline-block px-3 py-1 bg-[#E8F5E9] text-[#2D5A27] text-xs font-bold uppercase tracking-widest rounded-md">
            À Propos de l'Entreprise
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1B3022] tracking-tight">
            L’Art de Sublimer les Trésors Agricoles de Notre Terroir
          </h1>
          <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
            {settings.slogan}
          </p>
        </div>
      </FadeInView>

      {/* Qui sommes-nous & Notre activité */}
      <FadeInView direction="up" distance={25} duration={0.7}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="inline-block px-3 py-1 bg-[#E8F5E9] text-[#2D5A27] text-xs font-bold uppercase tracking-widest rounded-md">
              Qui sommes-nous ?
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1B3022] leading-snug">
              Une entreprise engagée dans la valorisation des récoltes locales
            </h2>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
              Fondée pour répondre au défi de la conservation et de la commercialisation des cultures maraîchères, notre entreprise s'est spécialisée dans la sélection, la déshydratation hygiénique, le broyage à froid et le conditionnement d'épices d’exception : piments rouges, piments séchés, gingembre sauvage, curcuma doré et mélanges d’épices signature.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed">
              Nous transformons des matières premières fraîches récoltées à leur apogée gustatif afin d’offrir aux familles, aux restaurateurs et aux négociants des produits sains, puissants en arôme et d’une durée de conservation prolongée sans recourir aux conservateurs chimiques.
            </p>

            <div className="pt-2 grid grid-cols-2 gap-4 text-xs font-medium text-gray-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2D5A27] shrink-0" />
                <span>Séchage thermorégulé</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2D5A27] shrink-0" />
                <span>Mouture fine & pureté 100%</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2D5A27] shrink-0" />
                <span>Zéro colorant artificiel</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2D5A27] shrink-0" />
                <span>Conditionnements étanches</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="rounded-3xl overflow-hidden shadow-xs border border-[#E0E0E0] aspect-4/5">
              <img
                src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80"
                alt="Transformation d'épices"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="space-y-4">
              <div className="rounded-3xl overflow-hidden shadow-xs border border-[#E0E0E0] aspect-square">
                <img
                  src="https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?auto=format&fit=crop&w=600&q=80"
                  alt="Piments rouges moulus"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-6 rounded-3xl bg-[#2D5A27] text-white flex flex-col justify-center space-y-2">
                <div className="text-3xl font-black text-emerald-200">+45</div>
                <div className="text-xs font-semibold uppercase tracking-wider text-emerald-100">
                  Producteurs & maraîchers partenaires
                </div>
              </div>
            </div>
          </div>
        </div>
      </FadeInView>

      {/* Vision & Mission Cards */}
      <FadeInStagger staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FadeInItem>
          <div className="h-full bg-white rounded-3xl p-8 border border-[#E0E0E0] shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] text-[#2D5A27] flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#1B3022]">Notre Mission</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {settings.mission || 'Fournir à nos clients des épices et piments transformés avec la plus grande rigueur sanitaire, valoriser les savoir-faire agricoles locaux et réduire le gaspillage post-récolte en créant de la valeur ajoutée sur le territoire.'}
            </p>
          </div>
        </FadeInItem>

        <FadeInItem>
          <div className="h-full bg-white rounded-3xl p-8 border border-[#E0E0E0] shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#C53030] flex items-center justify-center">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#1B3022]">Notre Vision</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {settings.vision || 'Devenir un modèle de référence en agro-transformation locale et régionale, capable d\'approvisionner les marchés nationaux et internationaux avec des produits sains, traçables et fiers de leurs origines.'}
            </p>
          </div>
        </FadeInItem>
      </FadeInStagger>

      {/* Qualité & Engagement Producteurs */}
      <FadeInView direction="up" distance={25} duration={0.7}>
        <div className="bg-[#1B3022] text-white rounded-[32px] p-8 sm:p-12 space-y-8 shadow-lg">
          <div className="max-w-2xl space-y-3">
            <span className="inline-block px-3 py-1 bg-[#2D5A27] text-emerald-200 text-xs font-bold uppercase tracking-widest rounded-md">
              Nos Engagements Fondamentaux
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold">
              Qualité alimentaire irréprochable & commerce équitable
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-white/10">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 text-emerald-300 flex items-center justify-center">
                  <Leaf className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-lg text-white">Qualité des Produits & Hygiène</h4>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                {settings.qualityCommitment || 'Nos lots subissent un nettoyage approfondi, un triage manuel éliminant les impuretés et un séchage contrôlé pour maintenir un taux d\'humidité idéal empêchant tout développement microbien.'}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 text-[#C53030] flex items-center justify-center">
                  <Handshake className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-lg text-white">Engagement envers nos Producteurs</h4>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                {settings.producersCommitment || 'Nous achetons directement aux coopératives agricoles maraîchères à un prix rémunérateur garanti, apportant aux familles d\'agriculteurs une source de revenus stable et prévisible.'}
              </p>
            </div>
          </div>
        </div>
      </FadeInView>

      {/* Call to action */}
      <FadeInView direction="up" distance={20} duration={0.6}>
        <div className="text-center space-y-6 pt-4">
          <h3 className="text-2xl font-bold text-[#1B3022]">
            Envie de collaborer ou de commander nos produits ?
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => setActiveTab('produits')}
              className="inline-flex items-center gap-2 bg-[#2D5A27] hover:bg-[#23471F] text-white font-bold px-6 py-3.5 rounded-xl transition cursor-pointer text-sm"
            >
              <span>Consulter notre catalogue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => openOrderWhatsApp()}
              className="inline-flex items-center gap-2 bg-[#C53030] hover:bg-[#A62828] text-white font-bold px-6 py-3.5 rounded-full shadow-lg shadow-red-100 transition cursor-pointer text-sm"
            >
              <span>Commander sur WhatsApp</span>
            </button>
          </div>
        </div>
      </FadeInView>
    </div>
  );
};
