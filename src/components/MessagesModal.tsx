import React, { useEffect, useRef, useState } from 'react';
import { X, Send } from 'lucide-react';
import { messageService } from '../services/api';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface MessagesModalProps {
  receiverId: string;
  adId?: string;
  onClose: () => void;
}

const MessagesModal: React.FC<MessagesModalProps> = ({ receiverId, adId, onClose }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const [myId, setMyId] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await messageService.getConversation(receiverId, adId);
      setMessages(data);
      setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }), 50);
    } catch (e: any) {
      toast.error(e.message || 'Mesajlar yüklenemedi');
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (mounted) setMyId(data.user?.id || null);
    })();
    load();

    const channel = supabase
      .channel('messages-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload: any) => {
        const m = payload.new;
        const participantsOk = (m.sender_id === receiverId || m.receiver_id === receiverId) || (myId && (m.sender_id === myId || m.receiver_id === myId));
        const adOk = adId ? m.ad_id === adId : true;
        if (participantsOk && adOk) {
          setMessages(prev => [...prev, m]);
          setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }), 50);
        }
      })
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [receiverId, adId, myId]);

  const send = async () => {
    if (!input.trim()) return;
    if (!myId) {
      toast.error('Mesaj göndermek için önce giriş yapmalısınız');
      return;
    }
    try {
      setSending(true);
      await messageService.sendMessage({ receiverId, adId, content: input.trim() });
      setInput('');
      await load();
      try { await messageService.markConversationRead(receiverId, adId); } catch { }
    } catch (e: any) {
      toast.error(e.message || 'Mesaj gönderilemedi');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-primary-950/60 backdrop-blur-md flex items-center justify-center z-[1100] p-4">
      <div className="bg-white dark:bg-primary-900 rounded-[2.5rem] w-full max-w-lg shadow-premium border border-primary-100 dark:border-primary-800 relative overflow-hidden flex flex-col">

        {/* Close Button - Premium */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 glass-premium rounded-full flex items-center justify-center text-primary-400 hover:text-white transition-all z-50 hover:scale-110 active:scale-90"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="p-8 border-b border-primary-100 dark:border-primary-800">
          <h3 className="text-xl font-black text-primary-950 dark:text-white tracking-tight">Mesajlaşma</h3>
          <p className="text-primary-500 text-[10px] font-bold uppercase tracking-widest mt-1">Güvenli Sohbet</p>
        </div>

        {/* Message List */}
        <div ref={listRef} className="p-8 max-h-[50vh] overflow-y-auto space-y-4 scrollbar-hide bg-primary-50/30 dark:bg-black/10">
          {messages.length === 0 ? (
            <div className="text-center py-10 flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center">
                <Send size={24} className="text-primary-300" />
              </div>
              <p className="text-primary-400 text-xs font-bold uppercase tracking-widest">Henüz mesaj yok</p>
            </div>
          ) : (
            messages.map((m) => {
              const isMine = myId && m.sender_id === myId;
              return (
                <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-5 py-3.5 rounded-2xl text-sm font-medium shadow-sm ${isMine
                      ? 'bg-neon-indigo text-white rounded-br-none'
                      : 'bg-white dark:bg-primary-800 text-primary-950 dark:text-white rounded-bl-none border border-primary-100 dark:border-primary-700'
                    }`}>
                    {m.content}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-primary-100 dark:border-primary-800 bg-white dark:bg-primary-900 flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
            className="flex-1 px-6 py-4 rounded-2xl bg-primary-50 dark:bg-primary-800 border border-transparent focus:border-indigo-500/50 outline-none text-primary-950 dark:text-white font-bold transition-all placeholder:text-primary-400"
            placeholder="Mesajınızı yazın..."
          />
          <button
            onClick={send}
            disabled={sending || !input.trim()}
            className="w-14 h-14 bg-neon-indigo text-white rounded-2xl shadow-lg shadow-indigo-600/20 flex items-center justify-center hover:scale-110 active:scale-95 transition-all disabled:opacity-40"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessagesModal;
