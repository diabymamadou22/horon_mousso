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
  HelpCircle,
  Wallet 
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
    <div className="py-6 sm:py-8 px-4 sm:px-8 lg:px-10 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <FadeInView direction="up" distance={20} duration={0.6}>
        <div className="space-y-2 text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-emerald-100/80 text-[#0F2916] text-xs font-black uppercase tracking-wider rounded-full border border-emerald-300/40">
            <MessageCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Service Client & Relations Partenaires</span>
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0B1E11] tracking-tight font-serif-heading">
            Prenez Contact avec Notre Équipe
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-medium">
            Particulier amateur de saveurs, chef de restaurant ou distributeur, nous sommes à votre disposition pour vous conseiller et expédier vos commandes avec réactivité.
          </p>
        </div>
      </FadeInView>

      {/* Main Grid: Info + Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left info column */}
        <div className="lg:col-span-5 space-y-4">
          <FadeInView direction="up" distance={20} delay={0.1} duration={0.6}>
            <div className="space-y-4">
              {/* Quick WhatsApp Banner */}
              <div className="bg-gradient-to-r from-[#0A180E] via-[#0F2916] to-[#163D20] text-white rounded-2xl p-5 shadow-xl border border-emerald-600/30 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300 border border-white/10">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base font-serif-heading text-white">Contact WhatsApp Direct</h3>
                    <p className="text-[11px] text-stone-300">Réponse rapide en quelques instants</p>
                  </div>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed font-medium">
                  Pour une question urgente, une précision sur les piments ou une commande sur-mesure, écrivez-nous directement sur WhatsApp.
                </p>
                <button
                  type="button"
                  onClick={() => openOrderWhatsApp()}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#B82B2B] to-[#D93838] hover:from-[#A02222] hover:to-[#C02E2E] text-white font-extrabold text-xs py-2.5 px-4 rounded-xl shadow-lg transition cursor-pointer border border-red-400/30"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Ouvrir WhatsApp ({settings.whatsapp || settings.phone})</span>
                </button>
              </div>

              {/* Details Card */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E0E0E0] shadow-xs space-y-4">
                <h3 className="font-extrabold text-base text-[#1B3022] flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#2D5A27]" />
                  <span>Coordonnées de l'Entreprise</span>
                </h3>

                <div className="space-y-3 text-xs text-gray-700">
                  <div className="flex items-start gap-2.5">
                    <PhoneCall className="w-3.5 h-3.5 text-[#2D5A27] mt-0.5 shrink-0" />
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Téléphone</div>
                      <a href={`tel:${settings.phone.replace(/\s+/g, '')}`} className="font-semibold text-[#1B3022] hover:text-[#2D5A27] transition">
                        {settings.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Mail className="w-3.5 h-3.5 text-[#2D5A27] mt-0.5 shrink-0" />
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Email commercial</div>
                      <a href={`mailto:${settings.email}`} className="font-semibold text-[#1B3022] hover:text-[#2D5A27] transition">
                        {settings.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-3.5 h-3.5 text-[#2D5A27] mt-0.5 shrink-0" />
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Adresse & Siège</div>
                      <div className="font-medium text-[#1B3022]">{settings.address}</div>
                      <div className="text-[11px] text-gray-500">{settings.cityCountry}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Clock className="w-3.5 h-3.5 text-[#2D5A27] mt-0.5 shrink-0" />
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Horaires d'ouverture</div>
                      <div className="font-medium text-[#1B3022]">{settings.openingHours}</div>
                    </div>
                  </div>
                </div>

                {/* Note */}
                <div className="p-2.5 rounded-xl bg-[#FAF9F6] border border-[#E0E0E0] text-[11px] text-gray-500 flex items-start gap-2">
                  <HelpCircle className="w-3.5 h-3.5 text-[#2D5A27] shrink-0 mt-0.5" />
                  <span>
                    Ces coordonnées sont personnalisables à tout moment depuis le tableau de bord administrateur.
                  </span>
                </div>
              </div>

              {/* Mobile Money Payment Info Card */}
              {(settings.waveNumber || settings.orangeMoneyNumber || settings.mtnMoMoNumber || settings.moovMoneyNumber) && (
                <div className="bg-white rounded-2xl p-5 border border-[#E0E0E0] shadow-xs space-y-3">
                  <h3 className="font-extrabold text-sm text-[#1B3022] flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-[#2D5A27]" />
                    <span>Moyens de Règlement & Mobile Money</span>
                  </h3>
                  <p className="text-xs text-gray-500">
                    Pour régler vos acomptes ou vos factures après confirmation de votre commande :
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {settings.waveNumber && (
                      <div className="p-2 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-between text-xs">
                        <span className="font-bold text-sky-900">Wave :</span>
                        <span className="font-extrabold text-sky-800">{settings.waveNumber}</span>
                      </div>
                    )}
                    {settings.orangeMoneyNumber && (
                      <div className="p-2 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-between text-xs">
                        <span className="font-bold text-orange-900">Orange Money :</span>
                        <span className="font-extrabold text-orange-800">{settings.orangeMoneyNumber}</span>
                      </div>
                    )}
                    {settings.mtnMoMoNumber && (
                      <div className="p-2 rounded-xl bg-yellow-50 border border-yellow-100 flex items-center justify-between text-xs">
                        <span className="font-bold text-yellow-900">MTN MoMo :</span>
                        <span className="font-extrabold text-yellow-800">{settings.mtnMoMoNumber}</span>
                      </div>
                    )}
                    {settings.moovMoneyNumber && (
                      <div className="p-2 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-between text-xs">
                        <span className="font-bold text-blue-900">Moov Money :</span>
                        <span className="font-extrabold text-blue-800">{settings.moovMoneyNumber}</span>
                      </div>
                    )}
                  </div>

                  {settings.paymentInstructions && (
                    <div className="text-[11px] text-gray-600 bg-stone-50 p-2 rounded-lg border border-stone-200 leading-relaxed">
                      <strong>Consignes :</strong> {settings.paymentInstructions}
                    </div>
                  )}
                </div>
              )}
            </div>
          </FadeInView>
        </div>

        {/* Right Form column */}
        <div className="lg:col-span-7">
          <FadeInView direction="up" distance={20} delay={0.2} duration={0.6}>
            <div className="bg-white rounded-2xl p-5 sm:p-7 border border-[#E0E0E0] shadow-xs space-y-4">
              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-[#1B3022]">
                  Envoyez-nous un Message
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Remplissez ce formulaire pour nous poser une question, demander un devis ou commander un lot spécifique. Votre message sera directement transmis à notre espace administrateur.
                </p>
              </div>

              {submittedSuccess && (
                <div className="p-3.5 rounded-xl bg-[#E8F5E9] border border-[#2D5A27]/30 text-[#1B3022] text-xs flex items-start gap-2.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-[#2D5A27] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-[#2D5A27]">Message envoyé avec succès !</div>
                    <p className="text-gray-700 mt-0.5">
                      Merci pour votre prise de contact. Notre équipe a bien reçu votre demande et vous recontactera très prochainement.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Votre Nom ou Nom de l'Entreprise <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Kouamé Jean / Restaurant Le Piment d’Or"
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#E0E0E0] rounded-xl text-[#1B3022] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A27] focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Téléphone ou Email pour vous répondre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="Ex: +225 07 00 00 00 / kouame@email.com"
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#E0E0E0] rounded-xl text-[#1B3022] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A27] focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Votre Message ou Détail de Commande <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Indiquez vos besoins (produits recherchés, quantités en kg ou sacs, lieu de livraison souhaité, questions diverses)..."
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#E0E0E0] rounded-xl text-[#1B3022] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A27] focus:bg-white transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#2D5A27] hover:bg-[#23471F] text-white font-bold py-3 px-5 rounded-xl shadow-md transition disabled:opacity-50 text-xs sm:text-sm cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
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
