import React, { useEffect, useRef, useState } from 'react';
import { X, Send } from 'lucide-react';
import { messageService } from '../services/api';
import toast from 'react-hot-toast';

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
    load();
  }, [receiverId, adId]);

  const send = async () => {
    if (!input.trim()) return;
    try {
      setSending(true);
      await messageService.sendMessage({ receiverId, adId, content: input.trim() });
      setInput('');
      await load();
    } catch (e: any) {
      toast.error(e.message || 'Mesaj gönderilemedi');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Mesajlaşma</h3>
          <button onClick={onClose} aria-label="Kapat" className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center">
            <X size={18} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>
        <div ref={listRef} className="p-4 max-h-[50vh] overflow-y-auto space-y-2">
          {messages.length === 0 ? (
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">Henüz mesaj yok</div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={`flex ${m.is_mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-3 py-2 rounded-lg text-sm ${m.is_mine ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'}`}>
                  {m.content}
                </div>
              </div>
            ))
          )}
        </div>
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
            className="flex-1 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Mesaj yazın"
          />
          <button
            onClick={send}
            disabled={sending}
            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60 flex items-center gap-1"
          >
            <Send size={16} /> Gönder
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessagesModal;


