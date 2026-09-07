import React, { useState } from 'react';
import { Truck, Clock, MapPin, CheckCircle2, ArrowRight, ShieldCheck, Sparkles, Store } from 'lucide-react';
import { deliveryZones } from '../../data/deliveryZones';
import { formatFCFA } from '../../utils/cartUtils';
import { useApp } from '../../context/AppContext';

export const DeliveryCalculatorWidget: React.FC = () => {
  const { setActiveTab, setIsCartOpen, cartTotalAmount } = useApp();
  const [selectedZoneId, setSelectedZoneId] = useState<string>('zone_bamako_rg');

  const selectedZone = deliveryZones.find(z => z.id === selectedZoneId) || deliveryZones[0];
  const isFreeThreshold = cartTotalAmount >= 15000;

  return (
    <div className="bg-gradient-to-br from-stone-50 via-emerald-50/40 to-stone-50 border border-stone-200/90 rounded-3xl p-6 sm:p-9 shadow-xs">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-emerald-100 text-[#2D5A27] text-xs font-bold rounded-full">
            <Truck className="w-3.5 h-3.5" />
            <span>Simulateur Express de Livraison</span>
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-[#142618] tracking-tight">
            Calculez Vos Frais de Livraison en 1 Clic
          </h3>
          <p className="text-stone-600 text-xs sm:text-sm max-w-lg mx-auto">
            Tarifs transparents, emballages sécurisés et expédition express à Bamako, en périphérie et vers toutes les régions.
          </p>
        </div>

        {/* Zone Selector Buttons / Dropdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {deliveryZones.map((zone) => {
            const isSelected = zone.id === selectedZoneId;
            return (
              <button
                key={zone.id}
                type="button"
                onClick={() => setSelectedZoneId(zone.id)}
                className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'bg-[#182F1E] text-white border-[#182F1E] shadow-md ring-2 ring-emerald-500/30'
                    : 'bg-white hover:bg-stone-50 text-stone-800 border-stone-200 shadow-2xs'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold truncate pr-1">
                      {zone.name.split('(')[0].trim()}
                    </span>
                    {zone.fee === 0 ? (
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                        isSelected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-[#2D5A27]'
                      }`}>
                        Gratuit
                      </span>
                    ) : (
                      <span className={`text-xs font-mono font-black ${
                        isSelected ? 'text-emerald-300' : 'text-[#2D5A27]'
                      }`}>
                        {formatFCFA(zone.fee)}
                      </span>
                    )}
                  </div>
                  <p className={`text-[11px] line-clamp-2 leading-tight ${
                    isSelected ? 'text-stone-300' : 'text-stone-500'
                  }`}>
                    {zone.name.includes('(') ? zone.name.split('(')[1].replace(')', '') : 'Retrait direct sur place'}
                  </p>
                </div>

                <div className={`flex items-center gap-1 text-[10px] font-medium pt-1.5 border-t ${
                  isSelected ? 'border-white/10 text-emerald-300' : 'border-stone-100 text-stone-600'
                }`}>
                  <Clock className="w-3 h-3" />
                  <span>{zone.delay}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Zone Result Card */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-stone-100">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#2D5A27] flex items-center justify-center shrink-0">
                {selectedZone.fee === 0 ? <Store className="w-5 h-5" /> : <Truck className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="font-bold text-sm text-stone-900">{selectedZone.name}</h4>
                <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-stone-500">
                  <span className="flex items-center gap-1 font-medium text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md">
                    <Clock className="w-3 h-3 text-amber-700" />
                    Délai estimé : {selectedZone.delay}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right sm:border-l sm:border-stone-100 sm:pl-5">
              <span className="text-[11px] text-stone-400 uppercase tracking-wider block font-medium">Tarif estimé</span>
              <span className="text-xl font-black text-[#2D5A27] font-mono">
                {selectedZone.fee === 0 ? 'Gratuit' : formatFCFA(selectedZone.fee)}
              </span>
            </div>
          </div>

          {/* Guarantees & Free shipping alert */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-stone-600">
            <div className="flex items-center gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
              <ShieldCheck className="w-4 h-4 text-[#2D5A27] shrink-0" />
              <span>Emballage étanche & anti-humidité</span>
            </div>
            <div className="flex items-center gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
              <CheckCircle2 className="w-4 h-4 text-[#2D5A27] shrink-0" />
              <span>Livreur dédié & suivi WhatsApp</span>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200/60 text-[#2D5A27] font-semibold">
              <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Offerte dès 15 000 F d'achat !</span>
            </div>
          </div>

          {/* Direct CTA */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-stone-500 text-center sm:text-left">
              Ajoutez vos produits au panier : les frais seront automatiquement appliqués à votre reçu.
            </p>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActiveTab('produits')}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#2D5A27] hover:bg-[#23481f] text-white text-xs font-bold transition shadow-sm cursor-pointer"
              >
                <span>Commander mes épices</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
