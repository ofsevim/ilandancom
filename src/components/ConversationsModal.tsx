import React, { useEffect, useState } from 'react';
import { X, MessageSquare, Package } from 'lucide-react';
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
    <div className="fixed inset-0 bg-primary-950/60 backdrop-blur-md flex items-center justify-center z-[1000] p-4">
      <div className="bg-white dark:bg-primary-900 rounded-[2.5rem] w-full max-w-2xl shadow-premium border border-primary-100 dark:border-primary-800 relative overflow-hidden flex flex-col">

        {/* Close Button - Premium */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 glass-premium rounded-full flex items-center justify-center text-primary-400 hover:text-white transition-all z-50 hover:scale-110 active:scale-90"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="p-8 border-b border-primary-100 dark:border-primary-800 flex items-center gap-4">
          <div className="w-12 h-12 bg-neon-indigo rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <MessageSquare size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-primary-950 dark:text-white tracking-tight">Mesajlarım</h3>
            <p className="text-primary-500 text-[10px] font-bold uppercase tracking-widest mt-1">{conversations.length} Konuşma</p>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[65vh] overflow-y-auto p-4 scrollbar-hide">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <div className="animate-spin w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
              <p className="text-primary-500 text-[10px] font-bold uppercase tracking-widest">Yükleniyor...</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-20 h-20 bg-primary-50 dark:bg-primary-800/50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <MessageSquare size={32} className="text-primary-300 dark:text-primary-600" />
              </div>
              <h4 className="text-xl font-black text-primary-950 dark:text-white mb-2 tracking-tight">Henüz mesajınız yok</h4>
              <p className="text-primary-500 text-sm font-medium">İlanlara mesaj gönderdiğinizde burada görünecek</p>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map((conv) => (
                <button
                  key={`${conv.ad_id}-${conv.other_user_id}`}
                  onClick={() => onOpenConversation(conv.other_user_id, conv.ad_id)}
                  className="w-full p-5 text-left bg-primary-50 dark:bg-primary-800/30 hover:bg-white dark:hover:bg-primary-800 rounded-[2rem] border border-transparent hover:border-indigo-500/30 transition-all duration-300 group relative overflow-hidden"
                >
                  <div className="flex items-start gap-5">
                    {/* Avatar */}
                    <div className="w-14 h-14 bg-neon-indigo rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-600/10 rotate-3 group-hover:rotate-0 transition-transform">
                      <Package size={24} className="text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <h4 className="font-black text-primary-950 dark:text-white truncate group-hover:text-indigo-500 transition-colors tracking-tight">
                          {conv.ad_title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black text-primary-400 dark:text-primary-500 uppercase tracking-widest px-2 py-1 bg-white/50 dark:bg-black/20 rounded-lg">
                            {formatTime(conv.last_message_time)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-2 px-2 py-0.5 bg-white/50 dark:bg-black/20 rounded-lg w-fit">
                        <p className="text-[9px] font-black text-primary-500 uppercase tracking-widest">
                          {conv.other_user_name}
                        </p>
                        {conv.unread_count > 0 && (
                          <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center shadow-lg shadow-red-500/30">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-primary-600 dark:text-primary-400 truncate leading-relaxed font-medium">
                        {conv.last_message}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {conversations.length > 0 && (
          <div className="p-6 border-t border-primary-100 dark:border-primary-800 bg-primary-50/50 dark:bg-black/20">
            <p className="text-[9px] text-center text-primary-400 font-black uppercase tracking-widest">
              🔒 Uçtan uca şifreli ve güvenli mesajlaşma
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationsModal;
