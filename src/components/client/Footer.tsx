import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  PhoneCall, 
  Mail, 
  MapPin, 
  Clock, 
  MessageCircle, 
  Lock, 
  Leaf,
  Sparkles,
  ShieldCheck,
  Heart
} from 'lucide-react';
import { PWAInstallButton } from '../common/PWAInstallButton';

export const Footer: React.FC = () => {
  const { settings, setActiveTab, setIsAdminMode, openOrderWhatsApp } = useApp();

  return (
    <footer className="bg-[#0D2214] text-stone-300 border-t border-emerald-950 mt-auto relative overflow-hidden">
      {/* Decorative ambient subtle glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* Brand info */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-[#0F2818] p-0.5 shadow-lg border border-emerald-500/30 flex items-center justify-center shrink-0">
                {settings.logo ? (
                  <img 
                    src={settings.logo} 
                    alt="" 
                    className="w-full h-full object-cover rounded-[14px]"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <Leaf className="w-6 h-6 text-emerald-300" />
                )}
              </div>
              <div>
                <div className="font-extrabold text-xl text-white tracking-tight font-serif-heading">
                  {settings.companyName || 'Horon Mousso'}
                </div>
                <div className="text-xs text-amber-400 font-semibold tracking-wider uppercase">
                  Épicerie Fine • Terroir & Gastronomie
                </div>
              </div>
            </div>

            <p className="text-stone-400 text-xs sm:text-sm leading-relaxed max-w-md">
              {settings.shortDescription || "Sélection noble de piments séchés au soleil, véritable soumbala de Sikasso et mélanges culinaires purs 100% naturels."}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-900/50 text-emerald-300 rounded-full border border-emerald-700/40">
                <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% Naturel & Sans additif</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-950/50 text-amber-300 rounded-full border border-amber-800/40">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Qualité Terroir Malien</span>
              </span>
            </div>
          </div>

          {/* Quick links */}
          <div className="lg:col-span-3 space-y-3">
            <div className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Découvrir
            </div>
            <ul className="space-y-2.5 text-xs font-medium text-stone-400">
              <li>
                <button 
                  type="button"
                  onClick={() => setActiveTab('accueil')} 
                  className="hover:text-emerald-300 transition cursor-pointer text-left"
                >
                  Accueil & Découverte
                </button>
              </li>
              <li>
                <button 
                  type="button"
                  onClick={() => setActiveTab('produits')} 
                  className="hover:text-emerald-300 transition cursor-pointer text-left flex items-center gap-1.5"
                >
                  <span>Nos Piments & Épices</span>
                  <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded">
                    Boutique
                  </span>
                </button>
              </li>
              <li>
                <button 
                  type="button"
                  onClick={() => setActiveTab('actualites')} 
                  className="hover:text-emerald-300 transition cursor-pointer text-left"
                >
                  Actualités & Nouveautés
                </button>
              </li>
              <li>
                <button 
                  type="button"
                  onClick={() => setActiveTab('galerie')} 
                  className="hover:text-emerald-300 transition cursor-pointer text-left"
                >
                  Galerie & Récoltes en Vidéo
                </button>
              </li>
              <li>
                <button 
                  type="button"
                  onClick={() => setActiveTab('a_propos')} 
                  className="hover:text-emerald-300 transition cursor-pointer text-left"
                >
                  Notre Histoire & Engagements
                </button>
              </li>
              <li>
                <button 
                  type="button"
                  onClick={() => setActiveTab('contact')} 
                  className="hover:text-emerald-300 transition cursor-pointer text-left"
                >
                  Nous Contacter
                </button>
              </li>
            </ul>
          </div>

          {/* Contact coordinates */}
          <div className="lg:col-span-4 space-y-3">
            <div className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Commandes & Contact Direct
            </div>
            <div className="space-y-3 text-xs text-stone-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{settings.address}, {settings.cityCountry}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href={`tel:${settings.phone.replace(/\s+/g, '')}`} className="hover:text-emerald-300 transition font-medium">
                  {settings.phone}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-emerald-300 transition">
                  {settings.email}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{settings.openingHours || 'Lun - Sam : 08h00 - 18h30'}</span>
              </div>
            </div>

            <div className="pt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => openOrderWhatsApp()}
                className="inline-flex items-center gap-2 bg-[#B82B2B] hover:bg-[#A32222] text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-lg transition cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Commander sur WhatsApp</span>
              </button>

              <PWAInstallButton variant="footer" />
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-6 border-t border-emerald-900/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <div className="flex items-center gap-4">
            <span>© {new Date().getFullYear()} {settings.companyName}. Fait avec passion au Mali.</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 text-xs text-emerald-300 font-medium bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800/60">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              Livraisons Ouvertes à Bamako
            </span>

            <button
              type="button"
              onClick={() => setIsAdminMode(true)}
              className="inline-flex items-center gap-1.5 text-stone-500 hover:text-emerald-300 font-medium transition cursor-pointer py-1 px-2.5 rounded hover:bg-emerald-950"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Administration</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
