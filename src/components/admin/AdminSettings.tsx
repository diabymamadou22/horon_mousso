import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Settings as SettingsIcon, 
  Save, 
  Building2, 
  PhoneCall, 
  MessageCircle, 
  Mail, 
  MapPin, 
  Clock, 
  Upload, 
  Sparkles, 
  Lock, 
  ShieldAlert, 
  CheckCircle2, 
  Wallet, 
  AlertTriangle,
  Trash2,
  RotateCcw,
  Image as ImageIcon,
  Eye,
  Check
} from 'lucide-react';
import { initialSettings } from '../../data/initialData';

// Préréglages locaux de logos pour Horon Mousso
const LOGO_PRESETS = [
  {
    id: 'official',
    name: 'Logo Officiel Épices Nobles',
    url: initialSettings.logo,
    badge: 'Officiel'
  },
  {
    id: 'terroir_spices',
    name: 'Atelier Terroir & Feuilles',
    url: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=300&q=80',
    badge: 'Artisanal'
  },
  {
    id: 'chili_harvest',
    name: 'Piment Rouge & Poudre Pure',
    url: 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?auto=format&fit=crop&w=300&q=80',
    badge: 'Piments'
  }
];

export const AdminSettings: React.FC = () => {
  const { settings, updateSettings, authStatus, changeAdminCredentials } = useApp();

  const [formData, setFormData] = useState({ 
    ...settings,
    waveNumber: settings.waveNumber || '',
    orangeMoneyNumber: settings.orangeMoneyNumber || '',
    mtnMoMoNumber: settings.mtnMoMoNumber || '',
    moovMoneyNumber: settings.moovMoneyNumber || '',
    paymentInstructions: settings.paymentInstructions || ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Security Credentials state
  const [credUsername, setCredUsername] = useState(authStatus?.username || 'admin');
  const [credEmail, setCredEmail] = useState(authStatus?.email || 'contact@horonmousso.com');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingCreds, setIsUpdatingCreds] = useState(false);
  const [credFeedback, setCredFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSettings(formData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      console.error('Erreur sauvegarde paramètres:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredFeedback(null);

    if (newPassword && newPassword !== confirmPassword) {
      setCredFeedback({ success: false, message: 'Les deux mots de passe ne correspondent pas.' });
      return;
    }

    if (!newPassword || newPassword.length < 4) {
      setCredFeedback({ success: false, message: 'Le mot de passe doit contenir au moins 4 caractères.' });
      return;
    }

    setIsUpdatingCreds(true);
    try {
      const res = await changeAdminCredentials(credUsername.trim(), credEmail.trim(), newPassword);
      if (res.success) {
        setCredFeedback({ success: true, message: 'Identifiants administrateur mis à jour avec succès !' });
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setCredFeedback({ success: false, message: res.message || 'Échec de la mise à jour des identifiants.' });
      }
    } catch (err: any) {
      setCredFeedback({ success: false, message: err?.message || 'Une erreur est survenue.' });
    } finally {
      setIsUpdatingCreds(false);
    }
  };

  // Compression et traitement local d'image (Canvas max 320x320 pour rester compact & rapide)
  const processLocalImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image valide (PNG, JPG, WebP, SVG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (!result) return;

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 360;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
          const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
          setFormData(prev => ({ ...prev, logo: optimizedDataUrl }));
        } else {
          setFormData(prev => ({ ...prev, logo: result }));
        }
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processLocalImageFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processLocalImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // Helper pour styliser le nom de marque
  const getBrandInitials = (name: string) => {
    if (!name || name.trim().length === 0) return 'HM';
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  };

  return (
    <div id="admin-settings-container" className="space-y-8 animate-in fade-in max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <span>Paramètres de l'Entreprise & Identité</span>
          </h1>
          <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
            Gérez le nom de l'entreprise, le logo officiel (import local ou présets), les coordonnées et les textes du terroir.
          </p>
        </div>

        {savedSuccess && (
          <div className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-4 py-2 rounded-2xl animate-in fade-in flex items-center gap-2 shrink-0 shadow-sm">
            <Check className="w-4 h-4 text-emerald-700" />
            <span>Paramètres enregistrés et synchronisés !</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* =========================================================================
            SECTION 1 : IDENTITÉ & LOGO DE L'ENTREPRISE (MODIFICATION / SUPPRESSION)
        ========================================================================= */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <h2 className="text-sm font-extrabold text-stone-900 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-700" />
              <span>Nom de l'Entreprise & Marque</span>
            </h2>
            <span className="text-[11px] font-medium text-stone-400">
              Visible dans l'en-tête, le pied de page et les reçus
            </span>
          </div>

          {/* Nom de l'entreprise */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="company-name-input" className="block text-xs font-bold text-stone-800">
                Nom de l'Entreprise / Marque <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, companyName: '' }))}
                  className="text-[11px] text-red-600 hover:text-red-700 font-medium inline-flex items-center gap-1 cursor-pointer transition hover:underline"
                  title="Effacer le nom actuel"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Effacer le nom</span>
                </button>
                <span className="text-stone-300">•</span>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, companyName: initialSettings.companyName }))}
                  className="text-[11px] text-emerald-700 hover:text-emerald-800 font-medium inline-flex items-center gap-1 cursor-pointer transition hover:underline"
                  title="Rétablir Horon Mousso"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Rétablir « {initialSettings.companyName} »</span>
                </button>
              </div>
            </div>

            <div className="relative">
              <input
                id="company-name-input"
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Ex: Horon Mousso"
                className="w-full text-sm font-semibold p-3.5 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-700 focus:bg-white text-stone-900 transition"
              />
              {formData.companyName && (
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, companyName: '' }))}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                  title="Vider"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Visual preview of the brand title */}
            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between text-xs">
              <span className="text-stone-500 font-medium flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-stone-400" />
                <span>Rendu en ligne dans la barre de navigation :</span>
              </span>
              <div className="font-extrabold text-stone-900 text-sm tracking-tight bg-white px-3 py-1 rounded-xl border border-stone-200 shadow-2xs">
                {formData.companyName ? (
                  <span>
                    {formData.companyName.split(' ').slice(0, -1).join(' ')}{' '}
                    <span className="text-[#C53030]">
                      {formData.companyName.split(' ')[formData.companyName.split(' ').length - 1]}
                    </span>
                  </span>
                ) : (
                  <span className="text-stone-400 italic">Nom vide (affichera HORON MOUSSO par défaut)</span>
                )}
              </div>
            </div>
          </div>

          {/* =========================================================================
              GESTION DU LOGO : AJOUT LOCAL, MODIFICATION & SUPPRESSION
          ========================================================================= */}
          <div className="p-5 sm:p-6 bg-stone-50 rounded-3xl border border-stone-200 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
              <div>
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-emerald-700" />
                  <span>Logo de l'Entreprise</span>
                </h3>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Importez votre propre fichier localement depuis votre appareil ou choisissez parmi nos présets.
                </p>
              </div>

              {formData.logo ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, logo: '' }))}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                    title="Supprimer le logo actuel"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Supprimer le logo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, logo: initialSettings.logo }))}
                    className="text-xs font-semibold text-stone-700 hover:text-stone-900 bg-white hover:bg-stone-100 border border-stone-200 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                    title="Rétablir le logo officiel Horon Mousso"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Rétablir officiel</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, logo: initialSettings.logo }))}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Activer logo officiel</span>
                </button>
              )}
            </div>

            {/* Zone Drag & Drop locale pour téléverser un fichier */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`p-6 border-2 border-dashed rounded-2xl text-center transition cursor-pointer ${
                isDragging 
                  ? 'border-emerald-600 bg-emerald-50/70 scale-[1.01]' 
                  : 'border-stone-300 hover:border-emerald-600 bg-white hover:bg-emerald-50/20'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp, image/svg+xml"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-stone-800">
                Glissez-déposez votre logo ici, ou <span className="text-emerald-700 underline">parcourez votre appareil</span>
              </p>
              <p className="text-[11px] text-stone-500 mt-1">
                Formats acceptés : PNG, JPG, WebP, SVG. Optimisé et compressé automatiquement pour le cloud.
              </p>
            </div>

            {/* URL manuelle de logo */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-stone-600">
                Ou collez directement une URL d'image web :
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  name="logo"
                  value={formData.logo}
                  onChange={handleChange}
                  placeholder="https://exemple.com/mon-logo.png"
                  className="flex-1 text-xs p-2.5 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
                />
                {formData.logo && (
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, logo: '' }))}
                    className="p-2 text-stone-400 hover:text-red-600 rounded-xl hover:bg-red-50 border border-stone-200 bg-white transition cursor-pointer"
                    title="Effacer le lien"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Présets de logos recommandés */}
            <div className="space-y-2 pt-1">
              <p className="text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                Suggestions & Variantes du Terroir :
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {LOGO_PRESETS.map((preset) => {
                  const isSelected = formData.logo === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, logo: preset.url }))}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition cursor-pointer ${
                        isSelected 
                          ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-600' 
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200 flex items-center justify-center">
                        <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/60 px-1.5 py-0.5 rounded">
                            {preset.badge}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />}
                        </div>
                        <p className="text-[11px] font-semibold text-stone-800 truncate mt-0.5">
                          {preset.name}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Aperçu en direct du Logo dans l'interface */}
            <div className="pt-2 border-t border-stone-200">
              <p className="text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-3">
                Aperçu en situation réelle :
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* 1. Rendu Navbar (Fond clair) */}
                <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-2">
                  <span className="text-[10px] font-bold text-stone-400 uppercase">
                    Dans la barre de navigation (Fond blanc) :
                  </span>
                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-10 h-10 rounded-xl bg-[#2D5A27] flex items-center justify-center overflow-hidden shadow-xs shrink-0 text-white font-black text-sm">
                      {formData.logo ? (
                        <img src={formData.logo} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <span>{getBrandInitials(formData.companyName)}</span>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-stone-900 tracking-tight">
                        {formData.companyName || 'Horon Mousso'}
                      </div>
                      <div className="text-[10px] text-stone-500 font-medium">
                        Commerce & Transformation
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Rendu Footer & Loader (Fond vert terroir foncé) */}
                <div className="p-4 bg-[#1B3022] text-white rounded-2xl border border-stone-800 space-y-2">
                  <span className="text-[10px] font-bold text-stone-400 uppercase">
                    Dans l'écran de démarrage & pied de page :
                  </span>
                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden shrink-0 text-emerald-300 font-black text-sm">
                      {formData.logo ? (
                        <img src={formData.logo} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <span>{getBrandInitials(formData.companyName)}</span>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white tracking-tight">
                        {formData.companyName || 'Horon Mousso'}
                      </div>
                      <div className="text-[10px] text-emerald-300/80 font-medium">
                        Épices & Condiments Nobles
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Slogan & Description courte */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-stone-700">
                  Slogan de l'Entreprise
                </label>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, slogan: initialSettings.slogan }))}
                  className="text-[10px] text-stone-400 hover:text-stone-700 hover:underline cursor-pointer"
                >
                  Rétablir défaut
                </button>
              </div>
              <input
                type="text"
                name="slogan"
                value={formData.slogan}
                onChange={handleChange}
                placeholder="Ex: L'art et la noblesse des épices du terroir..."
                className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:bg-white"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-stone-700">
                  Horaires d'Ouverture
                </label>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, openingHours: initialSettings.openingHours }))}
                  className="text-[10px] text-stone-400 hover:text-stone-700 hover:underline cursor-pointer"
                >
                  Rétablir défaut
                </button>
              </div>
              <input
                type="text"
                name="openingHours"
                value={formData.openingHours}
                onChange={handleChange}
                placeholder="Ex: Du Lundi au Samedi : 08h00 – 18h30"
                className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-stone-700">
                Description Courte (Affichée en en-tête, pied de page et bannières)
              </label>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, shortDescription: initialSettings.shortDescription }))}
                className="text-[10px] text-stone-400 hover:text-stone-700 hover:underline cursor-pointer"
              >
                Rétablir défaut
              </button>
            </div>
            <textarea
              rows={2}
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleChange}
              className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:bg-white leading-relaxed"
            />
          </div>
        </div>

        {/* =========================================================================
            SECTION 2 : COORDONNÉES, CONTACT & BOUTIQUE PHYSIQUE
        ========================================================================= */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <h2 className="text-sm font-extrabold text-stone-900 uppercase tracking-wider flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-emerald-700" />
              <span>Coordonnées & Canaux de Contact</span>
            </h2>
            <span className="text-[11px] font-medium text-stone-400">
              Liaison directe avec vos clients
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-stone-500" />
                <span>Numéro de Téléphone Appel</span>
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+223 70 12 34 56"
                className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Numéro WhatsApp Commandes (avec indicatif)</span>
              </label>
              <input
                type="text"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                placeholder="+22370123456"
                className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-stone-500" />
                <span>Email Commercial Officiel</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="contact@horonmousso.com"
                className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-stone-500" />
                <span>Ville & Pays de référence</span>
              </label>
              <input
                type="text"
                name="cityCountry"
                value={formData.cityCountry}
                onChange={handleChange}
                placeholder="Bamako & Abidjan, Afrique de l’Ouest"
                className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-stone-500" />
                <span>Adresse & Atelier de Transformation</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Atelier de Transformation & Boutique, Quartier Artisanal du Terroir"
                className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
              />
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION 3 : COMPTES MOBILE MONEY & MODALITÉS DE PAIEMENT
        ========================================================================= */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <h2 className="text-sm font-extrabold text-stone-900 uppercase tracking-wider flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-700" />
              <span>Moyens de Paiement & Comptes Mobile Money</span>
            </h2>
            <span className="text-[11px] text-stone-500 font-medium">Pour les règlements clients</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Numéro Wave
              </label>
              <input
                type="text"
                name="waveNumber"
                value={formData.waveNumber}
                onChange={handleChange}
                placeholder="ex: +223 70 00 00 00"
                className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Numéro Orange Money
              </label>
              <input
                type="text"
                name="orangeMoneyNumber"
                value={formData.orangeMoneyNumber}
                onChange={handleChange}
                placeholder="ex: +223 70 00 00 00"
                className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Numéro Moov Money
              </label>
              <input
                type="text"
                name="moovMoneyNumber"
                value={formData.moovMoneyNumber}
                onChange={handleChange}
                placeholder="ex: +223 60 00 00 00"
                className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Numéro MTN MoMo (si actif)
              </label>
              <input
                type="text"
                name="mtnMoMoNumber"
                value={formData.mtnMoMoNumber}
                onChange={handleChange}
                placeholder="ex: +225 05 00 00 00 00"
                className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Consignes & Modalités de Paiement pour les Clients
            </label>
            <textarea
              rows={2}
              name="paymentInstructions"
              value={formData.paymentInstructions}
              onChange={handleChange}
              placeholder="Indiquez comment vos clients doivent valider le règlement..."
              className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
            />
          </div>
        </div>

        {/* =========================================================================
            SECTION 4 : TEXTES DU TERROIR & PRÉSENTATION DE L'ENTREPRISE
        ========================================================================= */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <h2 className="text-sm font-extrabold text-stone-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>Engagements & Présentation de l'Entreprise</span>
            </h2>
            <span className="text-[11px] text-stone-400">Section « À Propos »</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">Notre Mission</label>
              <textarea
                rows={2}
                name="mission"
                value={formData.mission}
                onChange={handleChange}
                className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">Notre Vision</label>
              <textarea
                rows={2}
                name="vision"
                value={formData.vision}
                onChange={handleChange}
                className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">Engagement Qualité & Hygiène</label>
              <textarea
                rows={2}
                name="qualityCommitment"
                value={formData.qualityCommitment}
                onChange={handleChange}
                className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">Engagement envers les Producteurs</label>
              <textarea
                rows={2}
                name="producersCommitment"
                value={formData.producersCommitment}
                onChange={handleChange}
                className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
              />
            </div>
          </div>
        </div>

        {/* Submit button bar for general settings */}
        <div className="flex items-center justify-between sticky bottom-4 bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xl z-20">
          <div className="text-xs text-stone-500 font-medium hidden sm:block">
            {savedSuccess ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Modifications enregistrées sur Firestore & IndexedDB
              </span>
            ) : (
              <span>Les modifications s'appliquent en direct sur tout le site.</span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-3.5 px-8 rounded-xl shadow-md transition disabled:opacity-50 text-xs sm:text-sm cursor-pointer ml-auto"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Enregistrement en cours...' : 'Enregistrer les paramètres généraux'}</span>
          </button>
        </div>
      </form>

      {/* =========================================================================
          SECTION 5 : SÉCURITÉ & ACCÈS ADMINISTRATEUR
      ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
          <div>
            <h2 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#C53030]" />
              <span>Sécurité & Compte Administrateur</span>
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Modifiez l'identifiant et le mot de passe requis pour administrer le site Horon Mousso.
            </p>
          </div>

          {authStatus?.isDefault ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
              <ShieldAlert className="w-4 h-4 text-amber-700" />
              Mot de passe par défaut actif
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              Accès personnalisé sécurisé
            </span>
          )}
        </div>

        {authStatus?.isDefault && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900">Recommandation importante pour la sécurité :</p>
              <p className="mt-1 text-amber-800 leading-relaxed">
                Le compte utilise actuellement les identifiants par défaut (<strong>admin</strong> / <strong>admin</strong>). Veuillez définir ci-dessous vos identifiants personnels.
              </p>
            </div>
          </div>
        )}

        {credFeedback && (
          <div className={`p-4 rounded-2xl text-xs flex items-center gap-2 ${
            credFeedback.success 
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold' 
              : 'bg-red-50 border border-red-200 text-red-900 font-semibold'
          }`}>
            {credFeedback.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{credFeedback.message}</span>
          </div>
        )}

        <form onSubmit={handleCredentialsSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Nom d'utilisateur administrateur
              </label>
              <input
                type="text"
                required
                value={credUsername}
                onChange={(e) => setCredUsername(e.target.value)}
                placeholder="ex: horon_admin"
                className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#2D5A27] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Email administrateur
              </label>
              <input
                type="email"
                required
                value={credEmail}
                onChange={(e) => setCredEmail(e.target.value)}
                placeholder="admin@horonmousso.com"
                className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#2D5A27] focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#2D5A27] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Confirmer le nouveau mot de passe
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#2D5A27] focus:bg-white"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isUpdatingCreds}
              className="inline-flex items-center gap-2 bg-[#2D5A27] hover:bg-[#23471F] text-white font-bold py-3 px-6 rounded-xl shadow-md transition disabled:opacity-50 text-xs cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>{isUpdatingCreds ? 'Mise à jour...' : 'Mettre à jour les identifiants'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
