import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Announcement } from '../../types';
import { FadeInView, FadeInStagger, FadeInItem } from '../common/FadeInView';
import { Calendar, Play, FileText, ArrowRight, X, Sparkles } from 'lucide-react';

export const AnnouncementsPage: React.FC = () => {
  const { announcements } = useApp();
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  // Filter only published announcements for public visitors
  const publishedAnnouncements = announcements.filter(a => a.status === 'publie');

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="py-12 px-4 sm:px-8 lg:px-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <FadeInView direction="up" distance={20} duration={0.6}>
        <div className="space-y-3 text-center max-w-2xl mx-auto">
          <span className="inline-block px-3 py-1 bg-[#E8F5E9] text-[#2D5A27] text-xs font-bold uppercase tracking-widest rounded-md">
            Actualités & Annonces
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1B3022] tracking-tight">
            La Vie de Notre Entreprise & Nos Nouveautés
          </h1>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            Suivez nos arrivages de stocks, l’évolution de notre unité de transformation artisanale, nos participations aux foires agricoles et nos nouveaux formats.
          </p>
        </div>
      </FadeInView>

      {/* Announcements Grid */}
      {publishedAnnouncements.length > 0 ? (
        <FadeInStagger staggerDelay={0.08} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publishedAnnouncements.map((ann) => (
            <FadeInItem key={ann.id}>
              <article
                className="h-full bg-white rounded-2xl border border-[#E0E0E0] shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col group hover:border-[#2D5A27]/40"
              >
                {/* Media Thumbnail */}
                <div 
                  onClick={() => setSelectedAnnouncement(ann)}
                  className="relative aspect-16/10 w-full bg-[#FAF9F6] overflow-hidden cursor-pointer"
                >
                  {ann.image ? (
                    <img
                      src={ann.image}
                      alt={ann.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                      <FileText className="w-12 h-12" />
                    </div>
                  )}

                  {/* Video Indicator */}
                  {ann.video && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition">
                      <div className="w-12 h-12 rounded-full bg-[#2D5A27] text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition">
                        <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
                      </div>
                    </div>
                  )}

                  {/* Category Pill */}
                  {ann.category && (
                    <div className="absolute top-3 left-3 bg-[#1B3022]/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-md">
                      {ann.category}
                    </div>
                  )}
                </div>

                {/* Text info */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Calendar className="w-3.5 h-3.5 text-[#2D5A27]" />
                      <span>{formatDate(ann.date || ann.createdAt)}</span>
                    </div>

                    <h3 
                      onClick={() => setSelectedAnnouncement(ann)}
                      className="font-bold text-lg text-[#1B3022] group-hover:text-[#2D5A27] transition cursor-pointer leading-snug line-clamp-2"
                    >
                      {ann.title}
                    </h3>

                    <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                      {ann.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedAnnouncement(ann)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2D5A27] hover:underline transition cursor-pointer"
                    >
                      <span>{ann.video ? 'Regarder & Lire plus' : 'Lire la suite'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    {ann.video && (
                      <span className="text-[11px] font-semibold text-[#2D5A27] bg-[#E8F5E9] px-2.5 py-0.5 rounded-full">
                        Vidéo
                      </span>
                    )}
                  </div>
                </div>
              </article>
            </FadeInItem>
          ))}
        </FadeInStagger>
      ) : (
        <FadeInView direction="up" distance={20}>
          <div className="bg-white rounded-2xl border border-[#E0E0E0] p-12 text-center max-w-md mx-auto space-y-3">
            <p className="text-gray-500 text-sm">Aucune annonce publiée pour le moment.</p>
          </div>
        </FadeInView>
      )}

      {/* Announcement Detail Modal with Video Player */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-[#E0E0E0] overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E0E0E0] bg-[#FAF9F6]">
              <div className="flex items-center gap-2 text-xs text-[#2D5A27] font-bold uppercase tracking-wider">
                <span>{selectedAnnouncement.category || 'Actualité'}</span>
                <span>•</span>
                <span className="text-gray-500 font-normal">
                  {formatDate(selectedAnnouncement.date || selectedAnnouncement.createdAt)}
                </span>
              </div>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="p-2 text-gray-400 hover:text-gray-800 rounded-full hover:bg-stone-100 transition cursor-pointer"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1B3022] leading-tight">
                {selectedAnnouncement.title}
              </h2>

              {/* Embedded Video if present */}
              {selectedAnnouncement.video ? (
                <div className="space-y-2">
                  <div className="aspect-16/9 w-full bg-black rounded-2xl overflow-hidden shadow-md">
                    <video
                      src={selectedAnnouncement.video}
                      controls
                      autoPlay={false}
                      className="w-full h-full object-cover"
                      poster={selectedAnnouncement.image}
                    >
                      Votre navigateur ne supporte pas la lecture de vidéo.
                    </video>
                  </div>
                  <p className="text-[11px] text-gray-500 text-center italic">
                    Lecteur vidéo intégré — Visionnez notre reportage directement
                  </p>
                </div>
              ) : selectedAnnouncement.image ? (
                <div className="aspect-16/9 w-full rounded-2xl overflow-hidden bg-gray-100">
                  <img
                    src={selectedAnnouncement.image}
                    alt={selectedAnnouncement.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : null}

              {/* Content text */}
              <div className="space-y-4 text-gray-700 text-sm sm:text-base leading-relaxed">
                <p className="font-semibold text-[#1B3022] text-base">
                  {selectedAnnouncement.description}
                </p>
                {selectedAnnouncement.content && (
                  <div className="text-gray-700 whitespace-pre-line leading-relaxed pt-2 border-t border-gray-100">
                    {selectedAnnouncement.content}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-[#FAF9F6] border-t border-[#E0E0E0] flex justify-end">
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="bg-[#2D5A27] hover:bg-[#23471F] text-white text-xs font-bold py-2.5 px-6 rounded-xl transition cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
