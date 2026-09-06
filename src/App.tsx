import React, { useState, useEffect } from 'react';
import { useApp } from './context/AppContext';
import { ToastContainer } from './components/common/ToastContainer';

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

import { MessageCircle } from 'lucide-react';

export default function App() {
  const { 
    isAdminMode, 
    setIsAdminMode,
    currentUser, 
    activeTab, 
    adminTab,
    setAdminTab,
    openOrderWhatsApp,
    settings
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
      {/* Global Notifications */}
      <ToastContainer />

      {/* Product Detail Modal */}
      <ProductDetailModal />

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

          {/* Floating WhatsApp Quick Order Button */}
          <div className="fixed bottom-6 right-6 z-40">
            <button
              onClick={() => openOrderWhatsApp()}
              className="flex items-center gap-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3.5 px-5 rounded-full shadow-2xl transition transform hover:scale-105 active:scale-95 group border border-emerald-600"
              title="Commander ou poser une question sur WhatsApp"
              aria-label="Commander sur WhatsApp"
            >
              <MessageCircle className="w-5 h-5 text-white animate-bounce" />
              <span className="text-xs sm:text-sm tracking-tight font-extrabold pr-1">
                Commander
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
