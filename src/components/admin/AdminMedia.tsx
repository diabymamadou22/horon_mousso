import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MediaItem, MediaCategory } from '../../types';
import { 
  PlusCircle, 
  Image as ImageIcon, 
  Video, 
  Trash2, 
  Play, 
  AlertTriangle, 
  X, 
  Upload, 
  ExternalLink 
} from 'lucide-react';

interface AdminMediaProps {
  isAddModalOpenInitially?: boolean;
  onCloseAddModalInitial?: () => void;
}

export const AdminMedia: React.FC<AdminMediaProps> = ({
  isAddModalOpenInitially = false,
  onCloseAddModalInitial
}) => {
  const { media, addMedia, deleteMedia, products, announcements } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(isAddModalOpenInitially);
  const [mediaToDelete, setMediaToDelete] = useState<MediaItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'image' | 'video'>('image');
  const [url, setUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [category, setCategory] = useState<MediaCategory>('production');
  const [caption, setCaption] = useState('');
  const [relatedProductId, setRelatedProductId] = useState('');
  const [relatedAnnouncementId, setRelatedAnnouncementId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setTitle('');
    setType('image');
    setUrl('');
    setThumbnailUrl('');
    setCategory('production');
    setCaption('');
    setRelatedProductId('');
    setRelatedAnnouncementId('');
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
    if (onCloseAddModalInitial) onCloseAddModalInitial();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    setIsSubmitting(true);
    try {
      await addMedia({
        title,
        type,
        url,
        thumbnailUrl: thumbnailUrl || url,
        category,
        caption,
        relatedProductId: relatedProductId || undefined,
        relatedAnnouncementId: relatedAnnouncementId || undefined
      });
      handleCloseModal();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!mediaToDelete || isDeleting) return;
    setIsDeleting(true);
    try {
      const success = await deleteMedia(mediaToDelete.id);
      if (success) {
        setMediaToDelete(null);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // Local file upload for media
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setUrl(reader.result);
          if (file.type.startsWith('video/')) {
            setType('video');
          } else {
            setType('image');
            setThumbnailUrl(reader.result);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-sky-700" />
            <span>Gestion des Médias (Photos & Vidéos)</span>
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Alimentez la galerie publique et associez des visuels aux fiches produits et annonces. ({media.length} médias)
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold py-3 px-5 rounded-xl shadow-xs transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Ajouter un Média</span>
        </button>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {media.map((item) => (
          <div
            key={item.id}
            className="group relative bg-white rounded-2xl border border-stone-200 overflow-hidden flex flex-col justify-between shadow-2xs hover:shadow-md transition"
          >
            <div className="relative aspect-square bg-stone-100 overflow-hidden">
              <img
                src={item.thumbnailUrl || item.url}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition"
                referrerPolicy="no-referrer"
              />

              <div className="absolute top-2 right-2">
                {item.type === 'video' ? (
                  <span className="w-6 h-6 rounded-full bg-purple-700 text-white flex items-center justify-center shadow">
                    <Play className="w-3 h-3 ml-0.5" fill="currentColor" />
                  </span>
                ) : (
                  <span className="w-6 h-6 rounded-full bg-stone-900/70 text-white flex items-center justify-center shadow">
                    <ImageIcon className="w-3 h-3" />
                  </span>
                )}
              </div>

              <div className="absolute bottom-1 left-2">
                <span className="text-[9px] font-bold text-white bg-stone-950/70 px-1.5 py-0.5 rounded">
                  {item.category}
                </span>
              </div>
            </div>

            <div className="p-3 space-y-1">
              <h4 className="font-bold text-xs text-stone-900 line-clamp-1">{item.title}</h4>
              <p className="text-[10px] text-stone-400 line-clamp-1">{item.caption || 'Sans légende'}</p>
            </div>

            <div className="p-2 border-t border-stone-100 flex items-center justify-between">
              <span className="text-[10px] font-semibold text-stone-400 capitalize">
                {item.type === 'video' ? 'Vidéo' : 'Photo'}
              </span>
              <button
                onClick={() => setMediaToDelete(item)}
                className="p-1 text-stone-400 hover:text-rose-600 rounded transition"
                title="Supprimer ce média"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {mediaToDelete && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-stone-200 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-extrabold text-stone-900">
                Supprimer ce média ?
              </h3>
              <p className="text-xs text-stone-500">
                « <span className="font-bold text-stone-800">{mediaToDelete.title}</span> » sera définitivement retiré.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setMediaToDelete(null)}
                className="py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {isDeleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Media Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50">
              <h3 className="font-extrabold text-base text-stone-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-sky-700" />
                <span>Ajouter un Média (Photo ou Vidéo)</span>
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-1.5 text-stone-400 hover:text-stone-800 rounded-full hover:bg-stone-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Titre du Média <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Triage des piments rouges séchés au soleil"
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Type de Média</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-semibold"
                  >
                    <option value="image">Photo / Image</option>
                    <option value="video">Vidéo (MP4)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Catégorie Galerie</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as MediaCategory)}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-semibold"
                  >
                    <option value="produits">Produits finis</option>
                    <option value="production">Production & Atelier</option>
                    <option value="entreprise">Entreprise & Terroir</option>
                    <option value="marche">Marchés & Salons</option>
                    <option value="evenements">Événements</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  URL du Média (Image ou Vidéo) <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://... (direct link)"
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
                />
                <div className="mt-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 text-[11px] font-bold py-1 px-3 rounded-lg transition">
                    <Upload className="w-3 h-3" />
                    <span>Téléverser un fichier local</span>
                    <input
                      type="file"
                      accept={type === 'video' ? 'video/*' : 'image/*'}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {type === 'video' && (
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Miniature pour la vidéo (URL Image)
                  </label>
                  <input
                    type="url"
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    placeholder="https://... (image affichée avant lecture)"
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Légende / Description</label>
                <textarea
                  rows={2}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Contexte de la photo ou explication du reportage..."
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              {/* Associations */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Associer à un Produit</label>
                  <select
                    value={relatedProductId}
                    onChange={(e) => setRelatedProductId(e.target.value)}
                    className="w-full text-xs p-2 bg-stone-50 border border-stone-200 rounded-xl"
                  >
                    <option value="">-- Aucun produit --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Associer à une Annonce</label>
                  <select
                    value={relatedAnnouncementId}
                    onChange={(e) => setRelatedAnnouncementId(e.target.value)}
                    className="w-full text-xs p-2 bg-stone-50 border border-stone-200 rounded-xl"
                  >
                    <option value="">-- Aucune annonce --</option>
                    {announcements.map(a => (
                      <option key={a.id} value={a.id}>{a.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Enregistrement...' : 'Ajouter le média'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
