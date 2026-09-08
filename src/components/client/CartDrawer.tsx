import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Truck, 
  Store, 
  ArrowRight,
  MapPin,
  Phone,
  User,
  MessageCircle,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatFCFA } from '../../utils/cartUtils';
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
    settings,
    setActiveTab,
    showToast
  } = useApp();

  const [deliveryType, setDeliveryType] = useState<'livraison' | 'retrait'>('livraison');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wave');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCartOpen) return null;

  const deliveryFee = deliveryType === 'retrait' ? 0 : 1000;
  const grandTotal = cartTotalAmount + deliveryFee;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      showToast('Veuillez indiquer votre nom.', 'error');
      return;
    }
    if (!customerPhone.trim()) {
      showToast('Veuillez indiquer votre numéro de téléphone / WhatsApp.', 'error');
      return;
    }
    if (deliveryType === 'livraison' && !customerAddress.trim()) {
      showToast('Veuillez indiquer votre quartier ou adresse à Bamako.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const order = await createDirectOrder({
        name: customerName.trim(),
        phone: customerPhone.trim(),
        address: deliveryType === 'retrait' ? 'Retrait en boutique / Atelier Horon Mousso' : customerAddress.trim(),
        deliveryZone: deliveryType === 'retrait' ? 'Retrait en boutique' : 'Bamako',
        deliveryFee,
        deliveryType,
        paymentMethod
      });

      if (order) {
        const rawNumber = settings.whatsapp || settings.phone || '';
        const cleanNumber = rawNumber.replace(/[^0-9]/g, '');
        const itemsSummary = order.items.map((it, idx) => 
          `${idx + 1}. *${it.quantity}x ${it.productName}* (${it.format}) : ${formatFCFA(it.totalPrice)}`
        ).join('\n');

        const orderMsg = 
`*COMMANDE HORON MOUSSO* 🌿
N° : *${order.orderNumber}*
----------------------------------------
${itemsSummary}

📦 *Sous-total :* ${formatFCFA(order.subtotal)}
🚚 *Livraison :* ${deliveryFee === 0 ? 'Gratuite (Retrait)' : formatFCFA(deliveryFee)}
💰 *TOTAL À PAYER :* ${formatFCFA(grandTotal)}

👤 *Client :* ${order.customerName}
📞 *Téléphone :* ${order.customerPhone}
📍 *Mode :* ${order.deliveryType === 'retrait' ? 'Retrait en Boutique' : 'Livraison à domicile'}
${order.deliveryType === 'livraison' ? `🏠 *Adresse :* ${order.deliveryAddress}\n` : ''}💳 *Paiement souhaité :* ${paymentMethod.replace('_', ' ').toUpperCase()}

Bonjour, je viens de passer cette commande. Pouvez-vous me confirmer la disponibilité et l'horaire de livraison ?`;

        if (cleanNumber) {
          const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(orderMsg)}`;
          window.open(url, '_blank');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="cart-drawer-overlay" className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      {/* Click outside to close */}
      <div 
        className="fixed inset-0" 
        onClick={() => setIsCartOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div 
        id="cart-drawer-panel"
        className="relative z-10 flex flex-col w-full max-w-md h-full bg-white shadow-2xl overflow-hidden border-l border-neutral-200"
      >
        {/* Simple Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 bg-[#0F2916] text-white">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#E5A100]" />
            <h2 className="text-base font-bold text-white">
              Mon Panier ({cartTotalCount})
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {cart.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="text-xs text-stone-300 hover:text-red-300 transition cursor-pointer"
              >
                Vider
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-stone-300 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-3">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-stone-800 mb-1">Votre panier est vide</h3>
              <p className="text-xs text-stone-500 max-w-xs mb-5">
                Découvrez nos épices pures, notre soumbala d'exception et nos piments savamment séchés.
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsCartOpen(false);
                  setActiveTab('produits');
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F2916] text-white text-xs font-bold hover:bg-[#184424] transition cursor-pointer"
              >
                Voir les produits
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitOrder} className="space-y-5">
              {/* 1. Products List */}
              <div className="space-y-2.5">
                <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Articles</p>
                <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden bg-white">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3">
                      <img 
                        src={item.product.mainImage} 
                        alt={item.product.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-lg object-cover bg-stone-100 border border-stone-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-stone-900 truncate">
                          {item.product.name}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                          <span className="font-semibold text-stone-700">{item.format}</span>
                          <span>•</span>
                          <span className="font-bold text-[#1E4D2B]">
                            {formatFCFA(item.unitPriceNumeric * item.quantity)}
                          </span>
                        </div>
                      </div>

                      {/* Quantity controls */}
                      <div className="flex items-center gap-1 border border-stone-200 rounded-lg p-0.5 bg-stone-50">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center hover:bg-white rounded text-stone-600 transition"
                          aria-label="Moins"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-bold text-stone-800">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center hover:bg-white rounded text-stone-600 transition"
                          aria-label="Plus"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-stone-300 hover:text-red-500 p-1 transition"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Simple Delivery Option */}
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Mode de réception</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('livraison')}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      deliveryType === 'livraison'
                        ? 'border-[#1E4D2B] bg-[#1E4D2B]/5 text-[#1E4D2B] ring-1 ring-[#1E4D2B]'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <Truck className="w-4 h-4 text-[#1E4D2B]" />
                    <span>Livraison (1 000 F)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryType('retrait')}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      deliveryType === 'retrait'
                        ? 'border-[#1E4D2B] bg-[#1E4D2B]/5 text-[#1E4D2B] ring-1 ring-[#1E4D2B]'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <Store className="w-4 h-4 text-[#1E4D2B]" />
                    <span>Retrait (Gratuit)</span>
                  </button>
                </div>
              </div>

              {/* 3. Essential Customer Details (3 fields only) */}
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Vos coordonnées</p>
                
                <div className="space-y-2">
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Votre nom complet"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:border-[#1E4D2B] bg-stone-50/50"
                    />
                  </div>

                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Numéro WhatsApp ou Téléphone (ex: 70 00 11 22)"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:border-[#1E4D2B] bg-stone-50/50"
                    />
                  </div>

                  {deliveryType === 'livraison' && (
                    <div className="relative">
                      <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                      <input
                        type="text"
                        required={deliveryType === 'livraison'}
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        placeholder="Quartier ou repère à Bamako (ex: Badalabougou)"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:border-[#1E4D2B] bg-stone-50/50"
                      />
                    </div>
                  )}

                  {/* Payment preference */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-stone-500 font-medium">Paiement :</span>
                    <div className="flex gap-1.5 text-[11px]">
                      {(['wave', 'orange_money', 'especes_livraison'] as PaymentMethod[]).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPaymentMethod(p)}
                          className={`px-2 py-1 rounded-lg border font-semibold cursor-pointer transition ${
                            paymentMethod === p
                              ? 'bg-[#0F2916] text-white border-[#0F2916]'
                              : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          {p === 'wave' ? 'Wave' : p === 'orange_money' ? 'Orange Money' : 'Espèces'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Total & Single Direct Action */}
              <div className="pt-3 border-t border-stone-200 space-y-3">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-stone-600">
                    <span>Articles ({cartTotalCount})</span>
                    <span className="font-semibold">{formatFCFA(cartTotalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Livraison</span>
                    <span className="font-semibold">
                      {deliveryFee === 0 ? <span className="text-[#1E4D2B] font-bold">Gratuit</span> : formatFCFA(deliveryFee)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-stone-900 pt-1 border-t border-stone-100">
                    <span>Total Net :</span>
                    <span className="text-base text-[#0F2916] font-bold">{formatFCFA(grandTotal)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer disabled:opacity-50"
                >
                  <MessageCircle className="w-5 h-5 fill-white" />
                  <span>{isSubmitting ? 'Préparation...' : 'Commander sur WhatsApp'}</span>
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[10px] text-stone-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#1E4D2B]" />
                  <span>Confirmation directe et sans frais par l'équipe Horon Mousso</span>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

