import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MediaCategory, MediaItem } from '../../types';
import { FadeInView, FadeInStagger, FadeInItem } from '../common/FadeInView';
import { Image, Video, Play, X, Layers, Film } from 'lucide-react';
import { LazyProductImage } from '../common/LazyProductImage';

export const GalleryPage: React.FC = () => {
  const { media } = useApp();
  const [selectedFilter, setSelectedFilter] = useState<'all' | MediaCategory | 'videos'>('all');
  const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);

  const filterTabs = [
    { id: 'all' as const, label: 'Tous les médias' },
    { id: 'produits' as const, label: 'Produits' },
    { id: 'production' as const, label: 'Production & Atelier' },
    { id: 'entreprise' as const, label: 'L’Entreprise & Champs' },
    { id: 'marche' as const, label: 'Marchés & Salons' },
    { id: 'evenements' as const, label: 'Événements' },
    { id: 'videos' as const, label: 'Vidéos' },
  ];

  const filteredMedia = media.filter(item => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'videos') return item.type === 'video';
    return item.category === selectedFilter;
  });

  return (
    <div className="py-6 sm:py-8 px-4 sm:px-8 lg:px-10 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <FadeInView direction="up" distance={20} duration={0.6}>
        <div className="space-y-2 text-center max-w-2xl mx-auto">
          <span className="inline-block px-3 py-0.5 bg-[#E8F5E9] text-[#2D5A27] text-xs font-bold uppercase tracking-widest rounded-md">
            Galerie Multimédia
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B3022] tracking-tight">
            Nos Terroirs, Nos Équipes & Nos Récoltes en Images
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
            Plongez au cœur de notre activité agricole : la sélection des épices, le séchage au soleil, l’unité de mouture, les marchés et nos événements.
          </p>
        </div>
      </FadeInView>

      {/* Filter Chips */}
      <FadeInView direction="up" distance={16} delay={0.1} duration={0.5}>
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {filterTabs.map(tab => {
            const isSelected = selectedFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  isSelected
                    ? 'bg-[#2D5A27] text-white shadow-xs'
                    : 'bg-white border border-[#E0E0E0] text-gray-600 hover:text-[#2D5A27] hover:border-[#2D5A27]/40'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </FadeInView>

      {/* Gallery Grid */}
      {filteredMedia.length > 0 ? (
        <FadeInStagger staggerDelay={0.06} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMedia.map(item => (
            <FadeInItem key={item.id}>
              <div
                onClick={() => setActiveMedia(item)}
                style={{ contentVisibility: 'auto', containIntrinsicSize: '280px' }}
                className="group relative aspect-square rounded-2xl overflow-hidden bg-[#FAF9F6] border border-[#E0E0E0] shadow-xs hover:shadow-md cursor-pointer transition transform hover:-translate-y-0.5"
              >
                {/* Media Preview: Image or Video */}
                {item.type === 'video' ? (
                  item.thumbnailUrl ? (
                    <LazyProductImage
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#182F1E] via-[#24422A] to-[#0F1E14] flex flex-col items-center justify-center p-4 text-white">
                      <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <Play className="w-7 h-7 text-amber-400 fill-amber-400 ml-1" />
                      </div>
                      <span className="text-xs font-semibold text-stone-200 line-clamp-1 max-w-[85%] text-center">
                        {item.title}
                      </span>
                    </div>
                  )
                ) : (
                  <LazyProductImage
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition pointer-events-none"></div>

                {/* Type Badge */}
                <div className="absolute top-3 right-3 pointer-events-none">
                  {item.type === 'video' ? (
                    <span className="w-8 h-8 rounded-full bg-[#2D5A27] text-white flex items-center justify-center shadow">
                      <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
                    </span>
                  ) : (
                    <span className="w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center shadow">
                      <Image className="w-4 h-4" />
                    </span>
                  )}
                </div>

                {/* Caption at bottom */}
                <div className="absolute bottom-0 inset-x-0 p-4 text-white space-y-1 pointer-events-none">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                    {item.category}
                  </span>
                  <h4 className="text-xs font-bold line-clamp-2 leading-snug">
                    {item.title}
                  </h4>
                </div>
              </div>
            </FadeInItem>
          ))}
        </FadeInStagger>
      ) : media.length === 0 ? (
        <FadeInView direction="up" distance={20}>
          <div className="bg-white rounded-3xl border border-stone-200/80 p-12 text-center max-w-lg mx-auto shadow-sm space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
              <Image className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-[#1B3022]">Galerie en cours d'actualisation</h3>
              <p className="text-stone-500 text-sm leading-relaxed">
                De nouveaux clichés et reportages vidéo de nos récoltes, ateliers et produits seront bientôt publiés ici.
              </p>
            </div>
          </div>
        </FadeInView>
      ) : (
        <FadeInView direction="up" distance={20}>
          <div className="bg-white rounded-2xl border border-[#E0E0E0] p-12 text-center max-w-md mx-auto">
            <p className="text-gray-500 text-sm">Aucun média dans cette catégorie.</p>
          </div>
        </FadeInView>
      )}

      {/* Lightbox / Media Viewer Modal */}
      {activeMedia && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-[#1B3022] rounded-3xl overflow-hidden border border-[#2D5A27]/40 flex flex-col shadow-2xl">
            {/* Header bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2D5A27]/40 text-white">
              <div className="space-y-0.5">
                <h3 className="font-bold text-base sm:text-lg">{activeMedia.title}</h3>
                <span className="text-xs text-emerald-300 font-semibold uppercase tracking-wider">
                  Catégorie : {activeMedia.category}
                </span>
              </div>
              <button
                onClick={() => setActiveMedia(null)}
                className="p-2 text-gray-300 hover:text-white rounded-full hover:bg-white/10 transition cursor-pointer"
                aria-label="Fermer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Media Content */}
            <div className="relative bg-black flex items-center justify-center max-h-[70vh] overflow-hidden">
              {activeMedia.type === 'video' ? (
                <video
                  src={activeMedia.url}
                  controls
                  autoPlay
                  className="w-full max-h-[70vh] object-contain"
                >
                  Votre navigateur ne supporte pas la vidéo.
                </video>
              ) : (
                <img
                  src={activeMedia.url}
                  alt={activeMedia.title}
                  className="w-full max-h-[70vh] object-contain"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>

            {/* Caption bottom bar */}
            {activeMedia.caption && (
              <div className="p-4 bg-black/40 text-gray-200 text-xs sm:text-sm border-t border-[#2D5A27]/40">
                {activeMedia.caption}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
