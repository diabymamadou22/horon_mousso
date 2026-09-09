import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Package, 
  Megaphone, 
  Image as ImageIcon, 
  Video, 
  Mail, 
  PlusCircle, 
  ArrowRight, 
  Check, 
  Clock, 
  AlertCircle,
  Sparkles,
  Cloud,
  Database,
  RefreshCw,
  CheckCircle2,
  Wifi,
  Smartphone,
  Layers,
  ShoppingBag,
  Star,
  FileSpreadsheet,
  TrendingUp,
  CreditCard,
  Users,
  Download
} from 'lucide-react';
import { formatFCFA } from '../../utils/cartUtils';

interface AdminDashboardProps {
  onOpenAddProduct: () => void;
  onOpenAddAnnouncement: () => void;
  onOpenAddMedia: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onOpenAddProduct,
  onOpenAddAnnouncement,
  onOpenAddMedia
}) => {
  const { 
    products, 
    announcements, 
    media, 
    messages, 
    orders,
    reviews,
    setAdminTab, 
    settings,
    syncStatus,
    forceSync,
    isLoading,
    showToast
  } = useApp();

  const photosCount = media.filter(m => m.type === 'image').length;
  const videosCount = media.filter(m => m.type === 'video').length;
  const unreadMessagesCount = messages.filter(m => m.status === 'nouveau').length;
  const pendingOrdersCount = orders.filter(o => o.status === 'en_attente' || o.status === 'en_preparation').length;
  const deliveredOrdersCount = orders.filter(o => o.status === 'livree').length;
  const totalRevenue = orders
    .filter(o => o.status !== 'annulee')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const averageBasket = orders.length > 0 
    ? Math.round(totalRevenue / orders.length) 
    : 0;

  // Breakdown by payment methods
  const waveOrders = orders.filter(o => o.paymentMethod?.toLowerCase().includes('wave'));
  const omOrders = orders.filter(o => o.paymentMethod?.toLowerCase().includes('orange') || o.paymentMethod?.toLowerCase().includes('om'));
  const cashOrders = orders.filter(o => o.paymentMethod?.toLowerCase().includes('espece') || o.paymentMethod?.toLowerCase().includes('livraison'));

  const exportOrdersCSV = () => {
    if (orders.length === 0) {
      showToast('Aucune commande à exporter', 'info');
      return;
    }

    const headers = [
      'Numéro Commande',
      'Date',
      'Nom Client',
      'Téléphone',
      'Email',
      'Mode Livraison',
      'Zone',
      'Total (FCFA)',
      'Mode Paiement',
      'Statut Commande'
    ];

    const rows = orders.map(o => [
      `"${o.orderNumber}"`,
      `"${new Date(o.createdAt).toLocaleString('fr-FR')}"`,
      `"${(o.customerName || '').replace(/"/g, '""')}"`,
      `"${(o.customerPhone || '').replace(/"/g, '""')}"`,
      `"${(o.customerEmail || '').replace(/"/g, '""')}"`,
      `"${o.deliveryType}"`,
      `"${(o.deliveryZone || '').replace(/"/g, '""')}"`,
      o.total || 0,
      `"${o.paymentMethod}"`,
      `"${o.status}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `commandes_horon_mousso_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Fichier CSV exporté avec succès !', 'success');
  };

  const stats = [
    {
      label: 'Commandes Enregistrées',
      value: orders.length,
      subValue: pendingOrdersCount > 0 ? `${pendingOrdersCount} à traiter` : 'Toutes traitées',
      icon: ShoppingBag,
      color: 'text-indigo-700',
      bg: 'bg-indigo-50 border-indigo-200',
      action: () => setAdminTab('commandes')
    },
    {
      label: 'Chiffre d\'Affaires Réalisé',
      value: formatFCFA(totalRevenue),
      subValue: 'Sur commandes actives',
      icon: CheckCircle2,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50 border-emerald-200',
      action: () => setAdminTab('commandes')
    },
    {
      label: 'Produits au Catalogue',
      value: products.length,
      icon: Package,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50 border-emerald-200',
      action: () => setAdminTab('produits')
    },
    {
      label: 'Avis Consommateurs',
      value: reviews.length,
      subValue: reviews.length > 0 ? `${(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)} ★ moyenne` : '0 avis',
      icon: Star,
      color: 'text-amber-700',
      bg: 'bg-amber-50 border-amber-200',
      action: () => setAdminTab('avis')
    },
    {
      label: 'Annonces & Actualités',
      value: announcements.length,
      icon: Megaphone,
      color: 'text-amber-700',
      bg: 'bg-amber-50 border-amber-200',
      action: () => setAdminTab('annonces')
    },
    {
      label: 'Messages Clients',
      value: messages.length,
      subValue: unreadMessagesCount > 0 ? `${unreadMessagesCount} non lu(s)` : 'Tous lus',
      icon: Mail,
      color: 'text-rose-700',
      bg: 'bg-rose-50 border-rose-200',
      action: () => setAdminTab('messages')
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header welcome banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Espace d'administration centralisé
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Tableau de Bord
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Gérez les produits, publiez les annonces de stock et traitez les messages pour <span className="font-semibold text-stone-800">{settings.companyName}</span>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenAddProduct}
            className="inline-flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nouveau Produit</span>
          </button>
          <button
            onClick={onOpenAddAnnouncement}
            className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nouvelle Annonce</span>
          </button>
        </div>
      </div>

      {/* 5 Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              onClick={stat.action}
              className={`p-5 rounded-2xl border ${stat.bg} shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-3`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700 leading-tight">
                  {stat.label}
                </span>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-black text-stone-900">
                  {stat.value}
                </div>
                {stat.subValue && (
                  <div className={`text-[11px] font-bold mt-0.5 ${unreadMessagesCount > 0 ? 'text-red-600' : 'text-stone-500'}`}>
                    {stat.subValue}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Financial & Performance Insights */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-stone-100">
          <div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              Pilotage Commercial & Trésorerie
            </span>
            <h2 className="text-lg font-black text-stone-900 mt-1">
              Performance Financière & Modes de Règlement
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportOrdersCSV}
              className="inline-flex items-center gap-2 bg-[#2D5A27] hover:bg-[#23481f] text-white text-xs font-bold py-2 px-3.5 rounded-xl shadow-xs transition cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span>Exporter CSV</span>
              <Download className="w-3 h-3 opacity-80" />
            </button>
            <button
              onClick={() => setAdminTab('commandes')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-700 hover:text-stone-950 bg-stone-100 hover:bg-stone-200 py-2 px-3 rounded-xl transition cursor-pointer"
            >
              <span>Voir Commandes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
            <span className="text-xs text-stone-500 font-medium">Panier Moyen Client</span>
            <div className="text-xl sm:text-2xl font-black text-stone-900 font-mono">
              {formatFCFA(averageBasket)}
            </div>
            <span className="text-[11px] text-stone-400 block">Sur l'ensemble des paniers passés</span>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-500 font-medium">Répartition Paiements</span>
              <CreditCard className="w-4 h-4 text-stone-400" />
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between items-center text-stone-700">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-500"></span> Wave</span>
                <span className="font-bold">{waveOrders.length} cmd</span>
              </div>
              <div className="flex justify-between items-center text-stone-700">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Orange Money</span>
                <span className="font-bold">{omOrders.length} cmd</span>
              </div>
              <div className="flex justify-between items-center text-stone-700">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Espèces / Autres</span>
                <span className="font-bold">{cashOrders.length} cmd</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
            <span className="text-xs text-stone-500 font-medium">Commandes Livrées</span>
            <div className="text-xl sm:text-2xl font-black text-emerald-800">
              {deliveredOrdersCount} / {orders.length}
            </div>
            <span className="text-[11px] text-emerald-700 font-semibold block">
              {orders.length > 0 ? Math.round((deliveredOrdersCount / orders.length) * 100) : 100}% de satisfaction & livraison
            </span>
          </div>
        </div>
      </div>

      {/* Real-time Multi-Device Sync Card */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center shrink-0">
            <Cloud className="w-6 h-6 text-[#2D5A27]" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-extrabold text-stone-900 text-sm">Synchronisation Multi-Appareils Active</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Cloud Firestore & Local
              </span>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed max-w-2xl">
              Les téléphones, tablettes et ordinateurs partagent le même catalogue et les mêmes commandes en temps réel. Les modifications effectuées ici sont automatiquement répercutées sur tous vos écrans.
            </p>
            <div className="text-[11px] text-stone-400 flex items-center gap-3 pt-1">
              <span className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${syncStatus.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                {syncStatus.isOnline ? 'En ligne' : 'Hors-ligne'}
              </span>
              <span>•</span>
              <span>Dernière synchro : {syncStatus.lastSyncTime || 'Automatique en direct'}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => forceSync()}
          disabled={isLoading}
          className="inline-flex items-center gap-2 text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-800 py-2.5 px-4 rounded-xl border border-stone-300 transition shrink-0 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-700 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Synchronisation...' : 'Synchroniser maintenant'}</span>
        </button>
      </div>

      {/* Quick Action Grid */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-4">
        <h2 className="text-base font-extrabold text-stone-900 uppercase tracking-wider text-xs">
          Raccourcis & Actions Rapides
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <button
            onClick={() => setAdminTab('bannieres')}
            className="flex items-center gap-3 p-3.5 rounded-xl border border-amber-300 hover:border-amber-600 hover:bg-amber-50/60 transition text-left group bg-amber-50/20"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <Megaphone className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-900">Panneau Pub (Hero)</div>
              <div className="text-[11px] text-stone-500">Affiches & bannières défilantes</div>
            </div>
          </button>

          <button
            onClick={() => setAdminTab('commandes')}
            className="flex items-center gap-3 p-3.5 rounded-xl border border-indigo-200 hover:border-indigo-600 hover:bg-indigo-50/50 transition text-left group"
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-900">Gérer les commandes</div>
              <div className="text-[11px] text-stone-400">
                {pendingOrdersCount > 0 ? `${pendingOrdersCount} en attente` : 'Suivi des livraisons'}
              </div>
            </div>
          </button>

          <button
            onClick={onOpenAddProduct}
            className="flex items-center gap-3 p-3.5 rounded-xl border border-stone-200 hover:border-emerald-600 hover:bg-emerald-50/50 transition text-left group"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-900">Ajouter un produit</div>
              <div className="text-[11px] text-stone-400">Piment, épice, purée</div>
            </div>
          </button>

          <button
            onClick={onOpenAddAnnouncement}
            className="flex items-center gap-3 p-3.5 rounded-xl border border-stone-200 hover:border-amber-600 hover:bg-amber-50/50 transition text-left group"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <Megaphone className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-900">Publier une annonce</div>
              <div className="text-[11px] text-stone-400">Stock, foire, atelier</div>
            </div>
          </button>

          <button
            onClick={() => setAdminTab('avis')}
            className="flex items-center gap-3 p-3.5 rounded-xl border border-amber-200 hover:border-amber-600 hover:bg-amber-50/50 transition text-left group"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <Star className="w-4 h-4 fill-amber-700" />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-900">Modérer les avis</div>
              <div className="text-[11px] text-stone-400">{reviews.length} retours clients</div>
            </div>
          </button>

          <button
            onClick={onOpenAddMedia}
            className="flex items-center gap-3 p-3.5 rounded-xl border border-stone-200 hover:border-sky-600 hover:bg-sky-50/50 transition text-left group"
          >
            <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-900">Ajouter photo / vidéo</div>
              <div className="text-[11px] text-stone-400">Galerie & produits</div>
            </div>
          </button>

          <button
            onClick={() => setAdminTab('messages')}
            className="flex items-center gap-3 p-3.5 rounded-xl border border-stone-200 hover:border-rose-600 hover:bg-rose-50/50 transition text-left group"
          >
            <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-900">Voir les messages</div>
              <div className="text-[11px] text-stone-400">Demandes de contact</div>
            </div>
          </button>
        </div>
      </div>

      {/* Bottom dual columns: Recent Messages & Recent Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Recent Customer Messages */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-stone-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-700" />
              <span>Derniers Messages Reçus ({messages.length})</span>
            </h3>
            <button
              onClick={() => setAdminTab('messages')}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
            >
              <span>Tout voir</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {messages.length > 0 ? (
            <div className="space-y-3">
              {messages.slice(0, 3).map(msg => (
                <div 
                  key={msg.id}
                  onClick={() => setAdminTab('messages')}
                  className="p-3.5 rounded-2xl bg-stone-50 hover:bg-stone-100/80 border border-stone-200/70 transition cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-stone-900">{msg.name}</span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      msg.status === 'nouveau' ? 'bg-red-100 text-red-800' : 'bg-stone-200 text-stone-700'
                    }`}>
                      {msg.status === 'nouveau' ? 'Nouveau' : 'Lu'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {msg.message}
                  </p>
                  <div className="text-[10px] text-stone-400">
                    Contact : {msg.contact}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-stone-400 py-6 text-center">Aucun message client reçu.</p>
          )}
        </div>

        {/* Right: Products Overview */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-stone-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-700" />
              <span>Produits au Catalogue ({products.length})</span>
            </h3>
            <button
              onClick={() => setAdminTab('produits')}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
            >
              <span>Gérer le catalogue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {products.slice(0, 4).map(prod => (
              <div
                key={prod.id}
                onClick={() => setAdminTab('produits')}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-stone-50 border border-transparent hover:border-stone-200 transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={prod.mainImage}
                    alt=""
                    className="w-10 h-10 rounded-lg object-cover bg-stone-100"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="text-xs font-bold text-stone-900 line-clamp-1">{prod.name}</div>
                    <div className="text-[11px] text-stone-400">{prod.format}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-emerald-800">{prod.price || '—'}</div>
                  <div className="text-[10px] text-stone-500 capitalize">{prod.availability}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
