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
  Award,
  Lock,
  ShieldAlert,
  CheckCircle2,
  Wallet,
  AlertTriangle
} from 'lucide-react';

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

  // Security Credentials state
  const [credUsername, setCredUsername] = useState(authStatus.username || 'admin');
  const [credEmail, setCredEmail] = useState('contact@horonmousso.com');
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
      console.error(err);
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
      setCredFeedback({ success: false, message: err.message || 'Une erreur est survenue.' });
    } finally {
      setIsUpdatingCreds(false);
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

        {/* Moyens de Paiement & Mobile Money */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
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
                placeholder="ex: +225 07 00 00 00 00"
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
                placeholder="ex: +225 07 00 00 00 00"
                className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Numéro MTN MoMo
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

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Numéro Moov Money
              </label>
              <input
                type="text"
                name="moovMoneyNumber"
                value={formData.moovMoneyNumber}
                onChange={handleChange}
                placeholder="ex: +225 01 00 00 00 00"
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
              placeholder="Indiquez comment vos clients doivent valider le règlement (ex: Envoyez la preuve par WhatsApp avec le numéro de référence...)"
              className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
            />
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

        {/* Submit button bar for general settings */}
        <div className="flex items-center justify-end gap-3 sticky bottom-4 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-stone-200 shadow-lg">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-3.5 px-8 rounded-xl shadow-md transition disabled:opacity-50 text-xs sm:text-sm cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Enregistrement en cours...' : 'Enregistrer les paramètres généraux'}</span>
          </button>
        </div>
      </form>

      {/* --- SÉCURITÉ & ACCÈS ADMINISTRATEUR --- */}
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

          {authStatus.isDefaultCredentials ? (
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

        {authStatus.isDefaultCredentials && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900">Recommandation importante pour la mise en production :</p>
              <p className="mt-1 text-amber-800 leading-relaxed">
                Le compte utilise actuellement les identifiants par défaut (<strong>admin</strong> / <strong>admin</strong>). Pour garantir la sécurité de votre catalogue, veuillez définir ci-dessous vos identifiants personnels.
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
