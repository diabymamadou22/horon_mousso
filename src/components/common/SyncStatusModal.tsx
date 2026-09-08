import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Cloud, 
  Database, 
  Smartphone, 
  Monitor, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle2, 
  X,
  Layers,
  ShieldCheck,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';

interface SyncStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SyncStatusModal: React.FC<SyncStatusModalProps> = ({ isOpen, onClose }) => {
  const { syncStatus, forceSync, isLoading } = useApp();

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-stone-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#1B3022] text-white px-6 py-5 flex items-center justify-between border-b border-[#2D5A27]/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Bases de Données & Synchro Multi-Appareils</h3>
              <p className="text-xs text-emerald-200/80">Partage temps réel en ligne + Stockage local sécurisé</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 text-stone-700 max-h-[80vh] overflow-y-auto">
          {/* Quota Exceeded Alert (if active) */}
          {syncStatus.isQuotaExceeded && (
            <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/90 text-amber-950 space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-sm font-bold">Quota Cloud Firestore gratuit atteint (Plan Spark)</div>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    Le plafond journalier gratuit d'écritures/lectures de la base Firebase a été atteint pour aujourd'hui. L'application a automatiquement basculé sur le <strong>stockage local persistant (IndexedDB)</strong> : vous pouvez continuer à gérer vos produits, commandes et messages sans interruption.
                  </p>
                  <div className="pt-1.5 flex items-center gap-2">
                    <a 
                      href="https://console.firebase.google.com/project/crucial-spider-zhh41/firestore/databases/ai-studio-horonmousso-47c91ee4-7e9d-4a4c-a991-6fa525d8b386/data?openUpgradeDialog=true" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-amber-950 bg-amber-200/80 hover:bg-amber-300/80 px-2.5 py-1 rounded-md transition"
                    >
                      <span>Activer le plan Blaze / Gérer les quotas</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Status summary banner */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            syncStatus.isQuotaExceeded
              ? 'bg-amber-50/70 border-amber-200 text-amber-950'
              : syncStatus.isOnline 
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' 
                : 'bg-amber-50/70 border-amber-200 text-amber-950'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                syncStatus.isQuotaExceeded 
                  ? 'bg-amber-500' 
                  : syncStatus.isOnline ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'
              }`} />
              <div>
                <div className="text-sm font-bold flex items-center gap-1.5">
                  {syncStatus.isQuotaExceeded ? (
                    <>
                      <Database className="w-4 h-4 text-amber-600" />
                      <span>Mode Local Actif (Quota Cloud atteint)</span>
                    </>
                  ) : syncStatus.isOnline ? (
                    <>
                      <Wifi className="w-4 h-4 text-emerald-600" />
                      <span>Mode En Ligne & Cloud Actif</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-4 h-4 text-amber-600" />
                      <span>Mode Hors-Ligne (Stockage Local Actif)</span>
                    </>
                  )}
                </div>
                <div className="text-xs opacity-80 mt-0.5">
                  {syncStatus.lastSyncTime 
                    ? `Dernière vérification à ${syncStatus.lastSyncTime}` 
                    : 'Synchronisation automatique en tâche de fond'}
                </div>
              </div>
            </div>

            <button
              onClick={() => forceSync()}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white border border-stone-300 hover:border-emerald-600 text-stone-700 hover:text-emerald-700 py-1.5 px-3 rounded-lg shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
              <span>{isLoading ? 'Synchro...' : 'Actualiser'}</span>
            </button>
          </div>

          {/* Feature 1: Cloud Firestore */}
          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/60 flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
              <Cloud className="w-5 h-5" />
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-stone-900">Base En Ligne (Cloud Firestore)</span>
                {syncStatus.isQuotaExceeded ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    Quota gratuit atteint
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Connecté
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Hébergée sur Google Cloud Firebase. Lorsqu'un administrateur met à jour un produit, publie une annonce ou reçoit un message, la mise à jour est synchronisée. Si le quota gratuit est atteint, le relais local garantit 100% de disponibilité.
              </p>
            </div>
          </div>

          {/* Feature 2: Local Database */}
          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/60 flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-[#2D5A27] flex items-center justify-center shrink-0 mt-0.5">
              <Database className="w-5 h-5" />
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-stone-900">Base Locale Permanente (IndexedDB)</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> Connecté & Persistant
                </span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Les produits, annonces, médias, messages, panier et commandes sont stockés dans la base de données <strong>IndexedDB locale</strong> de votre appareil (<code className="text-[11px] bg-stone-200/70 px-1 py-0.5 rounded">horon_mousso_permanent_db</code>). Vos données restent conservées de manière permanente, même sans connexion Internet.
              </p>
            </div>
          </div>

          {/* Feature 3: Multi-device Real-Time Sync */}
          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/60 flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
              <Layers className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-stone-900">Synchronisation Multi-Appareils</span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-stone-500">
                  <Smartphone className="w-3 h-3" /> + <Monitor className="w-3 h-3" />
                </span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Vous pouvez ouvrir Horon Mousso sur votre téléphone portable en boutique et en même temps sur un ordinateur au bureau. Vos modifications sont partagées en direct sans risque de conflit.
              </p>
            </div>
          </div>

          {/* Feature 4: Installable PWA App */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-stone-900">Application Installable (PWA)</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full">
                  Prête pour Mobile & Desktop
                </span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Horon Mousso respecte les standards PWA : icône sur l'écran d'accueil, fonctionnement hors-ligne plein écran, et chargement instantané sans barre de navigateur.
              </p>
            </div>
          </div>

          {/* Security & Backup info */}
          <div className="flex items-center gap-2 text-[11px] text-stone-500 px-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Double sauvegarde permanente : Cloud sécurisé + Fichiers locaux du serveur.</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-stone-100 px-6 py-3.5 flex items-center justify-end border-t border-stone-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#2D5A27] hover:bg-[#1B3022] text-white text-xs font-semibold rounded-lg shadow-xs transition cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
