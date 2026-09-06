import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Announcement } from '../../types';
import { 
  PlusCircle, 
  Megaphone, 
  Edit3, 
  Trash2, 
  Play, 
  Calendar, 
  AlertTriangle, 
  X, 
  Upload, 
  Eye, 
  CheckCircle2 
} from 'lucide-react';

interface AdminAnnouncementsProps {
  isAddModalOpenInitially?: boolean;
  onCloseAddModalInitial?: () => void;
}

export const AdminAnnouncements: React.FC<AdminAnnouncementsProps> = ({
  isAddModalOpenInitially = false,
  onCloseAddModalInitial
}) => {
  const { announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(isAddModalOpenInitially);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Announcement | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Stock & Récolte');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [image, setImage] = useState('');
  const [video, setVideo] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'publie' | 'brouillon'>('publie');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setTitle('');
    setCategory('Stock & Récolte');
    setDate(new Date().toISOString().split('T')[0]);
    setImage('https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80');
    setVideo('');
    setDescription('');
    setContent('');
    setStatus('publie');
    setEditingAnnouncement(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (a: Announcement) => {
    setEditingAnnouncement(a);
    setTitle(a.title);
    setCategory(a.category || 'Actualité');
    setDate(a.date || a.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0]);
    setImage(a.image || '');
    setVideo(a.video || '');
    setDescription(a.description);
    setContent(a.content || '');
    setStatus(a.status);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
    if (onCloseAddModalInitial) onCloseAddModalInitial();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingAnnouncement) {
        await updateAnnouncement(editingAnnouncement.id, {
          title,
          category,
          date,
          image,
          video,
          description,
          content,
          status
        });
      } else {
        await addAnnouncement({
          title,
          category,
          date,
          image,
          video,
          description,
          content,
          status
        });
      }
      handleCloseModal();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    await deleteAnnouncement(itemToDelete.id);
    setItemToDelete(null);
  };

  // Local file upload preview helper
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImage(reader.result);
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
            <Megaphone className="w-6 h-6 text-amber-700" />
            <span>Gestion des Annonces & Actualités</span>
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Publiez les nouveautés, arrivages, ateliers et vidéos pour vos clients. ({announcements.length} au total)
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold py-3 px-5 rounded-xl shadow-xs transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Publier une Annonce</span>
        </button>
      </div>

      {/* Announcements List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {announcements.map((ann) => (
          <div
            key={ann.id}
            className="bg-white rounded-2xl border border-stone-200/90 shadow-sm overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-16/9 bg-stone-100">
                {ann.image ? (
                  <img
                    src={ann.image}
                    alt={ann.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-300">
                    <Megaphone className="w-8 h-8" />
                  </div>
                )}

                {ann.video && (
                  <div className="absolute top-2 right-2 bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                    <Play className="w-3 h-3" fill="currentColor" />
                    <span>Vidéo</span>
                  </div>
                )}

                <div className="absolute bottom-2 left-2">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded shadow ${
                    ann.status === 'publie' ? 'bg-emerald-600 text-white' : 'bg-stone-800 text-stone-200'
                  }`}>
                    {ann.status === 'publie' ? 'PUBLIÉ' : 'BROUILLON'}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-stone-400">
                  <span>{ann.category || 'Actualité'}</span>
                  <span>{ann.date || ann.createdAt?.split('T')[0]}</span>
                </div>
                <h3 className="font-bold text-sm text-stone-900 line-clamp-2 leading-snug">
                  {ann.title}
                </h3>
                <p className="text-xs text-stone-500 line-clamp-2">
                  {ann.description}
                </p>
              </div>
            </div>

            <div className="p-4 pt-2 border-t border-stone-100 flex items-center justify-between">
              <button
                onClick={() => updateAnnouncement(ann.id, { status: ann.status === 'publie' ? 'brouillon' : 'publie' })}
                className="text-[11px] font-bold text-stone-600 hover:text-stone-900 underline"
              >
                {ann.status === 'publie' ? 'Mettre en brouillon' : 'Publier sur le site'}
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEdit(ann)}
                  className="p-1.5 text-stone-600 hover:text-emerald-800 hover:bg-stone-100 rounded-lg transition"
                  title="Modifier"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setItemToDelete(ann)}
                  className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete confirmation modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-stone-200 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-extrabold text-stone-900">
                Supprimer cette annonce ?
              </h3>
              <p className="text-xs text-stone-500">
                « <span className="font-bold text-stone-800">{itemToDelete.title}</span> » sera supprimée.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setItemToDelete(null)}
                className="py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmDelete}
                className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Announcement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50">
              <h3 className="font-extrabold text-base text-stone-900 flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-amber-700" />
                <span>{editingAnnouncement ? 'Modifier l\'Annonce' : 'Nouvelle Annonce'}</span>
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
                  Titre de l'Annonce <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Arrivage du nouveau stock de piment rouge séché"
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Catégorie</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Ex: Stock, Événement, Atelier"
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Statut</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                  >
                    <option value="publie">Publié (visible par tous)</option>
                    <option value="brouillon">Brouillon (invisible)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Résumé court <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brève description affichée sur la carte..."
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Contenu détaillé de l'article
                </label>
                <textarea
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Détails complets de l'annonce, explications, consignes de commande..."
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              {/* Media URL / Upload */}
              <div className="space-y-3 p-4 bg-stone-50 rounded-2xl border border-stone-200">
                <label className="block text-xs font-bold text-stone-900">
                  Médias associés (Image & Vidéo)
                </label>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Image d'illustration ou miniature (URL)
                  </label>
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://..."
                    className="w-full text-xs p-2 bg-white border border-stone-200 rounded-xl"
                  />
                  <div className="mt-2 flex items-center gap-3">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 text-[11px] font-bold py-1 px-2.5 rounded-lg transition">
                      <Upload className="w-3 h-3" />
                      <span>Téléverser image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </label>
                    {image && <img src={image} alt="" className="w-7 h-7 rounded object-cover border" />}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Lien Vidéo MP4 (Optionnel - sera lu directement par les visiteurs)
                  </label>
                  <input
                    type="url"
                    value={video}
                    onChange={(e) => setVideo(e.target.value)}
                    placeholder="https://... (ex: lien direct mp4 ou webm)"
                    className="w-full text-xs p-2 bg-white border border-stone-200 rounded-xl"
                  />
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
                  {isSubmitting ? 'Enregistrement...' : 'Enregistrer l\'annonce'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
