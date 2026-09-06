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
  Sparkles
} from 'lucide-react';

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
    setAdminTab, 
    settings 
  } = useApp();

  const photosCount = media.filter(m => m.type === 'image').length;
  const videosCount = media.filter(m => m.type === 'video').length;
  const unreadMessagesCount = messages.filter(m => m.status === 'nouveau').length;

  const stats = [
    {
      label: 'Produits au Catalogue',
      value: products.length,
      icon: Package,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50 border-emerald-200',
      action: () => setAdminTab('produits')
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
      label: 'Photos Répertoire',
      value: photosCount,
      icon: ImageIcon,
      color: 'text-sky-700',
      bg: 'bg-sky-50 border-sky-200',
      action: () => setAdminTab('medias')
    },
    {
      label: 'Vidéos de Production',
      value: videosCount,
      icon: Video,
      color: 'text-purple-700',
      bg: 'bg-purple-50 border-purple-200',
      action: () => setAdminTab('medias')
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

      {/* Quick Action Grid */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-4">
        <h2 className="text-base font-extrabold text-stone-900 uppercase tracking-wider text-xs">
          Raccourcis & Actions Rapides
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
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
