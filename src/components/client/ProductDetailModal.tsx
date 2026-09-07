import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  MessageCircle, 
  PhoneCall, 
  Send, 
  Check, 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  ShieldCheck, 
  Leaf, 
  Package, 
  Tag, 
  ArrowLeft,
  ShoppingBag,
  Plus,
  Minus 
} from 'lucide-react';

export const ProductDetailModal: React.FC = () => {
  const { 
    selectedProductId, 
    closeProductDetail, 
    products, 
    settings, 
    openOrderWhatsApp, 
    sendContactMessage,
    addToCart,
    setIsCartOpen
  } = useApp();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedFormat, setSelectedFormat] = useState('');

  const product = products.find(p => p.id === selectedProductId);

  // Initialize selected format when product changes
  useEffect(() => {
    if (product) {
      setQuantity(1);
      const formats = product.format ? product.format.split(',').map(f => f.trim()) : [];
      setSelectedFormat(formats[0] || 'Standard');
    }
  }, [product]);

  if (!product) return null;

  const allImages = [product.mainImage, ...(product.additionalImages || [])].filter(Boolean);
  const activeImage = allImages[activeImageIndex] || product.mainImage;
  const availableFormats = product.format ? product.format.split(',').map(f => f.trim()).filter(Boolean) : [];

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contact.trim() || !message.trim()) return;
    setIsSending(true);
    const success = await sendContactMessage(
      name, 
      contact, 
      message, 
      `${product.name} (Format: ${product.format})`
    );
    setIsSending(false);
    if (success) {
      setName('');
      setContact('');
      setMessage('');
      setShowContactForm(false);
    }
  };

  const getAvailabilityBadge = (avail: typeof product.availability) => {
    switch (avail) {
      case 'disponible':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2D5A27] bg-[#E8F5E9] px-3 py-1 rounded-full">
            <Check className="w-3.5 h-3.5 text-[#2D5A27]" />
            Produit disponible en stock
          </span>
        );
      case 'sur_commande':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Disponible sur commande
          </span>
        );
      case 'rupture':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C53030] bg-red-100 px-3 py-1 rounded-full">
            <AlertTriangle className="w-3.5 h-3.5 text-[#C53030]" />
            Rupture temporaire
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-[#E0E0E0] overflow-hidden flex flex-col my-8">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E0E0E0] bg-[#FAF9F6]">
          <button
            onClick={closeProductDetail}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-[#1B3022] text-sm font-semibold transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour aux produits</span>
          </button>
          <button
            onClick={closeProductDetail}
            className="p-2 text-gray-400 hover:text-gray-800 rounded-full hover:bg-stone-200/60 transition cursor-pointer"
            aria-label="Fermer la vue"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 max-h-[78vh] overflow-y-auto">
          {/* Photos & Gallery Column */}
          <div className="md:col-span-6 space-y-4">
            <div className="aspect-4/3 sm:aspect-square w-full rounded-2xl overflow-hidden bg-[#FAF9F6] border border-[#E0E0E0] shadow-inner relative">
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-cover transition duration-300"
                referrerPolicy="no-referrer"
              />
              {product.isNew && (
                <div className="absolute top-3 left-3 inline-flex items-center gap-1 bg-[#C53030] text-white text-xs font-black px-2.5 py-1 rounded-md shadow-sm">
                  <Sparkles className="w-3 h-3" />
                  Nouveauté
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition cursor-pointer ${
                      activeImageIndex === idx 
                        ? 'border-[#2D5A27] ring-2 ring-[#2D5A27]/20' 
                        : 'border-gray-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img 
                      src={img} 
                      alt="" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer" 
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Quality badge card */}
            <div className="p-4 rounded-xl bg-[#E8F5E9] border border-[#2D5A27]/20 text-xs text-[#1B3022] space-y-2">
              <div className="flex items-center gap-2 font-bold text-[#2D5A27]">
                <ShieldCheck className="w-4 h-4 text-[#2D5A27]" />
                Garantie Pureté & Qualité Agroalimentaire
              </div>
              <p className="text-gray-600 leading-relaxed">
                Produit sélectionné, déshydraté et conditionné selon des règles d'hygiène rigoureuses. 100% naturel.
              </p>
            </div>
          </div>

          {/* Product Details Column */}
          <div className="md:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2D5A27] bg-[#E8F5E9] px-3 py-1 rounded-md">
                  {product.category === 'piments' ? 'Piments' : product.category === 'epices' ? 'Épices' : 'Produits transformés'}
                </span>
                {getAvailabilityBadge(product.availability)}
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1B3022] leading-tight">
                {product.name}
              </h2>

              {product.price && (
                <div className="flex items-baseline gap-3">
                  <span className="text-sm font-semibold text-gray-500">Tarif indicatif :</span>
                  <span className="text-2xl font-black text-[#2D5A27]">
                    {product.price}
                  </span>
                </div>
              )}

              {/* Format / Conditioning */}
              <div className="p-3.5 rounded-xl bg-[#FAF9F6] border border-[#E0E0E0] text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#1B3022]">
                  <Package className="w-4 h-4 text-[#2D5A27]" />
                  <span>Conditionnements & Formats disponibles :</span>
                </div>
                <div className="font-semibold text-gray-700 pl-5">
                  {product.format}
                </div>
              </div>

              {/* Descriptions */}
              <div className="space-y-2 text-gray-700 text-sm leading-relaxed">
                <p className="font-medium text-[#1B3022]">
                  {product.description}
                </p>
                {product.fullDescription && (
                  <p className="text-gray-600 pt-1">
                    {product.fullDescription}
                  </p>
                )}
              </div>

              {/* Additional Specs */}
              <div className="pt-3 border-t border-gray-100 space-y-2 text-xs">
                {product.composition && (
                  <div className="flex items-start gap-2">
                    <Leaf className="w-3.5 h-3.5 text-[#2D5A27] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#1B3022]">Composition : </span>
                      <span className="text-gray-600">{product.composition}</span>
                    </div>
                  </div>
                )}
                {product.origin && (
                  <div className="flex items-start gap-2">
                    <Tag className="w-3.5 h-3.5 text-[#2D5A27] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#1B3022]">Origine : </span>
                      <span className="text-gray-600">{product.origin}</span>
                    </div>
                  </div>
                )}
                {product.usageAdvice && (
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#1B3022]">Conseil d’utilisation : </span>
                      <span className="text-gray-600">{product.usageAdvice}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Commander / Contact Section */}
            <div className="pt-6 border-t border-[#E0E0E0] space-y-4">
              {/* Format selection if available */}
              {availableFormats.length > 1 && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Sélectionnez le format / conditionnement :
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableFormats.map((fmt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedFormat(fmt)}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition cursor-pointer ${
                          selectedFormat === fmt
                            ? 'border-[#2D5A27] bg-[#2D5A27] text-white shadow-xs'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300 bg-white'
                        }`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity selector */}
              {product.availability !== 'rupture' && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <span className="text-xs font-bold text-gray-700">Quantité souhaitée :</span>
                  <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden shadow-xs">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-1.5 px-3 hover:bg-gray-100 text-gray-700 font-bold transition cursor-pointer"
                      aria-label="Diminuer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 text-sm font-extrabold text-gray-900">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-1.5 px-3 hover:bg-gray-100 text-gray-700 font-bold transition cursor-pointer"
                      aria-label="Augmenter"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                {product.availability !== 'rupture' && (
                  <button
                    onClick={() => {
                      addToCart(product, quantity, selectedFormat);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-[#2D5A27] hover:bg-[#23471f] text-white font-extrabold text-sm py-3.5 px-6 rounded-xl shadow-md transition transform active:scale-98 cursor-pointer"
                  >
                    <ShoppingBag className="w-5 h-5 text-amber-300" />
                    <span>Ajouter au Panier ({quantity})</span>
                  </button>
                )}

                {/* Direct WhatsApp button */}
                <button
                  onClick={() => openOrderWhatsApp(product)}
                  className="w-full flex items-center justify-center gap-2.5 bg-[#C53030] hover:bg-[#A62828] text-white font-extrabold text-sm py-3.5 px-6 rounded-xl shadow-md transition transform active:scale-98 cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Commander directement sur WhatsApp</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowContactForm(!showContactForm)}
                  className="flex items-center justify-center gap-2 bg-[#FAF9F6] hover:bg-gray-100 border border-[#E0E0E0] text-gray-800 text-xs font-bold py-3 px-3 rounded-xl transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-gray-600" />
                  <span>{showContactForm ? 'Masquer formulaire' : 'Formulaire de demande'}</span>
                </button>

                <a
                  href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                  className="flex items-center justify-center gap-2 bg-[#FAF9F6] hover:bg-gray-100 border border-[#E0E0E0] text-gray-800 text-xs font-bold py-3 px-3 rounded-xl transition cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-gray-600" />
                  <span>Appeler : {settings.phone}</span>
                </a>
              </div>

              {/* Inline Contact Form */}
              {showContactForm && (
                <form onSubmit={handleContactSubmit} className="mt-4 p-4 rounded-2xl bg-[#FAF9F6] border border-[#E0E0E0] space-y-3 animate-in fade-in duration-200">
                  <div className="text-xs font-bold text-[#1B3022]">
                    Envoyer une demande directe pour « {product.name} »
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Votre nom ou entreprise *"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2D5A27] bg-white"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Téléphone ou email *"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      required
                      className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2D5A27] bg-white"
                    />
                  </div>
                  <div>
                    <textarea
                      placeholder={`Votre message ou quantité souhaitée (ex: 25kg ou 1 carton)...`}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      rows={3}
                      className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2D5A27] bg-white"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSending}
                    className="w-full bg-[#2D5A27] hover:bg-[#23471F] text-white font-bold text-xs py-2.5 px-4 rounded-xl transition disabled:opacity-50 cursor-pointer"
                  >
                    {isSending ? 'Envoi en cours...' : 'Envoyer la demande à l\'entreprise'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
