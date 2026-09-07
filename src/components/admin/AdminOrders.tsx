import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Clock, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Phone, 
  MessageSquare, 
  MapPin, 
  CreditCard, 
  ChevronDown, 
  Printer, 
  Trash2, 
  Eye, 
  DollarSign, 
  ArrowUpRight,
  Package,
  Calendar,
  Download,
  FileSpreadsheet,
  Users
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus, PaymentStatus } from '../../types';
import { formatFCFA } from '../../utils/cartUtils';

export const AdminOrders: React.FC = () => {
  const { 
    orders, 
    updateOrderStatus, 
    deleteOrder, 
    setLastPlacedOrder,
    settings, 
    showToast 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'tous'>('tous');
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | 'tous'>('tous');
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<Order | null>(null);

  // CSV Export for business reporting & accounting
  const exportOrdersToCSV = () => {
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
      'Zone Livraison',
      'Adresse',
      'Articles',
      'Sous-total (FCFA)',
      'Frais Livraison (FCFA)',
      'Total (FCFA)',
      'Mode Paiement',
      'Statut Paiement',
      'Statut Commande',
      'Notes'
    ];

    const rows = orders.map(o => [
      `"${o.orderNumber}"`,
      `"${new Date(o.createdAt).toLocaleString('fr-FR')}"`,
      `"${(o.customerName || '').replace(/"/g, '""')}"`,
      `"${(o.customerPhone || '').replace(/"/g, '""')}"`,
      `"${(o.customerEmail || '').replace(/"/g, '""')}"`,
      `"${o.deliveryType}"`,
      `"${(o.deliveryZone || '').replace(/"/g, '""')}"`,
      `"${(o.deliveryAddress || '').replace(/"/g, '""')}"`,
      `"${o.items.map(i => `${i.quantity}x ${i.productName} (${i.format})`).join(' ; ').replace(/"/g, '""')}"`,
      o.subtotal || 0,
      o.deliveryFee || 0,
      o.total || 0,
      `"${o.paymentMethod}"`,
      `"${o.paymentStatus || 'en_attente'}"`,
      `"${o.status}"`,
      `"${(o.notes || '').replace(/"/g, '""')}"`
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
    showToast('Fichier CSV des commandes exporté avec succès !', 'success');
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchSearch = 
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerPhone.includes(searchTerm) ||
        (order.deliveryAddress && order.deliveryAddress.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus = statusFilter === 'tous' || order.status === statusFilter;
      const matchPayment = paymentFilter === 'tous' || order.paymentStatus === paymentFilter;

      return matchSearch && matchStatus && matchPayment;
    });
  }, [orders, searchTerm, statusFilter, paymentFilter]);

  // Quick statistics
  const stats = useMemo(() => {
    const totalCount = orders.length;
    const pendingCount = orders.filter(o => o.status === 'en_attente').length;
    const preparingCount = orders.filter(o => o.status === 'en_preparation').length;
    const deliveringCount = orders.filter(o => o.status === 'en_livraison').length;
    const deliveredCount = orders.filter(o => o.status === 'livree').length;
    const totalRevenue = orders
      .filter(o => o.status !== 'annulee')
      .reduce((sum, o) => sum + (o.total || 0), 0);

    return { totalCount, pendingCount, preparingCount, deliveringCount, deliveredCount, totalRevenue };
  }, [orders]);

  const handleSendWhatsAppUpdate = (order: Order, newStatus?: OrderStatus) => {
    const cleanPhone = order.customerPhone.replace(/[^0-9]/g, '');
    const currentStatus = newStatus || order.status;

    let statusText = "est bien enregistrée et prise en charge.";
    if (currentStatus === 'en_preparation') {
      statusText = "est actuellement en cours de préparation et conditionnement à l'atelier.";
    } else if (currentStatus === 'en_livraison') {
      statusText = "a été confiée à notre livreur et est en cours d'acheminement vers votre adresse.";
    } else if (currentStatus === 'livree') {
      statusText = "a été livrée avec succès. Nous vous remercions chaleureusement pour votre confiance en Horon Mousso !";
    }

    const msg = `Bonjour ${order.customerName},\n\nIci l'équipe *${settings.companyName || 'Horon Mousso'}*. Nous vous informons que votre commande *${order.orderNumber}* ${statusText}\n\nMontant : ${formatFCFA(order.total)}\nAdresse : ${order.deliveryAddress}\n\nRestant à votre disposition pour toute question !`;

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'en_attente':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3" /> En attente
          </span>
        );
      case 'en_preparation':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Package className="w-3 h-3" /> En préparation
          </span>
        );
      case 'en_livraison':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
            <Truck className="w-3 h-3" /> En cours de livraison
          </span>
        );
      case 'livree':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Livrée
          </span>
        );
      case 'annulee':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
            <XCircle className="w-3 h-3" /> Annulée
          </span>
        );
    }
  };

  const getPaymentBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'paye':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Payé
          </span>
        );
      case 'en_attente':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" /> En attente
          </span>
        );
      case 'rembourse':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-neutral-100 text-neutral-600 border border-neutral-200">
            Remboursé
          </span>
        );
    }
  };

  const averageBasket = stats.totalCount > 0 
    ? Math.round(stats.totalRevenue / stats.totalCount) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Top Header & Export Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-black text-neutral-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#2D5A27]" />
            Commandes & Suivi Commercial
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Gérez les expéditions, suivez les encaissements Mobile Money et téléchargez vos états comptables.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportOrdersToCSV}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#2D5A27] hover:bg-[#23481f] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
            title="Exporter toutes les commandes au format CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
            <span>Exporter en CSV</span>
            <Download className="w-3.5 h-3.5 opacity-80" />
          </button>
        </div>
      </div>

      {/* Top Banner / KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <span className="text-xs font-medium text-neutral-500 block">Total Commandes</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-neutral-900">{stats.totalCount}</span>
            <ShoppingBag className="w-5 h-5 text-neutral-400" />
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block">Toutes périodes confondues</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <span className="text-xs font-medium text-neutral-500 block">En Attente / Préparation</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-amber-600">
              {stats.pendingCount + stats.preparingCount}
            </span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <span className="text-[11px] text-amber-700/80 mt-1 block">
            {stats.pendingCount} nouvelles • {stats.preparingCount} en atelier
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <span className="text-xs font-medium text-neutral-500 block">En Expédition</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-indigo-600">{stats.deliveringCount}</span>
            <Truck className="w-5 h-5 text-indigo-500" />
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block">{stats.deliveredCount} livrées avec succès</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <span className="text-xs font-medium text-neutral-500 block">Chiffre d'Affaires Enregistré</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl md:text-2xl font-black text-[#2D5A27] font-mono">
              {formatFCFA(stats.totalRevenue)}
            </span>
            <DollarSign className="w-5 h-5 text-[#2D5A27]" />
          </div>
          <span className="text-[11px] text-emerald-700/80 mt-1 block">Commandes actives et livrées</span>
        </div>
      </div>

      {/* CRM & Commerce Insights Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-stone-50 border border-stone-200/80 rounded-xl p-3.5 text-xs text-stone-700">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-100/70 text-emerald-800 flex items-center justify-center shrink-0">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-stone-500 block font-medium">Panier Moyen</span>
            <span className="font-bold text-stone-900 font-mono text-sm">{formatFCFA(averageBasket)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-100/70 text-blue-800 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-stone-500 block font-medium">Clients Récurrents / Actifs</span>
            <span className="font-bold text-stone-900 text-sm">{new Set(orders.map(o => o.customerPhone || o.customerName)).size} clients</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-100/70 text-purple-800 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-stone-500 block font-medium">Taux de Satisfaction / Livraison</span>
            <span className="font-bold text-stone-900 text-sm">
              {stats.totalCount > 0 ? Math.round((stats.deliveredCount / stats.totalCount) * 100) : 100}% de succès
            </span>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par N° commande, nom du client, téléphone ou adresse..."
              className="w-full pl-9 pr-4 py-2 text-xs md:text-sm rounded-lg border border-neutral-200 focus:outline-hidden focus:ring-2 focus:ring-[#2D5A27]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-neutral-500">
              <Filter className="w-3.5 h-3.5" />
              <span>Statut :</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-xs py-1.5 px-3 rounded-lg border border-neutral-200 bg-white focus:ring-2 focus:ring-[#2D5A27]"
            >
              <option value="tous">Tous les statuts ({orders.length})</option>
              <option value="en_attente">En attente ({orders.filter(o => o.status === 'en_attente').length})</option>
              <option value="en_preparation">En préparation</option>
              <option value="en_livraison">En livraison</option>
              <option value="livree">Livrée ({orders.filter(o => o.status === 'livree').length})</option>
              <option value="annulee">Annulée</option>
            </select>

            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as any)}
              className="text-xs py-1.5 px-3 rounded-lg border border-neutral-200 bg-white focus:ring-2 focus:ring-[#2D5A27]"
            >
              <option value="tous">Tous les paiements</option>
              <option value="paye">Payé</option>
              <option value="en_attente">Paiement en attente</option>
              <option value="rembourse">Remboursé</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-2xs overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-neutral-400">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-neutral-300 stroke-1" />
            <p className="text-sm font-semibold text-neutral-700">Aucune commande trouvée</p>
            <p className="text-xs text-neutral-400 mt-1">
              Modifiez vos critères de recherche ou attendez les nouvelles commandes clients.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-50/80 border-b border-neutral-200 text-neutral-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Commande</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Articles & Détail</th>
                  <th className="py-3 px-4">Zone / Livraison</th>
                  <th className="py-3 px-4">Montant Net</th>
                  <th className="py-3 px-4">Statut Commande</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-50/60 transition-colors">
                    {/* Order Reference */}
                    <td className="py-3.5 px-4 align-top">
                      <span className="font-mono font-bold text-neutral-900 block text-xs">
                        {order.orderNumber}
                      </span>
                      <span className="text-[11px] text-neutral-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4 align-top">
                      <p className="font-bold text-neutral-900 text-xs">{order.customerName}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <a
                          href={`tel:${order.customerPhone}`}
                          className="text-neutral-500 hover:text-neutral-800 flex items-center gap-1 text-[11px]"
                          title="Appeler le client"
                        >
                          <Phone className="w-3 h-3 text-neutral-400" />
                          {order.customerPhone}
                        </a>
                        <button
                          onClick={() => handleSendWhatsAppUpdate(order)}
                          className="text-[#25D366] hover:opacity-80 p-0.5 rounded"
                          title="Contacter sur WhatsApp"
                        >
                          <MessageSquare className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    {/* Items */}
                    <td className="py-3.5 px-4 align-top max-w-xs">
                      <div className="space-y-1">
                        {order.items.slice(0, 2).map((it, idx) => (
                          <div key={idx} className="text-[11px] text-neutral-700">
                            <strong className="text-neutral-900">{it.quantity}x</strong> {it.productName}{' '}
                            <span className="text-neutral-400">({it.format})</span>
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <span className="text-[10px] text-neutral-400 italic">
                            +{order.items.length - 2} autre(s) article(s)...
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Delivery & Address */}
                    <td className="py-3.5 px-4 align-top">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 text-neutral-700">
                        {order.deliveryZone || 'Bamako'}
                      </span>
                      <p className="text-[11px] text-neutral-500 mt-1 max-w-[180px] truncate" title={order.deliveryAddress}>
                        {order.deliveryAddress}
                      </p>
                    </td>

                    {/* Total & Payment */}
                    <td className="py-3.5 px-4 align-top">
                      <span className="font-mono font-black text-neutral-900 text-xs block">
                        {formatFCFA(order.total)}
                      </span>
                      <div className="mt-1 flex items-center gap-1">
                        {getPaymentBadge(order.paymentStatus)}
                      </div>
                      <span className="text-[10px] text-neutral-400 block mt-0.5 capitalize">
                        {order.paymentMethod.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Order Status Select */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="space-y-1.5">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                          className="text-[11px] font-bold py-1 px-2 rounded-lg border border-neutral-200 bg-white focus:ring-1 focus:ring-[#2D5A27]"
                        >
                          <option value="en_attente">⏳ En attente</option>
                          <option value="en_preparation">📦 En préparation</option>
                          <option value="en_livraison">🚚 En livraison</option>
                          <option value="livree">✅ Livrée</option>
                          <option value="annulee">❌ Annulée</option>
                        </select>

                        {/* Payment toggle */}
                        <div>
                          <button
                            onClick={() => updateOrderStatus(
                              order.id, 
                              order.status, 
                              order.paymentStatus === 'paye' ? 'en_attente' : 'paye'
                            )}
                            className="text-[10px] font-semibold text-neutral-500 hover:text-[#2D5A27] underline"
                          >
                            {order.paymentStatus === 'paye' ? 'Marquer impayé' : 'Marquer comme payé'}
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 align-top text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedOrderForDetails(order)}
                        className="p-1.5 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors"
                        title="Voir tous les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setLastPlacedOrder(order)}
                        className="p-1.5 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors"
                        title="Afficher & Imprimer le Bon de commande"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleSendWhatsAppUpdate(order)}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Notifier le client par WhatsApp"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (window.confirm(`Voulez-vous supprimer la commande ${order.orderNumber} ?`)) {
                            deleteOrder(order.id);
                          }
                        }}
                        className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer la commande"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detailed Order Inspector Modal */}
      {selectedOrderForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div 
            className="fixed inset-0" 
            onClick={() => setSelectedOrderForDetails(null)} 
            aria-hidden="true" 
          />
          <div className="relative z-10 w-full max-w-xl bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden text-xs">
            <div className="flex items-center justify-between p-4 border-b border-neutral-200 bg-neutral-50">
              <div>
                <h3 className="font-bold text-sm text-neutral-900">
                  Détail de la commande {selectedOrderForDetails.orderNumber}
                </h3>
                <p className="text-neutral-500 text-[11px]">
                  Enregistrée le {new Date(selectedOrderForDetails.createdAt).toLocaleString('fr-FR')}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderForDetails(null)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                <div>
                  <span className="text-neutral-400 uppercase text-[10px] font-bold block">Client</span>
                  <p className="font-bold text-neutral-900 mt-0.5">{selectedOrderForDetails.customerName}</p>
                  <p className="text-neutral-600">{selectedOrderForDetails.customerPhone}</p>
                  {selectedOrderForDetails.customerEmail && (
                    <p className="text-neutral-500">{selectedOrderForDetails.customerEmail}</p>
                  )}
                </div>
                <div>
                  <span className="text-neutral-400 uppercase text-[10px] font-bold block">Adresse de livraison</span>
                  <p className="font-semibold text-neutral-800 mt-0.5">{selectedOrderForDetails.deliveryAddress}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded bg-white border border-neutral-200 text-neutral-700 text-[10px]">
                    Zone : {selectedOrderForDetails.deliveryZone}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-neutral-800 mb-2">Articles commandés :</h4>
                <div className="border border-neutral-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-neutral-50 text-neutral-500 text-[11px]">
                      <tr>
                        <th className="py-2 px-3">Produit</th>
                        <th className="py-2 px-2 text-center">Format</th>
                        <th className="py-2 px-2 text-center">Qté</th>
                        <th className="py-2 px-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {selectedOrderForDetails.items.map((it, idx) => (
                        <tr key={idx}>
                          <td className="py-2 px-3 font-semibold text-neutral-900">{it.productName}</td>
                          <td className="py-2 px-2 text-center text-neutral-600">{it.format}</td>
                          <td className="py-2 px-2 text-center font-bold text-neutral-800">{it.quantity}</td>
                          <td className="py-2 px-3 text-right font-mono font-semibold text-neutral-900">
                            {formatFCFA(it.totalPrice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <div className="w-60 space-y-1.5 text-right">
                  <div className="flex justify-between text-neutral-600">
                    <span>Sous-total :</span>
                    <span className="font-mono">{formatFCFA(selectedOrderForDetails.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Frais livraison :</span>
                    <span className="font-mono">{formatFCFA(selectedOrderForDetails.deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between font-black text-neutral-900 pt-1.5 border-t border-neutral-200">
                    <span>TOTAL :</span>
                    <span className="font-mono text-sm text-[#2D5A27]">
                      {formatFCFA(selectedOrderForDetails.total)}
                    </span>
                  </div>
                </div>
              </div>

              {selectedOrderForDetails.notes && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                  <span className="font-bold text-[10px] uppercase block">Remarques ou instructions client :</span>
                  <p className="mt-0.5 italic">{selectedOrderForDetails.notes}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-4 bg-neutral-50 border-t border-neutral-200">
              <button
                onClick={() => setSelectedOrderForDetails(null)}
                className="px-3.5 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 font-semibold text-neutral-700"
              >
                Fermer
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setLastPlacedOrder(selectedOrderForDetails);
                    setSelectedOrderForDetails(null);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-[#2D5A27] hover:bg-[#24481f] text-white font-bold flex items-center gap-1.5 shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimer le reçu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
