import React, { useState, useEffect } from 'react';
import { useApp } from './context/AppContext';
import { ToastContainer } from './components/common/ToastContainer';
import { AppLoader } from './components/common/AppLoader';
import { PWAInstallButton } from './components/common/PWAInstallButton';

// Client Portal Components
import { Navbar } from './components/client/Navbar';
import { HeroSection } from './components/client/HeroSection';
import { HomeSections } from './components/client/HomeSections';
import { ProductsPage } from './components/client/ProductsPage';
import { AnnouncementsPage } from './components/client/AnnouncementsPage';
import { GalleryPage } from './components/client/GalleryPage';
import { AboutPage } from './components/client/AboutPage';
import { ContactPage } from './components/client/ContactPage';
import { ProductDetailModal } from './components/client/ProductDetailModal';
import { CartDrawer } from './components/client/CartDrawer';
import { Footer } from './components/client/Footer';

// Admin Portal Components
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminProducts } from './components/admin/AdminProducts';
import { AdminAnnouncements } from './components/admin/AdminAnnouncements';
import { AdminMedia } from './components/admin/AdminMedia';
import { AdminMessages } from './components/admin/AdminMessages';
import { AdminSettings } from './components/admin/AdminSettings';

import { MessageCircle, ShoppingBag } from 'lucide-react';

export default function App() {
  const { 
    isAdminMode, 
    setIsAdminMode,
    currentUser, 
    activeTab, 
    adminTab,
    setAdminTab,
    openOrderWhatsApp,
    settings,
    setIsCartOpen,
    cartTotalCount
  } = useApp();

  // Action states for quick modal opening from dashboard
  const [openAddProductFromDash, setOpenAddProductFromDash] = useState(false);
  const [openAddAnnouncementFromDash, setOpenAddAnnouncementFromDash] = useState(false);
  const [openAddMediaFromDash, setOpenAddMediaFromDash] = useState(false);

  // Scroll to top on client tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 font-sans text-stone-900 selection:bg-emerald-800 selection:text-white">
      {/* Brand Initial App Loader */}
      <AppLoader />

      {/* Global Notifications */}
      <ToastContainer />

      {/* Product Detail Modal */}
      <ProductDetailModal />

      {/* Shopping Cart Drawer */}
      <CartDrawer />

      {/* Floating PWA Install Notification Prompt */}
      <PWAInstallButton variant="banner" />

      {/* --- RENDER LOGIC --- */}
      {isAdminMode ? (
        // ----------------- ESPACE 2 : ESPACE ADMINISTRATEUR -----------------
        !currentUser ? (
          <AdminLogin />
        ) : (
          <AdminLayout>
            {adminTab === 'dashboard' && (
              <AdminDashboard
                onOpenAddProduct={() => {
                  setAdminTab('produits');
                  setOpenAddProductFromDash(true);
                }}
                onOpenAddAnnouncement={() => {
                  setAdminTab('annonces');
                  setOpenAddAnnouncementFromDash(true);
                }}
                onOpenAddMedia={() => {
                  setAdminTab('medias');
                  setOpenAddMediaFromDash(true);
                }}
              />
            )}

            {adminTab === 'produits' && (
              <AdminProducts
                isAddModalOpenInitially={openAddProductFromDash}
                onCloseAddModalInitial={() => setOpenAddProductFromDash(false)}
              />
            )}

            {adminTab === 'annonces' && (
              <AdminAnnouncements
                isAddModalOpenInitially={openAddAnnouncementFromDash}
                onCloseAddModalInitial={() => setOpenAddAnnouncementFromDash(false)}
              />
            )}

            {adminTab === 'medias' && (
              <AdminMedia
                isAddModalOpenInitially={openAddMediaFromDash}
                onCloseAddModalInitial={() => setOpenAddMediaFromDash(false)}
              />
            )}

            {adminTab === 'messages' && <AdminMessages />}

            {adminTab === 'parametres' && <AdminSettings />}
          </AdminLayout>
        )
      ) : (
        // ----------------- ESPACE 1 : PORTAIL CLIENT -----------------
        <div className="flex-1 flex flex-col">
          {/* Main Navigation Bar */}
          <Navbar />

          {/* Tab Views */}
          <main className="flex-1">
            {activeTab === 'accueil' && (
              <div className="space-y-4">
                <HeroSection />
                <HomeSections />
              </div>
            )}

            {activeTab === 'produits' && <ProductsPage />}

            {activeTab === 'actualites' && <AnnouncementsPage />}

            {activeTab === 'galerie' && <GalleryPage />}

            {activeTab === 'a_propos' && <AboutPage />}

            {activeTab === 'contact' && <ContactPage />}
          </main>

          {/* Floating Actions (Cart & WhatsApp) */}
          <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
            {/* Floating Cart Button */}
            <button
              id="btn-floating-cart"
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 bg-[#2D5A27] hover:bg-[#23471f] text-white font-bold py-3 px-4 rounded-full shadow-xl transition-all transform hover:scale-105 active:scale-95 border border-white/20"
              title="Voir mon panier Horon Mousso"
              aria-label="Voir mon panier"
            >
              <ShoppingBag className="w-5 h-5 text-amber-300" />
              <span className="text-xs font-semibold pr-1 hidden sm:inline">Panier</span>
              {cartTotalCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-neutral-950 border-2 border-white animate-pulse">
                  {cartTotalCount}
                </span>
              )}
            </button>

            {/* Floating WhatsApp Quick Order Button */}
            <button
              id="btn-floating-whatsapp"
              onClick={() => openOrderWhatsApp()}
              className="flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-5 rounded-full shadow-2xl transition transform hover:scale-105 active:scale-95 group border border-emerald-500"
              title="Poser une question ou commander directement sur WhatsApp"
              aria-label="Poser une question sur WhatsApp"
            >
              <MessageCircle className="w-5 h-5 text-white" />
              <span className="text-xs sm:text-sm tracking-tight font-extrabold pr-1">
                WhatsApp
              </span>
            </button>
          </div>

          {/* Footer */}
          <Footer />
        </div>
      )}
    </div>
  );
}
