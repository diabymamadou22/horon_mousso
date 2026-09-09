import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, ArrowLeft, ShieldAlert, CheckCircle2, Eye, EyeOff, ShieldCheck, KeyRound } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const { login, setIsAdminMode, settings } = useApp();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMsg('Veuillez saisir votre mot de passe administrateur.');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);
    const res = await login(password.trim());
    setIsLoading(false);
    if (!res.success) {
      setErrorMsg(res.message || 'Mot de passe incorrect. Veuillez réessayer.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 bg-stone-100">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#0D2214] text-white p-7 sm:p-8 text-center relative border-b border-emerald-900/50">
          <button
            type="button"
            onClick={() => setIsAdminMode(false)}
            className="absolute left-4 top-4 p-2 text-stone-400 hover:text-white rounded-xl transition cursor-pointer hover:bg-white/10"
            title="Retour au site public"
            aria-label="Retour au site public"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-emerald-800/80 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3 text-emerald-200 shadow-md">
            <Lock className="w-7 h-7 text-amber-400" />
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight font-serif-heading">
            Accès Espace Administrateur
          </h2>
          <p className="text-xs text-stone-300 mt-1 max-w-xs mx-auto">
            {settings.companyName || 'Horon Mousso'} • Espace privé sécurisé
          </p>
        </div>

        {/* Body Form */}
        <div className="p-6 sm:p-8 space-y-5">
          <div className="text-xs text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-200/90 leading-relaxed flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <span>
              Pour protéger vos données contre tout accès visiteur, le mot de passe est strictement requis à chaque connexion.
            </span>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2 animate-in fade-in">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                  Mot de Passe Administrateur <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-stone-500 hover:text-emerald-800 font-medium flex items-center gap-1 transition cursor-pointer"
                >
                  {showPassword ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Masquer</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Afficher</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoFocus
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2D5A27] focus:bg-white transition tracking-wide"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1 rounded-lg transition cursor-pointer"
                  title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !password}
              className="w-full bg-[#2D5A27] hover:bg-[#23471F] text-white font-bold py-3 px-4 rounded-xl shadow-md transition disabled:opacity-50 text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isLoading ? 'Vérification...' : 'Déverrouiller l\'Administration'}</span>
            </button>
          </form>

          <div className="pt-2 text-center border-t border-stone-100">
            <button
              type="button"
              onClick={() => setIsAdminMode(false)}
              className="text-xs text-stone-500 hover:text-stone-800 font-medium transition cursor-pointer"
            >
              ← Retourner à la boutique publique
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
