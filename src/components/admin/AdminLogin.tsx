import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, User, KeyRound, ArrowLeft, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const { login, setIsAdminMode, settings } = useApp();
  const [identifier, setIdentifier] = useState('admin@agroterroir.com');
  const [password, setPassword] = useState('admin');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);
    const res = await login(identifier, password);
    setIsLoading(false);
    if (!res.success) {
      setErrorMsg(res.message || 'Identifiant ou mot de passe incorrect.');
    }
  };

  const handleDemoFill = () => {
    setIdentifier('admin@agroterroir.com');
    setPassword('admin');
    setErrorMsg('');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 bg-stone-100">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="bg-stone-900 text-white p-8 text-center relative">
          <button
            onClick={() => setIsAdminMode(false)}
            className="absolute left-4 top-4 p-2 text-stone-400 hover:text-white rounded-lg transition"
            title="Retour au site public"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-emerald-700/80 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3 text-emerald-200 shadow-md">
            <Lock className="w-7 h-7" />
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Espace Administrateur
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Gestion du catalogue, des annonces, des médias et messages
          </p>
        </div>

        {/* Form */}
        <div className="p-6 sm:p-8 space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2 animate-in fade-in">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Demo Helper */}
          <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>Identifiants de test :</span>
              </div>
              <div className="text-[11px] text-emerald-800">
                admin / admin (ou admin@agroterroir.com)
              </div>
            </div>
            <button
              type="button"
              onClick={handleDemoFill}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition"
            >
              Pré-remplir
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                Email ou Nom d'utilisateur
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin ou admin@agroterroir.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                Mot de Passe
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-3 px-4 rounded-xl shadow-md transition disabled:opacity-50 text-sm flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isLoading ? 'Connexion en cours...' : 'Se connecter au Tableau de bord'}</span>
            </button>
          </form>

          <div className="pt-2 text-center">
            <button
              onClick={() => setIsAdminMode(false)}
              className="text-xs text-stone-500 hover:text-stone-800 font-medium transition"
            >
              ← Retourner au site public ({settings.companyName})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
