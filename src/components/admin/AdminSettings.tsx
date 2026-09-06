import React, { useState } from 'react';
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
  Award
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { settings, updateSettings } = useApp();

  const [formData, setFormData] = useState({ ...settings });
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

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
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setFormData(prev => ({ ...prev, logo: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-stone-700" />
            <span>Paramètres de l'Entreprise & Contenus</span>
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Modifiez les coordonnées, le logo et les textes de présentation. Les modifications s'appliquent immédiatement sur tout le site.
          </p>
        </div>

        {savedSuccess && (
          <div className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-xl animate-in fade-in">
            ✓ Paramètres enregistrés avec succès !
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Identité de l'entreprise */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-5">
          <h2 className="text-sm font-extrabold text-stone-900 uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-700" />
            <span>Identité Générale & Marque</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Nom de l'Entreprise <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Slogan
              </label>
              <input
                type="text"
                name="slogan"
                value={formData.slogan}
                onChange={handleChange}
                className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Description Courte (Affichée en en-tête et pied de page)
            </label>
            <textarea
              rows={2}
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleChange}
              className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:bg-white"
            />
          </div>

          {/* Logo URL / File upload */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
            <label className="block text-xs font-bold text-stone-800">
              Logo de l'Entreprise
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <input
                type="url"
                name="logo"
                value={formData.logo}
                onChange={handleChange}
                placeholder="https://... (URL du logo)"
                className="flex-1 w-full text-xs p-2.5 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
              />
              <label className="cursor-pointer inline-flex items-center gap-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold py-2 px-3.5 rounded-xl transition">
                <Upload className="w-3.5 h-3.5" />
                <span>Téléverser fichier</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
            </div>
            {formData.logo && (
              <div className="flex items-center gap-3 pt-1">
                <div className="w-12 h-12 rounded-xl bg-white border border-stone-200 p-1 flex items-center justify-center overflow-hidden">
                  <img src={formData.logo} alt="Logo" className="w-full h-full object-contain" />
                </div>
                <span className="text-[11px] text-stone-500">Aperçu actuel du logo</span>
              </div>
            )}
          </div>
        </div>

        {/* Coordonnées & Contact */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-5">
          <h2 className="text-sm font-extrabold text-stone-900 uppercase tracking-wider flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-emerald-700" />
            <span>Coordonnées & Canaux de Contact</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Numéro de Téléphone Appel
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Numéro WhatsApp Commandes
              </label>
              <input
                type="text"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                placeholder="+2250700000000"
                className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Email Commercial
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Horaires d'Ouverture
              </label>
              <input
                type="text"
                name="openingHours"
                value={formData.openingHours}
                onChange={handleChange}
                className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Adresse & Quartier
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Ville & Pays
              </label>
              <input
                type="text"
                name="cityCountry"
                value={formData.cityCountry}
                onChange={handleChange}
                className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
              />
            </div>
          </div>
        </div>

        {/* Textes de la page À propos */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-5">
          <h2 className="text-sm font-extrabold text-stone-900 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <span>Textes de la Page « À Propos »</span>
          </h2>

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

        {/* Submit button bar */}
        <div className="flex items-center justify-end gap-3 sticky bottom-4 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-stone-200 shadow-lg">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-3.5 px-8 rounded-xl shadow-md transition disabled:opacity-50 text-xs sm:text-sm"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Enregistrement en cours...' : 'Enregistrer les modifications'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
