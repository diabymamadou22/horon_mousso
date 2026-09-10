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
  ExternalLink,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { uploadMediaFile } from '../../utils/mediaUpload';

interface AdminMediaProps {
  isAddModalOpenInitially?: boolean;
  onCloseAddModalInitial?: () => void;
}

export const AdminMedia: React.FC<AdminMediaProps> = ({
  isAddModalOpenInitially = false,
  onCloseAddModalInitial
}) => {
  const { media, addMedia, deleteMedia, deleteAllMedia, products, announcements } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(isAddModalOpenInitially);
  const [mediaToDelete, setMediaToDelete] = useState<MediaItem | null>(null);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const [successAlert, setSuccessAlert] = useState('');

  const resetForm = () => {
    setTitle('');
    setType('image');
    setUrl('');
    setThumbnailUrl('');
    setCategory('production');
    setCaption('');
    setRelatedProductId('');
    setRelatedAnnouncementId('');
    setSuccessAlert('');
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

  const saveMediaData = async (addAnother = false) => {
    if (!title.trim() || !url.trim()) return;

    setIsSubmitting(true);
    setSuccessAlert('');
    try {
      const created = await addMedia({
        title: title.trim(),
        type,
        url: url.trim(),
        thumbnailUrl: thumbnailUrl?.trim() || (type === 'image' ? url.trim() : undefined),
        category,
        caption: caption.trim(),
        productId: relatedProductId.trim() || undefined,
        announcementId: relatedAnnouncementId.trim() || undefined,
        relatedProductId: relatedProductId.trim() || undefined,
        relatedAnnouncementId: relatedAnnouncementId.trim() || undefined
      });

      if (addAnother) {
        resetForm();
        setSuccessAlert(`« ${created.title} » sauvegardé ! Vous pouvez ajouter le média suivant.`);
        setTimeout(() => setSuccessAlert(''), 5000);
      } else {
        handleCloseModal();
      }
    } catch (err) {
      console.error('Erreur enregistrement média:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveMediaData(false);
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

  const handleConfirmDeleteAll = async () => {
    if (isDeletingAll) return;
    setIsDeletingAll(true);
    try {
      const success = await deleteAllMedia();
      if (success) {
        setIsDeleteAllModalOpen(false);
      }
    } finally {
      setIsDeletingAll(false);
    }
  };

  // Optimized file upload for photos & videos with server + fallback
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      e.target.value = '';
      setIsUploading(true);
      setUploadStatusText('Traitement du fichier...');
      try {
        const result = await uploadMediaFile(file, (msg) => setUploadStatusText(msg), 'gallery');
        setUrl(result.url);
        if (result.type === 'video') {
          setType('video');
          if (result.thumbnailUrl) {
            setThumbnailUrl(result.thumbnailUrl);
          }
        } else {
          setType('image');
          setThumbnailUrl(result.thumbnailUrl || result.url);
        }
      } catch (err) {
        console.error('Erreur téléversement média:', err);
      } finally {
        setIsUploading(false);
        setUploadStatusText('');
      }
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-sky-700" />
            <span>Gestion des Médias (Photos & Vidéos)</span>
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Alimentez la galerie publique et associez des visuels aux fiches produits et annonces. ({media.length} médias)
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {media.length > 0 && (
            <button
              onClick={() => setIsDeleteAllModalOpen(true)}
              className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold py-2.5 px-3.5 rounded-xl shadow-2xs transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>Tout supprimer ({media.length})</span>
            </button>
          )}

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Ajouter un Média</span>
          </button>
        </div>
      </div>

      {/* Media Grid or Empty State */}
      {media.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-stone-200/90 text-center space-y-4 shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
            <ImageIcon className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-stone-800">Aucun média dans la galerie</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Tous les médias ont été supprimés. Le portail client affiche maintenant une galerie vide propre. Cliquez sur "Ajouter un Média" pour téléverser de nouveaux visuels.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Ajouter une photo ou vidéo</span>
          </button>
        </div>
      ) : (
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
      )}

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

      {/* Delete ALL Confirmation Modal */}
      {isDeleteAllModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-stone-200 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-extrabold text-stone-900">
                Tout supprimer dans la galerie ?
              </h3>
              <p className="text-xs text-stone-500">
                Vous êtes sur le point de supprimer définitivement les <span className="font-bold text-stone-800">{media.length} médias</span> de la galerie. Cette action est irréversible et synchronisée sur tous les appareils.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                disabled={isDeletingAll}
                onClick={() => setIsDeleteAllModalOpen(false)}
                className="py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isDeletingAll}
                onClick={handleConfirmDeleteAll}
                className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {isDeletingAll ? 'Suppression...' : 'Oui, tout supprimer'}
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
              {/* Success Alert Banner */}
              {successAlert && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-semibold animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successAlert}</span>
                </div>
              )}

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
                  URL ou Fichier du Média <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://... ou téléversez votre fichier ci-dessous"
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
                />
                <div className="mt-2.5 flex flex-wrap items-center gap-3">
                  <label className={`cursor-pointer inline-flex items-center gap-1.5 ${isUploading ? 'bg-stone-300 text-stone-500 cursor-not-allowed' : 'bg-emerald-700 hover:bg-emerald-800 text-white'} text-[11px] font-bold py-2 px-3.5 rounded-xl transition shadow-xs`}>
                    {isUploading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>{isUploading ? (uploadStatusText || 'Téléversement...') : type === 'video' ? 'Téléverser vidéo MP4' : 'Téléverser image'}</span>
                    <input
                      type="file"
                      disabled={isUploading}
                      accept={type === 'video' ? 'video/*' : 'image/*'}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  {url && (
                    <div className="flex items-center gap-2 bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-200 shadow-2xs">
                      {type === 'image' ? (
                        <img src={url} alt="Aperçu" className="w-6 h-6 rounded object-cover border" />
                      ) : (
                        <Video className="w-4 h-4 text-emerald-700" />
                      )}
                      <div className="flex flex-col">
                        <span className="text-[11px] text-stone-700 font-bold">Fichier prêt & persistant</span>
                        <span className="text-[9px] text-emerald-600 font-semibold">
                          {url.includes('firebasestorage.googleapis.com') ? '☁️ Firebase Storage' : url.startsWith('/uploads') ? '💾 Serveur' : '🔗 URL Externe'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {type === 'video' && (
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Miniature pour la vidéo (URL Image)
                  </label>
                  <input
                    type="text"
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

              <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition"
                >
                  Fermer
                </button>
                <button
                  type="button"
                  disabled={isSubmitting || isUploading}
                  onClick={() => saveMediaData(true)}
                  className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-xl transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Enregistrer & ajouter un autre</span>
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSubmitting ? 'Enregistrement...' : 'Ajouter le média'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
