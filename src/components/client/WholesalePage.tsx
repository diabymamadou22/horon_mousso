import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Calculator, 
  FileSpreadsheet, 
  Send, 
  Printer, 
  CheckCircle2, 
  Sparkles, 
  Package, 
  Truck, 
  Award, 
  Utensils, 
  PhoneCall, 
  MessageCircle, 
  Download, 
  ChevronRight,
  ShieldCheck,
  Scale,
  DollarSign,
  Coffee
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatFCFA } from '../../utils/cartUtils';

interface WholesaleProductOption {
  id: string;
  name: string;
  category: string;
  basePricePerKg: number;
  minOrderKg: number;
  recommendedFor: string;
}

const wholesaleProducts: WholesaleProductOption[] = [
  {
    id: 'soumbala_pro',
    name: 'Soumbala de Néré Pur Artisanal (Boules ou Poudre)',
    category: 'Produits transformés',
    basePricePerKg: 4500,
    minOrderKg: 10,
    recommendedFor: 'Sauces traditionnelles, cantines, maquis & restaurants'
  },
  {
    id: 'piment_noir_pro',
    name: 'Piment Noir Fort d\'Afrique (Séchage Solaire Doux)',
    category: 'Piments',
    basePricePerKg: 5000,
    minOrderKg: 10,
    recommendedFor: 'Assaisonnements puissants, grillades & dibiteries'
  },
  {
    id: 'poivre_guinee_pro',
    name: 'Poivre Sauvage de Guinée (Graines entières ou moulu)',
    category: 'Épices d\'exception',
    basePricePerKg: 7000,
    minOrderKg: 5,
    recommendedFor: 'Chefs gastronomiques, marinades viandes & poissons'
  },
  {
    id: 'gingembre_pro',
    name: 'Gingembre Pur de Haute Terre (Mouture Fine Extra)',
    category: 'Épices',
    basePricePerKg: 4000,
    minOrderKg: 10,
    recommendedFor: 'Jus toniques, bouillons, pâtisserie & marinades'
  },
  {
    id: 'ail_seche_pro',
    name: 'Ail Blanc Pur Séché & Concassé',
    category: 'Épices',
    basePricePerKg: 4500,
    minOrderKg: 10,
    recommendedFor: 'Bases de cuisson, traiteurs & rôtisseries'
  },
  {
    id: 'mix_dibi_pro',
    name: 'Mélange Maître Dibi & Grillades (Recette Secrète)',
    category: 'Mélanges Signature',
    basePricePerKg: 5500,
    minOrderKg: 10,
    recommendedFor: 'Dibi d\'agneau, poulet braisé, brochettes & maquis'
  }
];

const volumeTiers = [
  { kg: 10, discountPercent: 10, label: '10 kg (Pack Découverte Pro)' },
  { kg: 25, discountPercent: 18, label: '25 kg (1 Sac Standard)' },
  { kg: 50, discountPercent: 25, label: '50 kg (2 Sacs Pro - Recommandé)' },
  { kg: 100, discountPercent: 32, label: '100 kg (Volume Restaurant / Traiteur)' },
  { kg: 250, discountPercent: 40, label: '250 kg+ (Grand Compte & Export)' }
];

export const WholesalePage: React.FC = () => {
  const { settings, showToast } = useApp();

  // Quote State
  const [selectedProductId, setSelectedProductId] = useState<string>(wholesaleProducts[0].id);
  const [selectedVolume, setSelectedVolume] = useState<number>(50);
  const [packagingType, setPackagingType] = useState<'sacs_pro' | 'jute' | 'sachets_revente'>('sacs_pro');
  const [clientCompany, setClientCompany] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientCity, setClientCity] = useState('Bamako');
  const [quoteNotes, setQuoteNotes] = useState('');
  const [showProformaModal, setShowProformaModal] = useState(false);
  const [showSampleModal, setShowSampleModal] = useState(false);

  // Selected product object
  const selectedProduct = useMemo(() => {
    return wholesaleProducts.find(p => p.id === selectedProductId) || wholesaleProducts[0];
  }, [selectedProductId]);

  // Volume tier determination
  const currentTier = useMemo(() => {
    return volumeTiers.reduce((prev, curr) => {
      return selectedVolume >= curr.kg ? curr : prev;
    }, volumeTiers[0]);
  }, [selectedVolume]);

  // Calculation math
  const calculations = useMemo(() => {
    const basePriceTotal = selectedProduct.basePricePerKg * selectedVolume;
    const discountAmount = Math.round((basePriceTotal * currentTier.discountPercent) / 100);
    
    // Packaging adjustment
    let packagingFee = 0;
    if (packagingType === 'sachets_revente') {
      packagingFee = selectedVolume * 250; // 250 FCFA extra par kg pour sachet revente
    } else if (packagingType === 'jute') {
      packagingFee = Math.ceil(selectedVolume / 25) * 1500; // 1500 FCFA par sac jute
    }

    const discountedTotal = basePriceTotal - discountAmount + packagingFee;
    const effectivePricePerKg = Math.round(discountedTotal / selectedVolume);

    return {
      basePriceTotal,
      discountAmount,
      packagingFee,
      discountedTotal,
      effectivePricePerKg
    };
  }, [selectedProduct, selectedVolume, currentTier, packagingType]);

  // Proforma Quote Number
  const quoteNumber = useMemo(() => {
    return `DEV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  }, []);

  const handleSendWhatsAppQuote = () => {
    if (!clientName.trim() || !clientPhone.trim()) {
      showToast('Veuillez renseigner votre nom et votre contact professionnel.', 'error');
      return;
    }

    const rawNumber = settings.whatsapp || settings.phone || '';
    const cleanNumber = rawNumber.replace(/[^0-9]/g, '');

    const message = 
`*DEMANDE DE DEVIS GROSSISTE - HORON MOUSSO* 🏛️
N° Référence : *${quoteNumber}*
--------------------------------------------
🏢 *Établissement :* ${clientCompany || 'Non renseigné'}
👤 *Responsable :* ${clientName}
📞 *Téléphone :* ${clientPhone}
📍 *Ville / Région :* ${clientCity}

📦 *PRODUIT :* ${selectedProduct.name}
⚖️ *Volume commandé :* ${selectedVolume} kg
🏷️ *Prix tarif normal :* ${formatFCFA(selectedProduct.basePricePerKg)} / kg
🎁 *Remise professionnelle :* -${currentTier.discountPercent}%
💰 *Prix remisé appliqué :* ${formatFCFA(calculations.effectivePricePerKg)} / kg
📦 *Conditionnement :* ${
  packagingType === 'sacs_pro' ? 'Sacs polypropylène doublés étanches (Standard)' :
  packagingType === 'jute' ? 'Sacs traditionnels en toile de jute siglés' : 'Sachets individuels étiquetés pour revente'
}

💵 *TOTAL ESTIMÉ :* ${formatFCFA(calculations.discountedTotal)}
${quoteNotes ? `\n📝 *Précisions spécifiques :* ${quoteNotes}` : ''}

Bonjour Horon Mousso, merci de me transmettre la facture proforma officielle et de me confirmer le délai de préparation.`;

    if (cleanNumber) {
      window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`, '_blank');
      showToast('Devis envoyé au service Grands Comptes !', 'success');
    }
  };

  const handlePrintQuote = () => {
    window.print();
  };

  return (
    <div className="space-y-12 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      {/* 1. HERO B2B */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#182F1E] via-[#122416] to-[#0A160D] text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-emerald-900/40">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5" />
            <span>Portail Restauration, Traiteurs & Grossistes</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Fournisseur d'Épices & Délices du Terroir en Gros
          </h1>

          <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
            Approvisionnez votre restaurant, hôtel, maquis ou boutique avec des épices 100% pures, fraîches et tracées. Bénéficiez de remises de volume jusqu'à <span className="text-amber-400 font-bold">-40%</span> et de factures normalisées.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <a
              href="#simulateur-devis"
              className="inline-flex items-center gap-2 bg-[#C53030] hover:bg-[#A62828] text-white font-bold px-6 py-3 rounded-xl transition cursor-pointer text-sm shadow-md"
            >
              <Calculator className="w-4 h-4" />
              <span>Simuler un Devis Instantané</span>
            </a>

            <button
              onClick={() => setShowSampleModal(true)}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-3 rounded-xl transition cursor-pointer text-sm border border-white/20"
            >
              <Utensils className="w-4 h-4 text-amber-300" />
              <span>Demander un Kit Échantillons Chef</span>
            </button>
          </div>
        </div>

        {/* Subtle decorative background badge */}
        <div className="absolute right-4 bottom-4 opacity-10 hidden md:block pointer-events-none">
          <Award className="w-64 h-64 text-emerald-300" />
        </div>
      </section>

      {/* 2. ENGAGEMENTS B2B & SÉCURITÉ FOURNISSEUR */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
            <Scale className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-stone-900 text-sm">Tarifs Dégressifs Transparents</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            De 10 kg à plusieurs tonnes, calculez votre coût au kilo immédiatement avec remises automatiques.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-stone-900 text-sm">Régularité & Zéro Falsification</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Garantie sans charge de fécule ni mélange. Même puissance aromatique toute l'année.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center font-bold">
            <Truck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-stone-900 text-sm">Livraison Directe sur Site</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Livraison dans vos cuisines à Bamako sous 24h ou expédition expresse dans toute la sous-région.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center font-bold">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-stone-900 text-sm">Facturation & Traçabilité</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Factures proforma et reçus conformes pour votre gestion comptable d'établissement.
          </p>
        </div>
      </section>

      {/* 3. SIMULATEUR DE DEVIS GROSSISTE EN DIRECT */}
      <section id="simulateur-devis" className="bg-white rounded-3xl border border-stone-200 shadow-md p-6 sm:p-10 space-y-8">
        <div className="border-b border-stone-100 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full">
              <Calculator className="w-3.5 h-3.5" />
              <span>Simulateur B2B Temps Réel</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900">
              Configurez Votre Commande en Gros
            </h2>
            <p className="text-stone-500 text-xs sm:text-sm">
              Sélectionnez vos volumes et visualisez instantanément le coût net et votre économie.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400">Réf devis :</span>
            <span className="px-2.5 py-1 bg-stone-100 text-stone-700 font-mono text-xs font-bold rounded-md">
              {quoteNumber}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* CONFIGURATION COLUMN */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1 : Produit */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                1. Choisir l'épice ou produit du terroir :
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {wholesaleProducts.map((p) => {
                  const isSelected = p.id === selectedProductId;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedProductId(p.id)}
                      className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between gap-2 ${
                        isSelected 
                          ? 'border-[#2D5A27] bg-[#2D5A27]/5 ring-1 ring-[#2D5A27]' 
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-xs sm:text-sm text-stone-900 line-clamp-1">
                            {p.name}
                          </span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-[#2D5A27] shrink-0" />}
                        </div>
                        <span className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                          {p.recommendedFor}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between pt-1 border-t border-stone-100 text-xs">
                        <span className="text-stone-400 text-[10px]">Base au kg :</span>
                        <span className="font-extrabold text-[#2D5A27]">{formatFCFA(p.basePricePerKg)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2 : Volume */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  2. Quantité souhaitée (en Kilogrammes) :
                </label>
                <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  Volume actif : {selectedVolume} kg
                </span>
              </div>

              {/* Volume Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {volumeTiers.map((tier) => {
                  const isSelected = selectedVolume === tier.kg;
                  return (
                    <button
                      key={tier.kg}
                      type="button"
                      onClick={() => setSelectedVolume(tier.kg)}
                      className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                        isSelected
                          ? 'bg-[#142618] text-white border-[#142618] shadow-xs'
                          : 'border-stone-200 hover:border-stone-300 bg-white text-stone-700'
                      }`}
                    >
                      <div className="font-black text-sm">{tier.kg} kg</div>
                      <div className={`text-[10px] font-bold ${isSelected ? 'text-amber-300' : 'text-emerald-700'}`}>
                        -{tier.discountPercent}%
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom Range Slider */}
              <div className="pt-2 space-y-1">
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="5"
                  value={selectedVolume}
                  onChange={(e) => setSelectedVolume(Number(e.target.value))}
                  className="w-full accent-[#2D5A27] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-stone-400 font-medium">
                  <span>Min : 10 kg</span>
                  <span>50 kg</span>
                  <span>100 kg</span>
                  <span>250 kg</span>
                  <span>500 kg+</span>
                </div>
              </div>
            </div>

            {/* Step 3 : Conditionnement */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                3. Type de conditionnement professionnel :
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPackagingType('sacs_pro')}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    packagingType === 'sacs_pro'
                      ? 'border-[#2D5A27] bg-[#2D5A27]/5 ring-1 ring-[#2D5A27]'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="font-bold text-xs text-stone-900">Sacs Pro Étanches</div>
                  <div className="text-[10px] text-stone-500 mt-0.5">Polypropylène doublé (Inclus)</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPackagingType('jute')}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    packagingType === 'jute'
                      ? 'border-[#2D5A27] bg-[#2D5A27]/5 ring-1 ring-[#2D5A27]'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="font-bold text-xs text-stone-900">Sacs Toile de Jute</div>
                  <div className="text-[10px] text-stone-500 mt-0.5">Siglés Horon Mousso (+1 500 F/sac)</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPackagingType('sachets_revente')}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    packagingType === 'sachets_revente'
                      ? 'border-[#2D5A27] bg-[#2D5A27]/5 ring-1 ring-[#2D5A27]'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="font-bold text-xs text-stone-900">Prêt-à-Vendre (Épicerie)</div>
                  <div className="text-[10px] text-stone-500 mt-0.5">Sachets kraft étiquetés (+250 F/kg)</div>
                </button>
              </div>
            </div>

            {/* Step 4 : Coordonnées du contact pro */}
            <div className="space-y-3 pt-3 border-t border-stone-100">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                4. Coordonnées de votre établissement :
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Nom de l'établissement (ex: Restaurant Le Palmier)"
                  value={clientCompany}
                  onChange={(e) => setClientCompany(e.target.value)}
                  className="px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-[#2D5A27]"
                />
                <input
                  type="text"
                  placeholder="Nom du responsable *"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-[#2D5A27]"
                />
                <input
                  type="tel"
                  placeholder="Numéro WhatsApp / Téléphone *"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-[#2D5A27]"
                />
                <input
                  type="text"
                  placeholder="Ville / Quartier (ex: Bamako Hamdallaye)"
                  value={clientCity}
                  onChange={(e) => setClientCity(e.target.value)}
                  className="px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-[#2D5A27]"
                />
              </div>
            </div>
          </div>

          {/* SUMMARY QUOTE COLUMN */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 bg-gradient-to-b from-[#FAFBF9] to-stone-100 rounded-2xl border border-stone-200 p-6 space-y-6 shadow-xs">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                  Devis Proforma Instantané
                </span>
                <h3 className="font-extrabold text-stone-900 text-lg">
                  Récapitulatif Financier
                </h3>
              </div>

              {/* Product preview line */}
              <div className="p-3 bg-white rounded-xl border border-stone-200/80 space-y-1">
                <div className="font-bold text-xs text-stone-900">{selectedProduct.name}</div>
                <div className="flex justify-between text-xs text-stone-500">
                  <span>Volume commandé :</span>
                  <span className="font-bold text-stone-800">{selectedVolume} kg</span>
                </div>
              </div>

              {/* Breakdown lines */}
              <div className="space-y-2.5 text-xs text-stone-600 divide-y divide-stone-200/60 pt-1">
                <div className="flex justify-between items-center pt-2">
                  <span>Prix catalogue de base :</span>
                  <span className="font-medium text-stone-800">{formatFCFA(calculations.basePriceTotal)}</span>
                </div>

                <div className="flex justify-between items-center pt-2 text-emerald-800 font-semibold">
                  <span className="flex items-center gap-1">
                    <span>Remise volume ({currentTier.discountPercent}%) :</span>
                  </span>
                  <span>- {formatFCFA(calculations.discountAmount)}</span>
                </div>

                {calculations.packagingFee > 0 && (
                  <div className="flex justify-between items-center pt-2">
                    <span>Option conditionnement :</span>
                    <span className="font-medium text-stone-800">+{formatFCFA(calculations.packagingFee)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2">
                  <span>Coût effectif ramené au kg :</span>
                  <span className="font-bold text-stone-900 bg-white px-2 py-0.5 rounded-md border border-stone-200">
                    {formatFCFA(calculations.effectivePricePerKg)} / kg
                  </span>
                </div>
              </div>

              {/* Big Grand Total */}
              <div className="pt-4 border-t-2 border-dashed border-stone-200 flex items-baseline justify-between">
                <div>
                  <span className="block text-[11px] font-bold text-stone-400 uppercase">Montant Net à Payer :</span>
                  <span className="text-2xl sm:text-3xl font-black text-[#1E3B24]">
                    {formatFCFA(calculations.discountedTotal)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full">
                    Économie : {formatFCFA(calculations.discountAmount)}
                  </span>
                </div>
              </div>

              {/* CTA Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleSendWhatsAppQuote}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#2D5A27] hover:bg-[#1f3f1b] text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition cursor-pointer text-xs sm:text-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Transmettre ce devis sur WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowProformaModal(true)}
                  className="w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-stone-50 text-stone-700 font-semibold py-2.5 px-4 rounded-xl border border-stone-300 transition cursor-pointer text-xs"
                >
                  <Printer className="w-3.5 h-3.5 text-stone-500" />
                  <span>Aperçu imprimable / PDF Proforma</span>
                </button>
              </div>

              <div className="text-center pt-1">
                <span className="text-[11px] text-stone-400 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Devis garanti sans engagement sous 14 jours</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PACKS CLÉ EN MAIN POUR RESTAURATEURS */}
      <section className="space-y-4">
        <div className="space-y-1">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
            Offres Prêtes à l'Emploi
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-stone-900">
            Packs Recommandés par Profil d'Établissement
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pack 1 */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="inline-block px-2.5 py-0.5 bg-red-100 text-red-800 text-[10px] font-black uppercase rounded-full">
                Maquis & Grillades
              </span>
              <h4 className="font-extrabold text-stone-900 text-base">Pack Dibi & Grillades Master (30 kg)</h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                10 kg Piment Noir Fort + 10 kg Mélange Signature Dibi + 5 kg Ail Concassé + 5 kg Gingembre Pur.
              </p>
              <div className="pt-2 text-lg font-black text-stone-900">
                135 000 FCFA <span className="text-xs font-normal text-stone-400 line-through">160 000 FCFA</span>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedProductId('mix_dibi_pro');
                setSelectedVolume(30);
                showToast('Pack Dibi chargé dans le simulateur !', 'info');
              }}
              className="w-full py-2.5 bg-stone-100 hover:bg-[#2D5A27] hover:text-white text-stone-700 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Charger ce pack dans le simulateur
            </button>
          </div>

          {/* Pack 2 */}
          <div className="bg-white p-6 rounded-2xl border-2 border-[#2D5A27] shadow-sm flex flex-col justify-between space-y-4 relative">
            <span className="absolute -top-2.5 right-4 bg-[#2D5A27] text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
              Bestseller
            </span>
            <div className="space-y-2">
              <span className="inline-block px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase rounded-full">
                Sauces & Cuisson
              </span>
              <h4 className="font-extrabold text-stone-900 text-base">Pack Traditionnel Soumbala & Terroir (50 kg)</h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                25 kg Soumbala Pur de Néré + 15 kg Piment Doux/Fort + 10 kg Poivre de Guinée sauvage.
              </p>
              <div className="pt-2 text-lg font-black text-[#2D5A27]">
                185 000 FCFA <span className="text-xs font-normal text-stone-400 line-through">230 000 FCFA</span>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedProductId('soumbala_pro');
                setSelectedVolume(50);
                showToast('Pack Soumbala & Terroir chargé dans le simulateur !', 'info');
              }}
              className="w-full py-2.5 bg-[#2D5A27] text-white hover:bg-[#1e3d1a] text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Charger ce pack dans le simulateur
            </button>
          </div>

          {/* Pack 3 */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="inline-block px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-black uppercase rounded-full">
                Boutiques & Épiceries
              </span>
              <h4 className="font-extrabold text-stone-900 text-base">Pack Revente Rayon Épicerie (100 Unités)</h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                100 sachets kraft zippés 250g étiquetés avec code barre et DLUO pour mise en rayon immédiate.
              </p>
              <div className="pt-2 text-lg font-black text-stone-900">
                110 000 FCFA <span className="text-xs font-normal text-stone-400 line-through">145 000 FCFA</span>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedProductId('soumbala_pro');
                setSelectedVolume(25);
                setPackagingType('sachets_revente');
                showToast('Pack Revente Rayon chargé dans le simulateur !', 'info');
              }}
              className="w-full py-2.5 bg-stone-100 hover:bg-[#2D5A27] hover:text-white text-stone-700 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Charger ce pack dans le simulateur
            </button>
          </div>
        </div>
      </section>

      {/* MODAL 1 : PROFORMA VIEW */}
      {showProformaModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-stone-200">
            {/* Header Document */}
            <div className="flex justify-between items-start border-b border-stone-200 pb-4">
              <div>
                <h3 className="text-xl font-black text-[#142618]">HORON MOUSSO B2B</h3>
                <p className="text-xs text-stone-500">Commerce & Transformation Agricole du Terroir</p>
                <p className="text-[11px] text-stone-400">{settings.address} • {settings.phone}</p>
              </div>
              <div className="text-right">
                <span className="inline-block px-2 py-0.5 bg-stone-100 font-mono text-xs font-bold text-stone-800 rounded">
                  {quoteNumber}
                </span>
                <p className="text-[11px] text-stone-400 mt-1">
                  Date : {new Date().toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>

            {/* Client Info */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-stone-50 p-4 rounded-xl border border-stone-200/80">
              <div>
                <span className="font-bold text-stone-400 uppercase text-[10px] block">Client / Établissement</span>
                <p className="font-bold text-stone-800 text-sm">{clientCompany || clientName || 'Client Professionnel'}</p>
                <p className="text-stone-600">{clientPhone || 'Numéro à préciser'}</p>
                <p className="text-stone-600">{clientCity}</p>
              </div>
              <div>
                <span className="font-bold text-stone-400 uppercase text-[10px] block">Conditions</span>
                <p className="text-stone-700">Validité : 14 jours</p>
                <p className="text-stone-700">Mise à disposition : 24h à 48h</p>
                <p className="text-stone-700">Paiement : Virement, Wave, Orange Money ou Chèque</p>
              </div>
            </div>

            {/* Item Table */}
            <div className="border border-stone-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-stone-100 text-stone-600 font-bold">
                  <tr>
                    <th className="p-3">Désignation</th>
                    <th className="p-3 text-center">Qté (kg)</th>
                    <th className="p-3 text-right">Prix Unitaire</th>
                    <th className="p-3 text-right">Total Net</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  <tr>
                    <td className="p-3 font-medium text-stone-800">
                      {selectedProduct.name}
                      <span className="block text-[10px] text-stone-500">
                        Remise de volume incluse (-{currentTier.discountPercent}%)
                      </span>
                    </td>
                    <td className="p-3 text-center font-bold text-stone-700">{selectedVolume}</td>
                    <td className="p-3 text-right text-stone-600">{formatFCFA(calculations.effectivePricePerKg)}</td>
                    <td className="p-3 text-right font-bold text-[#2D5A27]">
                      {formatFCFA(calculations.discountedTotal)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Footer Total */}
            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-stone-500 italic">Facture proforma établie hors taxes ou TVA non applicable.</span>
              <div className="text-right">
                <span className="text-xs text-stone-400 block">TOTAL À RÉGLER :</span>
                <span className="text-2xl font-black text-[#142618]">
                  {formatFCFA(calculations.discountedTotal)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setShowProformaModal(false)}
                className="px-4 py-2 border border-stone-200 text-stone-600 text-xs font-bold rounded-xl hover:bg-stone-50 cursor-pointer"
              >
                Fermer
              </button>
              <button
                type="button"
                onClick={handlePrintQuote}
                className="px-5 py-2 bg-[#2D5A27] text-white text-xs font-bold rounded-xl hover:bg-[#1f3f1b] transition cursor-pointer flex items-center gap-2"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimer ce devis</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2 : DEMANDE D'ÉCHANTILLON CHEF */}
      {showSampleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-stone-200">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Pour Restaurateurs & Chefs
              </span>
              <h3 className="text-lg font-black text-stone-900">
                Demander un Coffret Découverte Échantillons
              </h3>
              <p className="text-xs text-stone-500">
                Recevez directement dans votre cuisine un échantillon de nos 4 épices phares pour vos essais culinaires.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <input
                type="text"
                placeholder="Nom de votre restaurant / maquis *"
                id="sample-restaurant-input"
                className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-[#2D5A27]"
              />
              <input
                type="tel"
                placeholder="Téléphone / WhatsApp *"
                id="sample-phone-input"
                className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-[#2D5A27]"
              />
              <input
                type="text"
                placeholder="Quartier ou Adresse de livraison *"
                id="sample-address-input"
                className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-[#2D5A27]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setShowSampleModal(false)}
                className="px-4 py-2 border border-stone-200 text-stone-600 text-xs font-bold rounded-xl hover:bg-stone-50 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  const rest = (document.getElementById('sample-restaurant-input') as HTMLInputElement)?.value;
                  const ph = (document.getElementById('sample-phone-input') as HTMLInputElement)?.value;
                  const addr = (document.getElementById('sample-address-input') as HTMLInputElement)?.value;
                  if (!ph) {
                    showToast('Veuillez renseigner votre téléphone.', 'error');
                    return;
                  }
                  const rawNumber = settings.whatsapp || settings.phone || '';
                  const cleanNumber = rawNumber.replace(/[^0-9]/g, '');
                  const msg = `*DEMANDE DE COFFRET ÉCHANTILLONS CHEF - HORON MOUSSO*\nRestaurant : ${rest || 'Chef'}\nTéléphone : ${ph}\nAdresse : ${addr || 'Bamako'}\nBonjour, je souhaite recevoir un kit d'échantillons d'épices pour tester dans ma cuisine.`;
                  if (cleanNumber) {
                    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`, '_blank');
                  }
                  setShowSampleModal(false);
                  showToast('Demande d\'échantillon transmise !', 'success');
                }}
                className="px-5 py-2 bg-[#2D5A27] text-white text-xs font-bold rounded-xl hover:bg-[#1f3f1b] transition cursor-pointer"
              >
                Confirmer sur WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
