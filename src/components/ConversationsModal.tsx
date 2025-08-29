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
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Mesajlarım</h3>
          <button onClick={onClose} aria-label="Kapat" className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center">
            <X size={18} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">Yükleniyor...</div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Henüz mesajınız yok</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {conversations.map((conv) => (
                <button
                  key={`${conv.ad_id}-${conv.other_user_id}`}
                  onClick={() => onOpenConversation(conv.other_user_id, conv.ad_id)}
                  className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Package size={16} className="text-blue-600 flex-shrink-0" />
                        <h4 className="font-medium text-gray-900 dark:text-white truncate">
                          {conv.ad_title}
                        </h4>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {conv.other_user_name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 truncate">
                        {conv.last_message}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 ml-3">
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {formatTime(conv.last_message_time)}
                      </span>
                      {conv.unread_count > 0 && (
                        <span className="min-w-[20px] h-[20px] px-1 rounded-full bg-red-600 text-white text-xs leading-[20px] text-center">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationsModal;
