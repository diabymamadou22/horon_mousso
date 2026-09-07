import React, { useState, useMemo } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  MessageSquare, 
  Truck, 
  Store, 
  CreditCard, 
  Copy, 
  Check, 
  ShieldCheck, 
  ArrowRight,
  Clock,
  MapPin,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatFCFA } from '../../utils/cartUtils';
import { deliveryZones } from '../../data/deliveryZones';
import { PaymentMethod } from '../../types';

export const CartDrawer: React.FC = () => {
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    removeFromCart, 
    updateCartQuantity, 
    clearCart, 
    cartTotalCount, 
    cartTotalAmount, 
    createDirectOrder,
    submitCartOrderWhatsApp,
    settings,
    setActiveTab,
    showToast
  } = useApp();

  const [deliveryType, setDeliveryType] = useState<'livraison' | 'retrait'>('livraison');
  const [selectedZoneId, setSelectedZoneId] = useState<string>('zone_bamako_rg');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wave');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [hasCopiedOM, setHasCopiedOM] = useState(false);
  const [hasCopiedWave, setHasCopiedWave] = useState(false);

  if (!isCartOpen) return null;

  const currentZone = deliveryZones.find(z => z.id === selectedZoneId) || deliveryZones[0];
  const deliveryFee = deliveryType === 'retrait' ? 0 : currentZone.fee;
  const grandTotal = cartTotalAmount + deliveryFee;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      showToast('Veuillez renseigner votre nom et votre numéro de téléphone.', 'error');
      return;
    }
    if (deliveryType === 'livraison' && !customerAddress.trim()) {
      showToast('Veuillez préciser votre adresse ou commune de livraison.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const order = await createDirectOrder({
        name: customerName.trim(),
        phone: customerPhone.trim(),
        email: customerEmail.trim() || undefined,
        address: deliveryType === 'retrait' ? 'Retrait en boutique / Atelier Horon Mousso' : customerAddress.trim(),
        deliveryZone: deliveryType === 'retrait' ? 'Retrait en boutique (Gratuit)' : currentZone.name,
        deliveryFee,
        deliveryType,
        paymentMethod,
        notes: notes.trim()
      });

      if (order) {
        // Also prepare and open WhatsApp communication with customer
        const rawNumber = settings.whatsapp || settings.phone || '';
        const cleanNumber = rawNumber.replace(/[^0-9]/g, '');
        const itemsSummary = order.items.map((it, idx) => 
          `${idx + 1}. *${it.quantity}x ${it.productName}* (${it.format}) : ${formatFCFA(it.totalPrice)}`
        ).join('\n');

        const orderMsg = 
`*NOUVELLE COMMANDE - HORON MOUSSO* 🌿
N° Commande : *${order.orderNumber}*
----------------------------------------
${itemsSummary}

📦 *Sous-total :* ${formatFCFA(order.subtotal)}
🚚 *Livraison (${order.deliveryZone}) :* ${formatFCFA(order.deliveryFee)}
💰 *TOTAL NET :* ${formatFCFA(order.total)}

👤 *Client :* ${order.customerName}
📞 *Téléphone :* ${order.customerPhone}
📍 *Mode :* ${order.deliveryType === 'retrait' ? 'Retrait en Atelier / Boutique' : 'Livraison à domicile / bureau'}
🏠 *Adresse :* ${order.deliveryAddress}
💳 *Paiement :* ${order.paymentMethod.replace('_', ' ').toUpperCase()}
${order.notes ? `📝 *Remarques :* ${order.notes}` : ''}

Bonjour, je viens de passer commande sur le site. Merci de me confirmer la prise en charge !`;

        if (cleanNumber) {
          const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(orderMsg)}`;
          window.open(url, '_blank');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyOrderText = () => {
    const itemsSummary = cart.map((item, idx) => {
      const pricePart = item.unitPriceNumeric > 0 ? ` : ${formatFCFA(item.unitPriceNumeric * item.quantity)}` : '';
      return `${idx + 1}. ${item.quantity}x ${item.product.name} (${item.format})${pricePart}`;
    }).join('\n');

    const totalStr = `\nSous-total : ${formatFCFA(cartTotalAmount)}\nFrais de livraison : ${formatFCFA(deliveryFee)}\nTotal net : ${formatFCFA(grandTotal)}`;
    const textToCopy = `COMMANDE HORON MOUSSO\n-----------------------\n${itemsSummary}${totalStr}\n\nClient : ${customerName || 'À préciser'}\nTéléphone : ${customerPhone || 'À préciser'}\nMode : ${deliveryType === 'retrait' ? 'Retrait en boutique' : 'Livraison'}\nZone : ${currentZone.name}\nAdresse : ${customerAddress || 'À préciser'}\nPaiement : ${paymentMethod}`;

    navigator.clipboard.writeText(textToCopy);
    setHasCopied(true);
    showToast('Détail de la commande copié dans le presse-papier !', 'info');
    setTimeout(() => setHasCopied(false), 3000);
  };

  return (
    <div id="cart-drawer-overlay" className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div 
        className="fixed inset-0" 
        onClick={() => setIsCartOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer content */}
      <div 
        id="cart-drawer-panel"
        className="relative z-10 flex flex-col w-full max-w-xl h-full bg-white shadow-2xl overflow-hidden border-l border-neutral-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-[#FAF9F6]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#2D5A27]/10 flex items-center justify-center text-[#2D5A27]">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                Mon Panier
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#2D5A27] text-white">
                  {cartTotalCount} {cartTotalCount > 1 ? 'articles' : 'article'}
                </span>
              </h2>
              <p className="text-xs text-neutral-500">Horon Mousso - Commande directe & personnalisée</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                id="btn-clear-cart"
                type="button"
                onClick={clearCart}
                className="text-xs text-neutral-500 hover:text-red-600 px-2 py-1 rounded transition-colors"
                title="Vider tout le panier"
              >
                Vider
              </button>
            )}
            <button
              id="btn-close-cart"
              type="button"
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
              aria-label="Fermer le panier"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-neutral-100">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-4">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-800 mb-1">Votre panier est encore vide</h3>
              <p className="text-sm text-neutral-500 max-w-xs mb-6">
                Découvrez nos épices pures d'Afrique de l'Ouest, notre soumbala d'exception et nos piments savamment séchés.
              </p>
              <button
                id="btn-cart-browse"
                type="button"
                onClick={() => {
                  setIsCartOpen(false);
                  setActiveTab('produits');
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2D5A27] text-white font-medium hover:bg-[#23471f] transition-colors shadow-sm"
              >
                Explorer nos produits
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              {/* Product items list */}
              <div className="space-y-4 pb-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Articles sélectionnés</h4>
                {cart.map((item) => (
                  <div 
                    key={item.id} 
                    id={`cart-item-${item.id}`}
                    className="flex gap-3.5 p-3 rounded-xl bg-neutral-50 border border-neutral-100 items-center"
                  >
                    {/* Thumbnail */}
                    <img 
                      src={item.product.mainImage} 
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0 border border-neutral-200"
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-semibold text-neutral-900 truncate">
                        {item.product.name}
                      </h5>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-md bg-[#2D5A27]/10 text-[#2D5A27]">
                          {item.format}
                        </span>
                        {item.unitPriceNumeric > 0 ? (
                          <span className="text-xs text-neutral-600 font-medium">
                            {formatFCFA(item.unitPriceNumeric)}
                          </span>
                        ) : (
                          <span className="text-xs text-neutral-500 italic">
                            {item.product.price || 'Prix selon format'}
                          </span>
                        )}
                      </div>

                      {/* Quantity row */}
                      <div className="flex items-center justify-between mt-2.5">
                        <div className="flex items-center border border-neutral-200 bg-white rounded-lg overflow-hidden">
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                            className="p-1 px-2 hover:bg-neutral-100 text-neutral-600 transition-colors"
                            aria-label="Diminuer la quantité"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs font-bold text-neutral-800">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                            className="p-1 px-2 hover:bg-neutral-100 text-neutral-600 transition-colors"
                            aria-label="Augmenter la quantité"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          {item.unitPriceNumeric > 0 && (
                            <span className="text-xs font-bold text-[#2D5A27]">
                              {formatFCFA(item.unitPriceNumeric * item.quantity)}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="text-neutral-400 hover:text-red-600 p-1 transition-colors"
                            title="Supprimer cet article"
                            aria-label="Supprimer cet article"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Form */}
              <form onSubmit={handleSubmitOrder} className="pt-5 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Détails de livraison & contact</h4>

                {/* Delivery Type */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('livraison')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                      deliveryType === 'livraison'
                        ? 'border-[#2D5A27] bg-[#2D5A27]/5 text-[#2D5A27] font-semibold shadow-xs'
                        : 'border-neutral-200 hover:bg-neutral-50 text-neutral-600'
                    }`}
                  >
                    <Truck className="w-4 h-4 text-[#2D5A27]" />
                    Livraison à domicile
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryType('retrait')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                      deliveryType === 'retrait'
                        ? 'border-[#2D5A27] bg-[#2D5A27]/5 text-[#2D5A27] font-semibold shadow-xs'
                        : 'border-neutral-200 hover:bg-neutral-50 text-neutral-600'
                    }`}
                  >
                    <Store className="w-4 h-4 text-[#2D5A27]" />
                    Retrait en Boutique (0 FCFA)
                  </button>
                </div>

                {/* Delivery Zone Selector (if livraison) */}
                {deliveryType === 'livraison' && (
                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#2D5A27]" />
                        Zone & Frais de livraison :
                      </span>
                      <span className="text-[11px] text-neutral-500 font-normal">Tarifs transparents</span>
                    </label>
                    <div className="space-y-1.5">
                      {deliveryZones.filter(z => z.fee > 0).map((z) => (
                        <div
                          key={z.id}
                          onClick={() => setSelectedZoneId(z.id)}
                          className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                            selectedZoneId === z.id
                              ? 'border-[#2D5A27] bg-[#2D5A27]/5 ring-1 ring-[#2D5A27]'
                              : 'border-neutral-200 hover:bg-neutral-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              selectedZoneId === z.id ? 'border-[#2D5A27] bg-[#2D5A27]' : 'border-neutral-300'
                            }`}>
                              {selectedZoneId === z.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-neutral-800">{z.name}</p>
                              <p className="text-[10px] text-neutral-500 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-neutral-400" />
                                {z.estimatedTime} • {z.description}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-[#2D5A27] font-mono">
                            {formatFCFA(z.fee)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Customer info fields */}
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">
                        Votre Nom & Prénom <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="cart-customer-name"
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Ex: Awa Traoré"
                        className="w-full px-3.5 py-2 text-xs rounded-lg border border-neutral-200 focus:outline-hidden focus:ring-2 focus:ring-[#2D5A27]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">
                        Téléphone / WhatsApp <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="cart-customer-phone"
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="Ex: +223 70 00 11 22"
                        className="w-full px-3.5 py-2 text-xs rounded-lg border border-neutral-200 focus:outline-hidden focus:ring-2 focus:ring-[#2D5A27]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Email (facultatif, pour recevoir le reçu numérique)
                    </label>
                    <input
                      id="cart-customer-email"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="votre-email@exemple.com"
                      className="w-full px-3.5 py-2 text-xs rounded-lg border border-neutral-200 focus:outline-hidden focus:ring-2 focus:ring-[#2D5A27]"
                    />
                  </div>

                  {deliveryType === 'livraison' && (
                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">
                        Quartier, Rue & Repère précis <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="cart-customer-address"
                        type="text"
                        required={deliveryType === 'livraison'}
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        placeholder="Ex: Badalabougou près de la clinique, porte 24..."
                        className="w-full px-3.5 py-2 text-xs rounded-lg border border-neutral-200 focus:outline-hidden focus:ring-2 focus:ring-[#2D5A27]"
                      />
                    </div>
                  )}

                  {/* Payment method selection */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                      Moyen de règlement préféré
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        { id: 'wave' as PaymentMethod, label: 'Wave Mobile Money' },
                        { id: 'orange_money' as PaymentMethod, label: 'Orange Money' },
                        { id: 'moov_money' as PaymentMethod, label: 'Moov Money' },
                        { id: 'especes_livraison' as PaymentMethod, label: 'Espèces à la livraison' }
                      ].map((pay) => (
                        <button
                          key={pay.id}
                          type="button"
                          onClick={() => setPaymentMethod(pay.id)}
                          className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                            paymentMethod === pay.id
                              ? 'border-[#2D5A27] bg-[#2D5A27]/5 text-[#2D5A27] font-bold shadow-2xs'
                              : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                          }`}
                        >
                          <span className="truncate">{pay.label}</span>
                          {paymentMethod === pay.id && <Check className="w-3.5 h-3.5 text-[#2D5A27] flex-shrink-0 ml-1" />}
                        </button>
                      ))}
                    </div>

                    {/* Mobile Money Direct Transfer Reference Box */}
                    {(paymentMethod === 'wave' || paymentMethod === 'orange_money') && (
                      <div className="mt-2.5 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-950">
                        <div className="flex items-center justify-between font-semibold mb-1">
                          <span className="flex items-center gap-1.5">
                            <CreditCard className="w-3.5 h-3.5 text-[#2D5A27]" />
                            Compte marchand Horon Mousso ({paymentMethod === 'wave' ? 'Wave' : 'Orange Money'}) :
                          </span>
                        </div>
                        <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-emerald-200 font-mono text-xs">
                          <span className="font-bold text-neutral-800">
                            {paymentMethod === 'wave' 
                              ? (settings.waveNumber || '+223 70 00 00 01') 
                              : (settings.orangeMoneyNumber || '+223 76 00 00 02')}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const num = paymentMethod === 'wave' ? settings.waveNumber : settings.orangeMoneyNumber;
                              navigator.clipboard.writeText(num || '');
                              if (paymentMethod === 'wave') {
                                setHasCopiedWave(true);
                                setTimeout(() => setHasCopiedWave(false), 2500);
                              } else {
                                setHasCopiedOM(true);
                                setTimeout(() => setHasCopiedOM(false), 2500);
                              }
                              showToast('Numéro copié !', 'info');
                            }}
                            className="text-[11px] font-sans font-semibold text-[#2D5A27] hover:underline flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" />
                            {(paymentMethod === 'wave' ? hasCopiedWave : hasCopiedOM) ? 'Copié !' : 'Copier'}
                          </button>
                        </div>
                        <p className="text-[10px] text-emerald-800/80 mt-1.5">
                          Vous pouvez initier le transfert dès maintenant ou le faire après validation avec le reçu.
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Remarques ou consignes particulières (facultatif)
                    </label>
                    <textarea
                      id="cart-customer-notes"
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ex: Emballage sous-vide renforcé, livrer de préférence en matinée..."
                      className="w-full px-3.5 py-1.5 text-xs rounded-lg border border-neutral-200 focus:outline-hidden focus:ring-2 focus:ring-[#2D5A27]"
                    />
                  </div>
                </div>

                {/* Subtotal & Action buttons */}
                <div className="pt-3 border-t border-neutral-200 bg-[#FAF9F6] p-4 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs text-neutral-600">
                    <span>Sous-total articles :</span>
                    <span className="font-mono font-medium">{formatFCFA(cartTotalAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-neutral-600">
                    <span>Frais d'expédition ({deliveryType === 'retrait' ? 'Retrait boutique' : currentZone.name}) :</span>
                    <span className="font-mono font-medium">
                      {deliveryFee === 0 ? 'Gratuit' : formatFCFA(deliveryFee)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-neutral-200 flex items-center justify-between">
                    <span className="text-sm font-black text-neutral-900">Total Net à régler :</span>
                    <span className="text-lg font-black text-[#2D5A27] font-mono">
                      {formatFCFA(grandTotal)}
                    </span>
                  </div>

                  <div className="space-y-2 pt-2">
                    <button
                      id="btn-submit-cart-whatsapp"
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-[#2D5A27] hover:bg-[#23481f] text-white font-bold text-sm transition-all shadow-md active:scale-98 disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                      {isSubmitting ? 'Génération de la commande...' : 'Valider & Obtenir mon Reçu Numérique'}
                    </button>

                    <button
                      id="btn-copy-cart-order"
                      type="button"
                      onClick={handleCopyOrderText}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-medium transition-colors"
                    >
                      {hasCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          Bon de commande copié !
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-neutral-500" />
                          Copier le récapitulatif complet
                        </>
                      )}
                    </button>
                  </div>

                  <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-neutral-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#2D5A27]" />
                    <span>Commande sécurisée et confirmée directement par Horon Mousso</span>
                  </div>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
