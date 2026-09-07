import React, { useRef } from 'react';
import { 
  CheckCircle2, 
  Printer, 
  Download, 
  Share2, 
  MessageSquare, 
  X, 
  Package, 
  Truck, 
  Clock, 
  Phone, 
  MapPin, 
  CreditCard,
  Copy,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatFCFA } from '../../utils/cartUtils';

export const OrderReceiptModal: React.FC = () => {
  const { lastPlacedOrder, setLastPlacedOrder, settings, showToast } = useApp();
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!lastPlacedOrder) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(lastPlacedOrder.orderNumber);
    showToast(`Numéro de commande ${lastPlacedOrder.orderNumber} copié !`, 'info');
  };

  const handleShareWhatsApp = () => {
    const rawNumber = settings.whatsapp || settings.phone || '';
    const cleanNumber = rawNumber.replace(/[^0-9]/g, '');

    const itemsSummary = lastPlacedOrder.items.map((it, i) => 
      `${i + 1}. *${it.quantity}x ${it.productName}* (${it.format}) : ${formatFCFA(it.totalPrice)}`
    ).join('\n');

    const msg = 
`*CONFIRMATION COMMANDE HORON MOUSSO* 🌿
N° Commande : *${lastPlacedOrder.orderNumber}*
----------------------------------------
${itemsSummary}

📦 *Sous-total :* ${formatFCFA(lastPlacedOrder.subtotal)}
🚚 *Livraison (${lastPlacedOrder.deliveryZone}) :* ${formatFCFA(lastPlacedOrder.deliveryFee)}
💰 *TOTAL NET :* ${formatFCFA(lastPlacedOrder.total)}

👤 *Client :* ${lastPlacedOrder.customerName}
📞 *Téléphone :* ${lastPlacedOrder.customerPhone}
📍 *Adresse :* ${lastPlacedOrder.deliveryAddress}
💳 *Paiement :* ${lastPlacedOrder.paymentMethod.replace('_', ' ').toUpperCase()}
${lastPlacedOrder.notes ? `📝 *Note :* ${lastPlacedOrder.notes}` : ''}

Merci de confirmer la préparation et l'heure de livraison !`;

    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="fixed inset-0" 
        onClick={() => setLastPlacedOrder(null)} 
        aria-hidden="true" 
      />

      <div 
        className="relative z-10 w-full max-w-2xl max-h-[92vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden"
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#2D5A27] text-white print:hidden">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-6 h-6 text-emerald-300" />
            <div>
              <h3 className="text-base font-bold">Commande Enregistrée avec Succès !</h3>
              <p className="text-xs text-emerald-100">Votre reçu numérique prêt à être conservé ou imprimé</p>
            </div>
          </div>
          <button
            onClick={() => setLastPlacedOrder(null)}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Body */}
        <div ref={receiptRef} className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6 text-neutral-800 bg-[#FCFBF9]">
          
          {/* Header of Receipt */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-neutral-200 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl font-black tracking-tight text-[#2D5A27]">
                  {settings.companyName || 'Horon Mousso'}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                  Reçu Officiel
                </span>
              </div>
              <p className="text-xs text-neutral-500 max-w-sm">
                {settings.slogan || 'Épices pures du terroir, transformation saine et conditionnement d’excellence.'}
              </p>
              <p className="text-[11px] text-neutral-400 mt-1">
                {settings.address} • {settings.cityCountry}
              </p>
            </div>

            <div className="sm:text-right bg-white p-3.5 rounded-xl border border-neutral-200 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">N° de Commande</span>
              <div className="flex items-center gap-1.5 sm:justify-end">
                <span className="text-base font-black text-neutral-900 tracking-wide font-mono">
                  {lastPlacedOrder.orderNumber}
                </span>
                <button
                  onClick={handleCopyOrderNumber}
                  className="p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded print:hidden"
                  title="Copier le numéro"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-xs text-neutral-500 block mt-0.5">
                {new Date(lastPlacedOrder.createdAt).toLocaleDateString('fr-FR', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>

          {/* Customer & Delivery Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-neutral-200 text-xs">
            <div>
              <h4 className="font-bold text-neutral-900 uppercase tracking-wider text-[10px] mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#2D5A27]" />
                Destinataire & Livraison
              </h4>
              <p className="font-semibold text-neutral-800 text-sm">{lastPlacedOrder.customerName}</p>
              <p className="text-neutral-600 flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3 text-neutral-400" />
                {lastPlacedOrder.customerPhone}
              </p>
              {lastPlacedOrder.customerEmail && (
                <p className="text-neutral-500">{lastPlacedOrder.customerEmail}</p>
              )}
              <div className="mt-2 pt-2 border-t border-neutral-100">
                <span className="font-medium text-neutral-700">Adresse / Point de repère :</span>
                <p className="text-neutral-600 italic">{lastPlacedOrder.deliveryAddress}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-100 text-neutral-700">
                  Zone : {lastPlacedOrder.deliveryZone}
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-neutral-900 uppercase tracking-wider text-[10px] mb-2 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[#2D5A27]" />
                Modalités de Paiement & Suivi
              </h4>
              <p className="text-neutral-700">
                <span className="text-neutral-500">Mode :</span>{' '}
                <strong className="capitalize">{lastPlacedOrder.paymentMethod.replace('_', ' ')}</strong>
              </p>
              <p className="text-neutral-700 mt-1">
                <span className="text-neutral-500">Statut du paiement :</span>{' '}
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  {lastPlacedOrder.paymentStatus === 'paye' ? 'RÉGLÉ' : 'EN ATTENTE DE RÈGLEMENT'}
                </span>
              </p>
              <p className="text-neutral-700 mt-1">
                <span className="text-neutral-500">Statut commande :</span>{' '}
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                  EN COURS DE TRAITEMENT
                </span>
              </p>
              {lastPlacedOrder.notes && (
                <div className="mt-2 pt-2 border-t border-neutral-100">
                  <span className="font-medium text-neutral-700">Instruction client :</span>
                  <p className="text-neutral-600 italic">{lastPlacedOrder.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold">
                  <th className="py-2.5 px-4">Article</th>
                  <th className="py-2.5 px-3">Conditionnement</th>
                  <th className="py-2.5 px-3 text-center">Qté</th>
                  <th className="py-2.5 px-3 text-right">Prix Unitaire</th>
                  <th className="py-2.5 px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {lastPlacedOrder.items.map((item, index) => (
                  <tr key={index} className="hover:bg-neutral-50/50">
                    <td className="py-3 px-4 font-semibold text-neutral-900">{item.productName}</td>
                    <td className="py-3 px-3 text-neutral-600">{item.format}</td>
                    <td className="py-3 px-3 text-center font-bold text-neutral-800">{item.quantity}</td>
                    <td className="py-3 px-3 text-right text-neutral-600 font-mono">
                      {formatFCFA(item.unitPrice)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-neutral-900 font-mono">
                      {formatFCFA(item.totalPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pricing Totals Box */}
          <div className="flex justify-end">
            <div className="w-full sm:w-72 bg-white p-4 rounded-xl border border-neutral-200 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Sous-total articles :</span>
                <span className="font-mono font-medium">{formatFCFA(lastPlacedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Frais de livraison :</span>
                <span className="font-mono font-medium">
                  {lastPlacedOrder.deliveryFee === 0 ? 'Gratuit (Retrait)' : formatFCFA(lastPlacedOrder.deliveryFee)}
                </span>
              </div>
              <div className="pt-2 border-t border-neutral-200 flex justify-between items-baseline text-neutral-900">
                <span className="text-sm font-black">TOTAL NET :</span>
                <span className="text-base font-black text-[#2D5A27] font-mono">
                  {formatFCFA(lastPlacedOrder.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Instructions Details */}
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-1.5">
            <h5 className="font-bold flex items-center gap-1.5 text-amber-950">
              <CreditCard className="w-4 h-4 text-amber-700" />
              Instructions pour finaliser le règlement Mobile Money :
            </h5>
            <p className="text-amber-800">
              Veuillez effectuer le transfert du montant total de <strong>{formatFCFA(lastPlacedOrder.total)}</strong> sur l'un de nos comptes officiels en précisant votre nom ou la référence <strong>{lastPlacedOrder.orderNumber}</strong> :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
              {settings.waveNumber && (
                <div className="bg-white/80 p-2 rounded border border-amber-200/80">
                  <span className="font-bold text-[#1DA1F2]">Wave Mobile Money :</span> {settings.waveNumber}
                </div>
              )}
              {settings.orangeMoneyNumber && (
                <div className="bg-white/80 p-2 rounded border border-amber-200/80">
                  <span className="font-bold text-[#FF7900]">Orange Money :</span> {settings.orangeMoneyNumber}
                </div>
              )}
            </div>
            <p className="text-[11px] text-amber-700/90 pt-1">
              Dès réception du transfert ou confirmation par WhatsApp, nos équipes préparent et expédient votre colis avec le plus grand soin.
            </p>
          </div>

          {/* Footer note */}
          <div className="text-center pt-2 text-[11px] text-neutral-400">
            Merci de votre confiance et de votre soutien à l'artisanat noble et à la valorisation du terroir malien.
          </div>
        </div>

        {/* Modal Bottom Actions (Print, WhatsApp, Close) */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-neutral-50 border-t border-neutral-200 print:hidden">
          <button
            onClick={() => setLastPlacedOrder(null)}
            className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60 rounded-xl transition-colors"
          >
            Fermer
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-100 rounded-xl transition-colors shadow-2xs"
            >
              <Printer className="w-4 h-4 text-neutral-500" />
              Imprimer / Sauvegarder
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#25D366] hover:bg-[#20b859] rounded-xl transition-colors shadow-sm"
            >
              <MessageSquare className="w-4 h-4" />
              Confirmer sur WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
