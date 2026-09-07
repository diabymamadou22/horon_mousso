import React, { useState } from 'react';
import { useApp, AdminTab } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  Package, 
  Megaphone, 
  Image as ImageIcon, 
  Mail, 
  Settings as SettingsIcon, 
  LogOut, 
  ExternalLink, 
  Menu, 
  X,
  Leaf,
  Cloud
} from 'lucide-react';
import { SyncStatusModal } from '../common/SyncStatusModal';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { 
    adminTab, 
    setAdminTab, 
    currentUser, 
    logout, 
    setIsAdminMode, 
    settings,
    messages,
    syncStatus 
  } = useApp();

  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  const unreadMessagesCount = messages.filter(m => m.status === 'nouveau').length;

  const menuItems: { id: AdminTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'produits', label: 'Produits', icon: Package },
    { id: 'annonces', label: 'Annonces & Actus', icon: Megaphone },
    { id: 'medias', label: 'Médias & Galerie', icon: ImageIcon },
    { id: 'messages', label: 'Messages', icon: Mail, badge: unreadMessagesCount },
    { id: 'parametres', label: 'Paramètres', icon: SettingsIcon },
  ];

  const handleSelectTab = (tab: AdminTab) => {
    setAdminTab(tab);
    setIsMobileNavOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col text-[#2D3436]">
      {/* Top Admin Bar */}
      <header className="bg-[#1B3022] text-white sticky top-0 z-30 border-b border-[#2D5A27]/40 shadow-xs">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="lg:hidden p-2 text-gray-300 hover:text-white rounded-lg cursor-pointer"
              aria-label="Ouvrir le menu admin"
            >
              {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#2D5A27] flex items-center justify-center text-white font-bold text-xs">
                AT
              </div>
              <div className="font-bold text-sm sm:text-base tracking-tight text-white">
                Espace Gestion <span className="text-emerald-300 font-normal hidden sm:inline">• {settings.companyName}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setIsSyncModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 hover:text-white bg-white/10 hover:bg-white/20 py-1.5 px-3 rounded-full transition cursor-pointer"
              title="Statut Base Cloud & Locale (Multi-Appareils)"
            >
              <Cloud className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Synchro Multi-Appareils</span>
              <span className={`w-2 h-2 rounded-full ${syncStatus.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
            </button>

            <button
              onClick={() => setIsAdminMode(false)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-200 hover:text-white bg-white/10 hover:bg-white/20 py-1.5 px-3 rounded-full transition cursor-pointer"
            >
              <span>Portail Client</span>
              <ExternalLink className="w-3.5 h-3.5 text-emerald-300" />
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs text-emerald-200 pl-2 border-l border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{currentUser?.name || 'Administrateur'}</span>
            </div>

            <button
              onClick={logout}
              className="p-1.5 text-gray-300 hover:text-red-300 transition rounded-lg cursor-pointer"
              title="Déconnexion"
              aria-label="Déconnexion"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-[#E0E0E0] p-4 space-y-6 shrink-0">
          <div className="space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-3 py-1">
              Menu Gestion
            </div>
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = adminTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isActive
                      ? 'bg-[#2D5A27] text-white shadow-xs'
                      : 'text-gray-600 hover:bg-[#FAF9F6] hover:text-[#1B3022]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-200' : 'text-gray-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#C53030] text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-[#E0E0E0] mt-auto space-y-2">
            <div className="p-3 bg-[#E8F5E9] rounded-xl border border-[#2D5A27]/20 text-xs text-[#1B3022] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#2D5A27]">
                <Leaf className="w-3.5 h-3.5 text-[#2D5A27]" />
                <span>Synchronisation Active</span>
              </div>
              <p className="text-[11px] text-gray-600">
                Toutes les modifications sont enregistrées en direct.
              </p>
            </div>

            <button
              onClick={logout}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-[#C53030] hover:bg-red-50 rounded-xl transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </aside>

        {/* Mobile Nav Overlay */}
        {isMobileNavOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs flex">
            <div className="w-72 bg-white h-full p-4 flex flex-col space-y-4 shadow-2xl animate-in slide-in-from-left">
              <div className="flex items-center justify-between pb-3 border-b border-[#E0E0E0]">
                <span className="font-extrabold text-[#1B3022] text-sm">Navigation Admin</span>
                <button
                  onClick={() => setIsMobileNavOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-[#1B3022] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                {menuItems.map(item => {
                  const Icon = item.icon;
                  const isActive = adminTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                        isActive
                          ? 'bg-[#2D5A27] text-white'
                          : 'text-gray-700 hover:bg-[#FAF9F6]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="bg-[#C53030] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-[#E0E0E0] mt-auto space-y-2">
                <button
                  onClick={() => {
                    setIsAdminMode(false);
                    setIsMobileNavOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#FAF9F6] border border-[#E0E0E0] text-[#1B3022] font-bold rounded-xl text-xs cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Voir le site public</span>
                </button>
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-50 text-[#C53030] font-bold rounded-xl text-xs cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Déconnexion</span>
                </button>
              </div>
            </div>
            <div className="flex-1" onClick={() => setIsMobileNavOpen(false)}></div>
          </div>
        )}

        {/* Dynamic Admin Body View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Sync Status & Multi-Device Modal */}
      <SyncStatusModal 
        isOpen={isSyncModalOpen} 
        onClose={() => setIsSyncModalOpen(false)} 
      />
    </div>
  );
};
