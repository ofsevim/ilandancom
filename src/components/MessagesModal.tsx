import React, { useEffect, useRef, useState } from 'react';
import { messageService } from '../services/api';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface MessagesModalProps {
  receiverId: string;
  adId?: string | null;
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
      const data = await messageService.getConversation(receiverId, adId ?? undefined);
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
      await messageService.sendMessage({ receiverId, adId: adId ?? undefined, content: input.trim() });
      setInput('');
      await load();
      try { await messageService.markConversationRead(receiverId, adId ?? undefined); } catch { }
    } catch (e: any) {
      toast.error(e.message || 'Mesaj gönderilemedi');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-md flex items-center justify-center z-[1100] p-4">
      <div className="bg-navy-800 border border-silver-700/20 rounded-2xl shadow-xl w-full max-w-lg relative overflow-hidden flex flex-col max-h-[80vh]">

        <div className="flex items-center justify-between p-6 border-b border-silver-700/10">
          <div>
            <h3 className="text-lg font-bold text-silver-100">Mesajlaşma</h3>
            <p className="text-silver-500 text-xs mt-0.5">Güvenli Sohbet</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-navy-900 hover:bg-navy-950 border border-silver-700/10 rounded-full flex items-center justify-center text-silver-500 hover:text-silver-100 transition-all"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div ref={listRef} className="p-6 flex-1 overflow-y-auto space-y-3 bg-navy-900/50">
          {messages.length === 0 ? (
            <div className="text-center py-10 flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-navy-800 border border-silver-700/10 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-silver-500">chat_bubble_outline</span>
              </div>
              <p className="text-silver-500 text-xs">Henüz mesaj yok</p>
            </div>
          ) : (
            messages.map((m) => {
              const isMine = myId && m.sender_id === myId;
              return (
                <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-4 py-2.5 rounded-xl text-sm ${isMine
                      ? 'bg-accent text-white rounded-br-sm'
                      : 'bg-navy-800 text-silver-100 rounded-bl-sm border border-silver-700/10'
                    }`}>
                    {m.content}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 border-t border-silver-700/10 flex items-center gap-3 bg-navy-800">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
            className="input-base flex-1 px-4 py-3"
            placeholder="Mesajınızı yazın..."
          />
          <button
            onClick={send}
            disabled={sending || !input.trim()}
            className="w-11 h-11 bg-accent text-white rounded-xl flex items-center justify-center hover:bg-accent-dark transition-all disabled:opacity-40 active:scale-95"
          >
            <span className="material-symbols-outlined text-xl">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessagesModal;
