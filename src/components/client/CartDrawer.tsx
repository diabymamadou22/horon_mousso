import React, { useState } from 'react';
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
  ArrowRight 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatFCFA } from '../../utils/cartUtils';

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
    submitCartOrderWhatsApp,
    settings,
    setActiveTab,
    showToast
  } = useApp();

  const [deliveryType, setDeliveryType] = useState<'livraison' | 'retrait'>('livraison');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Wave');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  if (!isCartOpen) return null;

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
      await submitCartOrderWhatsApp({
        name: customerName.trim(),
        phone: customerPhone.trim(),
        address: customerAddress.trim() || 'Retrait en boutique/atelier',
        deliveryType,
        paymentMethod,
        notes: notes.trim()
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyOrderText = () => {
    const itemsSummary = cart.map((item, idx) => {
      const pricePart = item.unitPriceNumeric > 0 ? ` : ${formatFCFA(item.unitPriceNumeric * item.quantity)}` : '';
      return `${idx + 1}. ${item.quantity}x ${item.product.name} (${item.format})${pricePart}`;
    }).join('\n');

    const totalStr = cartTotalAmount > 0 ? `\nTotal estimé : ${formatFCFA(cartTotalAmount)}` : '';
    const textToCopy = `COMMANDE HORON MOUSSO\n-----------------------\n${itemsSummary}${totalStr}\n\nClient : ${customerName || 'À préciser'}\nTéléphone : ${customerPhone || 'À préciser'}\nMode : ${deliveryType === 'retrait' ? 'Retrait en atelier' : 'Livraison à domicile'}\nAdresse : ${customerAddress || 'À préciser'}\nPaiement : ${paymentMethod}`;

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
                        ? 'border-[#2D5A27] bg-[#2D5A27]/5 text-[#2D5A27] font-semibold'
                        : 'border-neutral-200 hover:bg-neutral-50 text-neutral-600'
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    Livraison à domicile
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryType('retrait')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                      deliveryType === 'retrait'
                        ? 'border-[#2D5A27] bg-[#2D5A27]/5 text-[#2D5A27] font-semibold'
                        : 'border-neutral-200 hover:bg-neutral-50 text-neutral-600'
                    }`}
                  >
                    <Store className="w-4 h-4" />
                    Retrait en Boutique
                  </button>
                </div>

                {/* Customer info fields */}
                <div className="space-y-3">
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
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-neutral-200 focus:outline-hidden focus:ring-2 focus:ring-[#2D5A27]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Numéro Téléphone / WhatsApp <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="cart-customer-phone"
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Ex: +223 70 00 11 22 ou 07..."
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-neutral-200 focus:outline-hidden focus:ring-2 focus:ring-[#2D5A27]"
                    />
                  </div>

                  {deliveryType === 'livraison' && (
                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">
                        Ville & Adresse complète <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="cart-customer-address"
                        type="text"
                        required={deliveryType === 'livraison'}
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        placeholder="Ex: Bamako, Badalabougou près de la pharmacie..."
                        className="w-full px-3.5 py-2 text-sm rounded-lg border border-neutral-200 focus:outline-hidden focus:ring-2 focus:ring-[#2D5A27]"
                      />
                    </div>
                  )}

                  {/* Payment method selection */}
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Moyen de paiement préféré
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        { id: 'Wave', label: 'Wave Mobile Money' },
                        { id: 'Orange Money', label: 'Orange Money' },
                        { id: 'Moov / MTN', label: 'Moov / MTN MoMo' },
                        { id: 'Espèces', label: 'Espèces à la réception' }
                      ].map((pay) => (
                        <button
                          key={pay.id}
                          type="button"
                          onClick={() => setPaymentMethod(pay.id)}
                          className={`p-2.5 rounded-lg border text-left transition-colors flex items-center justify-between ${
                            paymentMethod === pay.id
                              ? 'border-[#2D5A27] bg-[#2D5A27]/5 text-[#2D5A27] font-semibold'
                              : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                          }`}
                        >
                          <span>{pay.label}</span>
                          {paymentMethod === pay.id && <Check className="w-3.5 h-3.5 text-[#2D5A27]" />}
                        </button>
                      ))}
                    </div>

                    {/* Payment Info Note */}
                    {(settings.waveNumber || settings.orangeMoneyNumber) && (
                      <div className="mt-2 p-2.5 rounded-lg bg-amber-50/60 border border-amber-200/60 text-[11px] text-amber-900 flex items-start gap-2">
                        <CreditCard className="w-3.5 h-3.5 text-amber-700 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold">Coordonnées de règlement Horon Mousso :</p>
                          <p>
                            {settings.waveNumber && `Wave : ${settings.waveNumber} `}
                            {settings.orangeMoneyNumber && `| Orange Money : ${settings.orangeMoneyNumber}`}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Remarques ou instructions particulières (facultatif)
                    </label>
                    <textarea
                      id="cart-customer-notes"
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ex: Livrer de préférence après 14h, emballage sous vide souhaité..."
                      className="w-full px-3.5 py-1.5 text-xs rounded-lg border border-neutral-200 focus:outline-hidden focus:ring-2 focus:ring-[#2D5A27]"
                    />
                  </div>
                </div>

                {/* Subtotal & Action buttons */}
                <div className="pt-3 border-t border-neutral-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-neutral-600">Total estimé de la commande :</span>
                    <span className="text-lg font-bold text-[#2D5A27]">
                      {cartTotalAmount > 0 ? formatFCFA(cartTotalAmount) : 'À confirmer avec l\'atelier'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <button
                      id="btn-submit-cart-whatsapp"
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-sm transition-all shadow-md active:scale-98 disabled:opacity-50"
                    >
                      <MessageSquare className="w-5 h-5 fill-white" />
                      {isSubmitting ? 'Préparation...' : 'Confirmer la commande sur WhatsApp'}
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
                          Commande copiée !
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-neutral-500" />
                          Copier le résumé du bon de commande
                        </>
                      )}
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-neutral-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#2D5A27]" />
                    <span>Transaction directe avec le service client Horon Mousso</span>
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
