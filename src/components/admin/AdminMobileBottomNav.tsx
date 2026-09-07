import React from 'react';
import { useApp, AdminTab } from '../../context/AppContext';
import { LayoutDashboard, Package, ShoppingBag, Mail, Menu } from 'lucide-react';

interface AdminMobileBottomNavProps {
  onOpenMoreMenu: () => void;
}

export const AdminMobileBottomNav: React.FC<AdminMobileBottomNavProps> = ({ onOpenMoreMenu }) => {
  const { adminTab, setAdminTab, messages, orders } = useApp();

  const unreadCount = messages.filter(m => m.status === 'nouveau').length;
  const pendingOrdersCount = orders.filter(o => o.status === 'en_attente' || o.status === 'en_preparation').length;

  const tabs: { id: AdminTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'dashboard', label: 'Bord', icon: LayoutDashboard },
    { id: 'commandes', label: 'Commandes', icon: ShoppingBag, badge: pendingOrdersCount },
    { id: 'produits', label: 'Produits', icon: Package },
    { id: 'messages', label: 'Messages', icon: Mail, badge: unreadCount },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-safe">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = adminTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`admin-mobile-nav-${tab.id}`}
              onClick={() => {
                setAdminTab(tab.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex-1 flex flex-col items-center justify-center py-1 relative min-h-[48px] rounded-xl transition-all cursor-pointer ${
                isActive 
                  ? 'text-[#2D5A27] font-bold' 
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <div className={`relative p-1 rounded-xl transition-all ${
                isActive ? 'bg-[#E8F5E9] scale-110' : ''
              }`}>
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#C53030] px-1 text-[9px] font-black text-white shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10.5px] leading-tight tracking-tight mt-0.5 ${
                isActive ? 'font-black' : 'font-medium'
              }`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#2D5A27] absolute -bottom-0.5"></span>
              )}
            </button>
          );
        })}

        {/* Plus / Menu button */}
        <button
          id="admin-mobile-nav-more"
          onClick={onOpenMoreMenu}
          className="flex-1 flex flex-col items-center justify-center py-1 relative min-h-[48px] text-stone-500 hover:text-stone-800 rounded-xl transition-all cursor-pointer"
          aria-label="Plus d'options"
        >
          <div className="p-1 rounded-xl">
            <Menu className="w-5 h-5 stroke-2" />
          </div>
          <span className="text-[10.5px] font-medium leading-tight tracking-tight mt-0.5">
            Plus
          </span>
        </button>
      </div>
    </div>
  );
};
