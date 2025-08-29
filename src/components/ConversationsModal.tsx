import React, { useEffect, useState } from 'react';
import { X, MessageSquare, Package } from 'lucide-react';
import { messageService } from '../services/api';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface Conversation {
  ad_id: string;
  ad_title: string;
  other_user_id: string;
  other_user_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

interface ConversationsModalProps {
  onClose: () => void;
  onOpenConversation: (receiverId: string, adId: string) => void;
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
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
        loadConversations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Az önce';
    if (diffInHours < 24) return `${Math.floor(diffInHours)} saat önce`;
    if (diffInHours < 48) return 'Dün';
    return date.toLocaleDateString('tr-TR');
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <MessageSquare size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Mesajlarım</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{conversations.length} konuşma</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            aria-label="Kapat" 
            className="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
          >
            <X size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>
        
        {/* Content */}
        <div className="max-h-[65vh] overflow-y-auto">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Mesajlarınız yükleniyor...</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={32} className="text-gray-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Henüz mesajınız yok</h4>
              <p className="text-gray-500 dark:text-gray-400">İlanlara mesaj gönderdiğinizde burada görünecek</p>
            </div>
          ) : (
            <div className="p-2">
              {conversations.map((conv, index) => (
                <button
                  key={`${conv.ad_id}-${conv.other_user_id}`}
                  onClick={() => onOpenConversation(conv.other_user_id, conv.ad_id)}
                  className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 rounded-xl mb-2 group"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Package size={20} className="text-white" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {conv.ad_title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                            {formatTime(conv.last_message_time)}
                          </span>
                          {conv.unread_count > 0 && (
                            <span className="min-w-[24px] h-[24px] px-1 rounded-full bg-red-500 text-white text-xs font-semibold leading-[24px] text-center shadow-sm">
                              {conv.unread_count}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {conv.other_user_name}
                        </p>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate leading-relaxed">
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
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Tüm mesajlarınız güvenle saklanır ve şifrelenir
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationsModal;
