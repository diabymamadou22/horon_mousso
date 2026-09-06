import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FadeInView } from '../common/FadeInView';
import { 
  PhoneCall, 
  MessageCircle, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  Building2, 
  HelpCircle 
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { settings, sendContactMessage, openOrderWhatsApp } = useApp();
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contact.trim() || !message.trim()) return;

    setIsSubmitting(true);
    const success = await sendContactMessage(name, contact, message);
    setIsSubmitting(false);

    if (success) {
      setSubmittedSuccess(true);
      setName('');
      setContact('');
      setMessage('');
      setTimeout(() => setSubmittedSuccess(false), 7000);
    }
  };

  return (
    <div className="py-12 px-4 sm:px-8 lg:px-10 max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <FadeInView direction="up" distance={20} duration={0.6}>
        <div className="space-y-3 text-center max-w-2xl mx-auto">
          <span className="inline-block px-3 py-1 bg-[#E8F5E9] text-[#2D5A27] text-xs font-bold uppercase tracking-widest rounded-md">
            Contact & Commandes
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1B3022] tracking-tight">
            Prenez Contact avec Notre Équipe Commerciale
          </h1>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            Que vous soyez un particulier, un restaurateur, un grossiste ou une coopérative, nous sommes à votre disposition pour vous conseiller et traiter vos commandes avec réactivité.
          </p>
        </div>
      </FadeInView>

      {/* Main Grid: Info + Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left info column */}
        <div className="lg:col-span-5 space-y-6">
          <FadeInView direction="up" distance={20} delay={0.1} duration={0.6}>
            <div className="space-y-6">
              {/* Quick WhatsApp Banner */}
              <div className="bg-[#2D5A27] text-white rounded-3xl p-6 shadow-md space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-200">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Contact WhatsApp Direct</h3>
                    <p className="text-xs text-emerald-100">Réponse rapide garantie en quelques minutes</p>
                  </div>
                </div>
                <p className="text-xs text-emerald-100 leading-relaxed">
                  Pour une question urgente, un devis de gros ou une confirmation de stock immédiate, démarrez un échange direct avec notre équipe commerciale.
                </p>
                <button
                  onClick={() => openOrderWhatsApp()}
                  className="w-full flex items-center justify-center gap-2 bg-[#C53030] text-white hover:bg-[#A62828] font-bold text-sm py-3 px-4 rounded-full shadow-lg shadow-red-950/20 transition transform active:scale-98 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Ouvrir WhatsApp ({settings.whatsapp || settings.phone})</span>
                </button>
              </div>

              {/* Details Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E0E0E0] shadow-xs space-y-6">
                <h3 className="font-extrabold text-lg text-[#1B3022] flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#2D5A27]" />
                  <span>Coordonnées de l'Entreprise</span>
                </h3>

                <div className="space-y-4 text-sm text-gray-700">
                  <div className="flex items-start gap-3">
                    <PhoneCall className="w-4 h-4 text-[#2D5A27] mt-1 shrink-0" />
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Téléphone</div>
                      <a href={`tel:${settings.phone.replace(/\s+/g, '')}`} className="font-semibold text-[#1B3022] hover:text-[#2D5A27] transition">
                        {settings.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-[#2D5A27] mt-1 shrink-0" />
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Email commercial</div>
                      <a href={`mailto:${settings.email}`} className="font-semibold text-[#1B3022] hover:text-[#2D5A27] transition">
                        {settings.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-[#2D5A27] mt-1 shrink-0" />
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Adresse & Siège</div>
                      <div className="font-medium text-[#1B3022]">{settings.address}</div>
                      <div className="text-xs text-gray-500">{settings.cityCountry}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-[#2D5A27] mt-1 shrink-0" />
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Horaires d'ouverture</div>
                      <div className="font-medium text-[#1B3022]">{settings.openingHours}</div>
                    </div>
                  </div>
                </div>

                {/* Note */}
                <div className="p-3.5 rounded-xl bg-[#FAF9F6] border border-[#E0E0E0] text-xs text-gray-500 flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-[#2D5A27] shrink-0 mt-0.5" />
                  <span>
                    Ces coordonnées sont personnalisables à tout moment depuis le tableau de bord administrateur.
                  </span>
                </div>
              </div>
            </div>
          </FadeInView>
        </div>

        {/* Right Form column */}
        <div className="lg:col-span-7">
          <FadeInView direction="up" distance={20} delay={0.2} duration={0.6}>
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E0E0E0] shadow-xs space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold text-[#1B3022]">
                  Envoyez-nous un Message
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Remplissez ce formulaire pour nous poser une question, demander un devis ou commander un lot spécifique. Votre message sera directement transmis à notre espace administrateur.
                </p>
              </div>

              {submittedSuccess && (
                <div className="p-4 rounded-2xl bg-[#E8F5E9] border border-[#2D5A27]/30 text-[#1B3022] text-xs sm:text-sm flex items-start gap-3 animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-[#2D5A27] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-[#2D5A27]">Message envoyé avec succès !</div>
                    <p className="text-gray-700 mt-0.5">
                      Merci pour votre prise de contact. Notre équipe a bien reçu votre demande et vous recontactera très prochainement.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                    Votre Nom ou Nom de l'Entreprise <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Kouamé Jean / Restaurant Le Piment d’Or"
                    className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#E0E0E0] rounded-xl text-[#1B3022] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A27] focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                    Téléphone ou Email pour vous répondre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="Ex: +225 07 00 00 00 / kouame@email.com"
                    className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#E0E0E0] rounded-xl text-[#1B3022] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A27] focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                    Votre Message ou Détail de Commande <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Indiquez vos besoins (produits recherchés, quantités en kg ou sacs, lieu de livraison souhaité, questions diverses)..."
                    className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#E0E0E0] rounded-xl text-[#1B3022] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A27] focus:bg-white transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#2D5A27] hover:bg-[#23471F] text-white font-bold py-4 px-6 rounded-xl shadow-md transition disabled:opacity-50 text-sm cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Transmission en cours...' : 'Envoyer mon message'}</span>
                </button>
              </form>
            </div>
          </FadeInView>
        </div>
      </div>
    </div>
  );
};
