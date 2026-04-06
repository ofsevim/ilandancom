import React, { useEffect, useState } from 'react';
import { messageService } from '../services/api';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface Conversation {
  ad_id: string | null;
  ad_title: string;
  other_user_id: string;
  other_user_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

interface ConversationsModalProps {
  onClose: () => void;
  onOpenConversation: (receiverId: string, adId: string | null) => void;
}

const ConversationsModal: React.FC<ConversationsModalProps> = ({ onClose, onOpenConversation }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await messageService.getConversations();
      setConversations(data);
    } catch (e: any) {
      toast.error(e.message || 'Konuşmalar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();

    const channel = supabase
      .channel('conversations-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        loadConversations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const formatTime = (dateString: string) => {
    if (!dateString) return 'Bilinmiyor';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Bilinmiyor';
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) return 'Az önce';
    if (diffInHours < 24) return `${Math.floor(diffInHours)} saat önce`;
    if (diffInHours < 48) return 'Dün';
    return date.toLocaleDateString('tr-TR');
  };

  return (
    <div className="fixed inset-0 bg-slate-50 dark:bg-navy-950/80 backdrop-blur-md flex items-center justify-center z-[1000] p-4">
      <div className="bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-silver-700/20 rounded-2xl shadow-xl w-full max-w-2xl relative overflow-hidden flex flex-col max-h-[80vh]">

        <div className="flex items-center justify-between p-6 border-b border-silver-700/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-accent">chat</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-silver-100">Mesajlarım</h3>
              <p className="text-silver-500 text-xs">{conversations.length} Konuşma</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white dark:bg-navy-900 hover:bg-navy-950 border border-silver-700/10 rounded-full flex items-center justify-center text-silver-500 hover:text-slate-900 dark:text-silver-100 transition-all"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full"></div>
              <p className="text-silver-500 text-xs">Yükleniyor...</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-white dark:bg-navy-900 border border-silver-700/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-2xl text-slate-600 dark:text-silver-600">chat_bubble_outline</span>
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-silver-100 mb-1">Henüz mesajınız yok</h4>
              <p className="text-silver-500 text-sm">İlanlara mesaj gönderdiğinizde burada görünecek</p>
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((conv) => (
                <button
                  key={`${conv.ad_id}-${conv.other_user_id}`}
                  onClick={() => onOpenConversation(conv.other_user_id, conv.ad_id)}
                  className="w-full p-4 text-left bg-white dark:bg-navy-900 hover:bg-navy-950 rounded-xl border border-transparent hover:border-accent/20 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-accent text-lg">inventory_2</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-slate-900 dark:text-silver-100 truncate group-hover:text-accent transition-colors text-sm">
                          {conv.ad_title}
                        </h4>
                        <span className="text-[10px] text-silver-500 ml-2 flex-shrink-0">
                          {formatTime(conv.last_message_time)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-[10px] font-medium text-slate-500 dark:text-slate-500 dark:text-silver-500">
                          {conv.other_user_name}
                        </p>
                        {conv.unread_count > 0 && (
                          <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-silver-400 truncate">
                        {conv.last_message}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {conversations.length > 0 && (
          <div className="p-4 border-t border-silver-700/10 bg-navy-900/50">
            <p className="text-[10px] text-center text-silver-500 flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-sm">lock</span>
              Güvenli mesajlaşma
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationsModal;
