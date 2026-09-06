import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CustomerMessage } from '../../types';
import { 
  Mail, 
  Check, 
  Trash2, 
  AlertTriangle, 
  PhoneCall, 
  MessageCircle, 
  Calendar, 
  User, 
  Inbox,
  Clock
} from 'lucide-react';

export const AdminMessages: React.FC = () => {
  const { messages, markMessageAsRead, deleteMessage, settings } = useApp();
  const [selectedMessage, setSelectedMessage] = useState<CustomerMessage | null>(null);
  const [messageToDelete, setMessageToDelete] = useState<CustomerMessage | null>(null);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const handleSelect = (msg: CustomerMessage) => {
    setSelectedMessage(msg);
    if (msg.status === 'nouveau') {
      markMessageAsRead(msg.id);
    }
  };

  const handleConfirmDelete = async () => {
    if (!messageToDelete) return;
    await deleteMessage(messageToDelete.id);
    if (selectedMessage?.id === messageToDelete.id) {
      setSelectedMessage(null);
    }
    setMessageToDelete(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <Mail className="w-6 h-6 text-rose-700" />
            <span>Messages Reçus des Visiteurs & Clients</span>
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Demandes de devis, commandes en gros, partenariats et questions transmises via le portail client. ({messages.length} messages)
          </p>
        </div>
      </div>

      {/* Two Column Layout: Inbox List & Reader */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-stone-100 bg-stone-50/70 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
              Boîte de réception
            </span>
            <span className="text-[11px] font-semibold text-stone-400">
              {messages.filter(m => m.status === 'nouveau').length} nouveau(x)
            </span>
          </div>

          <div className="divide-y divide-stone-100 max-h-[600px] overflow-y-auto">
            {messages.length > 0 ? (
              messages.map(msg => {
                const isSelected = selectedMessage?.id === msg.id;
                return (
                  <div
                    key={msg.id}
                    onClick={() => handleSelect(msg)}
                    className={`p-4 transition cursor-pointer flex flex-col space-y-1.5 ${
                      isSelected
                        ? 'bg-emerald-50/70 border-l-4 border-emerald-700'
                        : msg.status === 'nouveau'
                        ? 'bg-white font-medium hover:bg-stone-50'
                        : 'bg-stone-50/40 text-stone-500 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-stone-400" />
                        <span>{msg.name}</span>
                      </span>
                      <span className="text-[10px] text-stone-400">
                        {formatDate(msg.createdAt)}
                      </span>
                    </div>

                    <div className="text-[11px] text-stone-500 font-normal">
                      {msg.contact}
                    </div>

                    <p className="text-xs text-stone-600 line-clamp-2 leading-snug">
                      {msg.message}
                    </p>

                    {msg.status === 'nouveau' && (
                      <div className="pt-1">
                        <span className="text-[9px] font-black uppercase text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                          Nouveau
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-stone-400 text-xs">
                <Inbox className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                Aucun message client reçu pour le moment.
              </div>
            )}
          </div>
        </div>

        {/* Message Detail Reader */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8 flex flex-col justify-between space-y-6">
          {selectedMessage ? (
            <>
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-stone-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-extrabold text-stone-900">
                        {selectedMessage.name}
                      </h3>
                      {selectedMessage.status === 'nouveau' && (
                        <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                          Nouveau
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-stone-500 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      <span>{formatDate(selectedMessage.createdAt)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setMessageToDelete(selectedMessage)}
                    className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    title="Supprimer ce message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Contact Coordinate Banner */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      Coordonnée de réponse fournie
                    </div>
                    <div className="text-sm font-bold text-stone-900 mt-0.5">
                      {selectedMessage.contact}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`https://wa.me/?text=Bonjour%20${encodeURIComponent(selectedMessage.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                      title="Répondre sur WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </a>
                    <a
                      href={selectedMessage.contact.includes('@') ? `mailto:${selectedMessage.contact}` : `tel:${selectedMessage.contact}`}
                      className="p-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                      title="Appeler ou envoyer un email"
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span className="hidden sm:inline">Contacter</span>
                    </a>
                  </div>
                </div>

                {/* Message Body */}
                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-stone-400">
                    Message transmis
                  </div>
                  <div className="p-5 rounded-2xl bg-stone-50/60 border border-stone-100 text-stone-800 text-sm leading-relaxed whitespace-pre-line">
                    {selectedMessage.message}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 flex justify-end">
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="text-xs font-bold text-stone-500 hover:text-stone-800 py-2 px-4"
                >
                  Fermer la vue
                </button>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 text-stone-400 space-y-2">
              <Mail className="w-12 h-12 text-stone-200" />
              <p className="font-semibold text-stone-600 text-sm">Sélectionnez un message</p>
              <p className="text-xs text-stone-400">Cliquez sur un message dans la liste pour afficher son contenu complet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {messageToDelete && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-stone-200 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-extrabold text-stone-900">
                Supprimer ce message client ?
              </h3>
              <p className="text-xs text-stone-500">
                Le message de « <span className="font-bold text-stone-800">{messageToDelete.name}</span> » sera supprimé définitivement.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setMessageToDelete(null)}
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
    </div>
  );
};
