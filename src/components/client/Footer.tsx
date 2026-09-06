import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  PhoneCall, 
  Mail, 
  MapPin, 
  Clock, 
  MessageCircle, 
  Lock, 
  Leaf
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings, setActiveTab, setIsAdminMode, openOrderWhatsApp } = useApp();

  return (
    <footer className="bg-white text-[#2D3436] border-t border-[#E0E0E0] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Brand info */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#2D5A27] flex items-center justify-center text-white font-bold shrink-0">
                {settings.logo ? (
                  <img 
                    src={settings.logo} 
                    alt="" 
                    className="w-full h-full object-cover rounded-lg"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-5 h-5 border-2 border-white rounded-full"></div>
                )}
              </div>
              <div className="font-bold text-lg text-[#1B3022] tracking-tight">
                {settings.companyName}
              </div>
            </div>

            <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
              {settings.shortDescription || "Commerce et valorisation de produits agricoles, piments séchés et épices pures de qualité artisanale."}
            </p>

            <div className="pt-2 text-xs text-[#2D5A27] font-semibold flex items-center gap-2">
              <Leaf className="w-4 h-4 text-[#2D5A27] shrink-0" />
              <span>Transformation & Valorisation Agricole Locale</span>
            </div>
          </div>

          {/* Quick links */}
          <div className="lg:col-span-3 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[#1B3022]">
              Navigation
            </div>
            <ul className="space-y-2 text-xs font-medium text-gray-500">
              <li>
                <button onClick={() => setActiveTab('accueil')} className="hover:text-[#2D5A27] transition cursor-pointer">
                  Accueil
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('produits')} className="hover:text-[#2D5A27] transition cursor-pointer">
                  Catalogue Produits
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('actualites')} className="hover:text-[#2D5A27] transition cursor-pointer">
                  Actualités & Nouveautés
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('galerie')} className="hover:text-[#2D5A27] transition cursor-pointer">
                  Galerie Photos & Vidéos
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('a_propos')} className="hover:text-[#2D5A27] transition cursor-pointer">
                  À Propos de l'Entreprise
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('contact')} className="hover:text-[#2D5A27] transition cursor-pointer">
                  Nous Contacter
                </button>
              </li>
            </ul>
          </div>

          {/* Contact coordinates */}
          <div className="lg:col-span-5 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[#1B3022]">
              Coordonnées & Commandes
            </div>
            <div className="space-y-2.5 text-xs text-gray-600">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#2D5A27] shrink-0 mt-0.5" />
                <span>{settings.address}, {settings.cityCountry}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <PhoneCall className="w-4 h-4 text-[#2D5A27] shrink-0" />
                <a href={`tel:${settings.phone.replace(/\s+/g, '')}`} className="hover:text-[#2D5A27] transition">
                  {settings.phone}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#2D5A27] shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-[#2D5A27] transition">
                  {settings.email}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#2D5A27] shrink-0" />
                <span>{settings.openingHours}</span>
              </div>
            </div>

            <div className="pt-3 flex flex-wrap items-center gap-3">
              <button
                onClick={() => openOrderWhatsApp()}
                className="inline-flex items-center gap-2 bg-[#C53030] hover:bg-[#A62828] text-white text-xs font-semibold py-2 px-4 rounded-full shadow-md shadow-red-100 transition cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp : {settings.whatsapp || settings.phone}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar matching Sleek Interface design */}
        <div className="mt-12 pt-6 border-t border-[#E0E0E0] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-6">
            <span>© {new Date().getFullYear()} {settings.companyName}. Tous droits réservés.</span>
            <span className="hidden sm:inline hover:underline cursor-pointer">Politique de Confidentialité</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 text-xs text-[#2D5A27] font-bold bg-[#E8F5E9] px-3 py-1 rounded-full">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Unité de Production Ouverte
            </span>

            <button
              onClick={() => setIsAdminMode(true)}
              className="inline-flex items-center gap-1.5 text-gray-400 hover:text-[#2D5A27] font-medium transition cursor-pointer py-1 px-2.5 rounded hover:bg-stone-100"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Accès Admin</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
