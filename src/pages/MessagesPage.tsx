import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { messageService, publicUserService, adService } from '../services/api';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import { 
  Search, 
  Edit3, 
  Phone, 
  MoreVertical, 
  Paperclip, 
  Smile, 
  Send, 
  ChevronRight,
  CheckCheck,
  User as UserIcon,
  MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Conversation {
  ad_id: string;
  ad_title: string;
  other_user_id: string;
  other_user_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

const MessagesPage = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [otherUser, setOtherUser] = useState<any>(null);
  const [adDetail, setAdDetail] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load conversations
  const loadConversations = async () => {
    try {
      const data = await messageService.getConversations();
      setConversations(data);
      if (data.length > 0 && !activeConversation) {
        // Option: select first one by default if needed
        // setActiveConversation(data[0]);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadConversations();

      const channel = supabase
        .channel('messages-page-realtime')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
          const m = payload.new;
          if (m.receiver_id === user.id || m.sender_id === user.id) {
            loadConversations();
            if (activeConversation && 
                ((m.sender_id === activeConversation.other_user_id && m.receiver_id === user.id) || 
                 (m.sender_id === user.id && m.receiver_id === activeConversation.other_user_id)) &&
                (m.ad_id === activeConversation.ad_id)) {
              setMessages(prev => [...prev, m]);
            }
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, activeConversation]);

  // Load messages for active conversation
  useEffect(() => {
    if (activeConversation && user) {
      const loadMessages = async () => {
        try {
          const data = await messageService.getConversation(activeConversation.other_user_id, activeConversation.ad_id);
          setMessages(data);
          
          // Mark as read
          await messageService.markConversationRead(activeConversation.other_user_id, activeConversation.ad_id);
          
          // Load other user details
          const userData = await publicUserService.getPublicUserById(activeConversation.other_user_id);
          setOtherUser(userData);

          // Load ad detail
          if (activeConversation.ad_id) {
            const ad = await adService.getAdById(activeConversation.ad_id);
            setAdDetail(ad);
          }
        } catch (error) {
          console.error('Error loading messages:', error);
        }
      };
      loadMessages();
    }
  }, [activeConversation, user]);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeConversation || !user || sending) return;

    try {
      setSending(true);
      await messageService.sendMessage({
        receiverId: activeConversation.other_user_id,
        adId: activeConversation.ad_id,
        content: input.trim()
      });
      setInput('');
      // Optimistic update or wait for realtime
    } catch (error) {
      toast.error('Mesaj gönderilemedi');
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter(c => 
    c.other_user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.ad_title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <MessageSquare size={48} className="text-primary-300 mb-4" />
          <h2 className="text-2xl font-bold">Mesajlarınızı görmek için giriş yapın</h2>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-[1600px] mx-auto px-0 sm:px-4 h-[calc(100vh-80px)] md:h-[calc(100vh-100px)] flex flex-col">
        <div className="flex flex-1 overflow-hidden bg-white dark:bg-primary-900 shadow-premium rounded-none sm:rounded-3xl border border-primary-100 dark:border-primary-800">
          
          {/* Sol Kolon: Mesaj Listesi */}
          <aside className={`${activeConversation ? 'hidden md:flex' : 'flex'} w-full md:w-[400px] border-r border-primary-100 dark:border-primary-800 flex-col bg-white dark:bg-primary-900`}>
            {/* Header & Search */}
            <div className="p-6 md:p-8 pb-4">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-black tracking-tight text-primary-950 dark:text-white">Mesajlar</h1>
                <button className="p-2 hover:bg-primary-50 dark:hover:bg-primary-800 rounded-xl transition-colors text-primary-500">
                  <Edit3 size={20} />
                </button>
              </div>
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" />
                <input 
                  className="w-full pl-12 pr-4 py-3.5 bg-primary-50 dark:bg-primary-800/50 border-none rounded-2xl focus:ring-2 focus:ring-accent-premium/20 text-sm font-medium transition-all" 
                  placeholder="Sohbetlerde ara..." 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-1 pb-4">
              {loading ? (
                <div className="flex flex-col items-center py-10 gap-3">
                  <div className="animate-spin w-6 h-6 border-2 border-accent-premium border-t-transparent rounded-full" />
                  <p className="text-[10px] font-bold text-primary-400 uppercase tracking-widest text-center">Yükleniyor...</p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-xs font-bold text-primary-400 uppercase tracking-widest">Sohbet bulunamadı</p>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isActive = activeConversation?.other_user_id === conv.other_user_id && activeConversation?.ad_id === conv.ad_id;
                  return (
                    <div 
                      key={`${conv.ad_id}-${conv.other_user_id}`}
                      onClick={() => setActiveConversation(conv)}
                      className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border ${isActive 
                        ? 'bg-accent-premium/5 dark:bg-accent-premium/10 border-accent-premium/20' 
                        : 'border-transparent hover:bg-primary-50 dark:hover:bg-primary-800/50'}`}
                    >
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-2xl bg-accent-premium/10 flex items-center justify-center overflow-hidden border border-accent-premium/10">
                          <UserIcon size={24} className="text-accent-premium" />
                        </div>
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-primary-900 rounded-full shadow-sm"></span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <h3 className={`font-bold text-sm truncate ${isActive ? 'text-accent-premium' : 'text-primary-950 dark:text-white'}`}>
                            {conv.other_user_name}
                          </h3>
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${conv.unread_count > 0 ? 'text-accent-premium' : 'text-primary-400'}`}>
                            {new Date(conv.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs text-primary-500 dark:text-primary-400 truncate leading-relaxed">
                            <span className="font-bold text-primary-400 mr-1">{conv.ad_title}:</span>
                            {conv.last_message}
                          </p>
                          {conv.unread_count > 0 && (
                            <span className="bg-accent-premium text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-lg shadow-accent-premium/20">
                              {conv.unread_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </aside>

          {/* Sağ Kolon: Sohbet Penceresi */}
          <main className={`${!activeConversation ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-primary-50/30 dark:bg-black/20 relative`}>
            {activeConversation ? (
              <>
                {/* Chat Header */}
                <header className="h-20 border-b border-primary-100 dark:border-primary-800 bg-white/80 dark:bg-primary-900/80 backdrop-blur-md flex items-center justify-between px-6 z-10">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setActiveConversation(null)}
                      className="md:hidden p-2 -ml-2 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-800 rounded-xl"
                    >
                      <ChevronRight className="rotate-180" size={20} />
                    </button>
                    <div className="relative">
                      <div className="w-10 h-10 rounded-xl bg-accent-premium/10 flex items-center justify-center overflow-hidden">
                        {otherUser?.avatar ? (
                          <img src={otherUser.avatar} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <UserIcon size={20} className="text-accent-premium" />
                        )}
                      </div>
                      <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-primary-900 rounded-full"></span>
                    </div>
                    <div>
                      <h2 className="font-bold text-sm text-primary-950 dark:text-white leading-none mb-1">
                        {activeConversation.other_user_name}
                      </h2>
                      <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Çevrimiçi</p>
                    </div>
                  </div>

                  {/* Listing Card Mini */}
                  {adDetail && (
                    <div className="hidden lg:flex items-center gap-3 p-2 pr-4 bg-primary-100/50 dark:bg-primary-800/50 rounded-2xl border border-primary-100 dark:border-primary-700 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all">
                      <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-white dark:bg-primary-800">
                        {adDetail.images && adDetail.images[0] ? (
                          <img src={adDetail.images[0]} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><MessageSquare size={16} /></div>
                        )}
                      </div>
                      <div className="min-w-0 pr-1">
                        <p className="text-[10px] font-black text-primary-950 dark:text-white leading-tight truncate max-w-[120px] uppercase tracking-tighter">
                          {adDetail.title}
                        </p>
                        <p className="text-[10px] text-accent-premium font-black">
                          {adDetail.price.toLocaleString('tr-TR')} TL
                        </p>
                      </div>
                      <ChevronRight size={14} className="text-primary-400" />
                    </div>
                  )}

                  <div className="flex items-center gap-1 sm:gap-2">
                    <button className="p-2.5 hover:bg-primary-50 dark:hover:bg-primary-800 rounded-xl text-primary-500 transition-colors">
                      <Phone size={18} />
                    </button>
                    <button className="p-2.5 hover:bg-primary-50 dark:hover:bg-primary-800 rounded-xl text-primary-500 transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </header>

                {/* Chat Area */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_100%)] from-accent-premium/5 to-transparent">
                  <div className="flex justify-center">
                    <span className="px-4 py-1.5 bg-white dark:bg-primary-800 rounded-full text-[9px] font-black text-primary-400 uppercase tracking-[0.2em] shadow-sm">Bugün</span>
                  </div>

                  {messages.map((m, idx) => {
                    const isMine = m.sender_id === user.id;
                    return (
                      <div key={idx} className={`flex items-end gap-3 max-w-[85%] sm:max-w-[70%] ${isMine ? 'ml-auto flex-row-reverse' : ''}`}>
                        {!isMine && (
                          <div className="w-8 h-8 rounded-lg bg-accent-premium/10 flex-shrink-0 flex items-center justify-center text-accent-premium">
                            <UserIcon size={16} />
                          </div>
                        )}
                        <div className={`group flex flex-col gap-1.5 ${isMine ? 'items-end' : ''}`}>
                          <div className={`p-4 rounded-2xl shadow-sm border ${isMine 
                            ? 'bg-accent-premium text-white rounded-br-none border-transparent' 
                            : 'bg-white dark:bg-primary-800 text-primary-950 dark:text-white rounded-bl-none border-primary-100 dark:border-primary-800'}`}>
                            <p className="text-sm font-medium leading-relaxed">{m.content}</p>
                          </div>
                          <div className="flex items-center gap-1.5 px-1">
                            <span className="text-[9px] font-bold text-primary-400 uppercase tracking-widest leading-none">
                              {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isMine && <CheckCheck size={12} className="text-accent-premium" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Chat Footer */}
                <footer className="p-4 md:p-8 pt-2 bg-white dark:bg-primary-900 border-t border-primary-100 dark:border-primary-800">
                  <form onSubmit={handleSendMessage} className="flex items-center gap-3 bg-primary-50 dark:bg-primary-800/50 rounded-[1.5rem] p-2 pr-2.5">
                    <div className="flex items-center">
                      <button type="button" className="p-2.5 hover:bg-white dark:hover:bg-primary-800 rounded-xl transition-all text-primary-500 hover:text-accent-premium">
                        <Paperclip size={18} />
                      </button>
                      <button type="button" className="p-2.5 hover:bg-white dark:hover:bg-primary-800 rounded-xl transition-all text-primary-500 hover:text-accent-premium">
                        <Smile size={18} />
                      </button>
                    </div>
                    <input 
                      className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 text-primary-950 dark:text-white placeholder:text-primary-400 font-medium" 
                      placeholder="Mesajınızı yazın..." 
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                    />
                    <button 
                      type="submit"
                      disabled={!input.trim() || sending}
                      className="w-11 h-11 bg-accent-premium text-white rounded-xl flex items-center justify-center shadow-lg shadow-accent-premium/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-40"
                    >
                      <Send size={18} />
                    </button>
                  </form>
                  <div className="mt-4 flex justify-center">
                    <p className="text-[9px] font-black text-primary-400 uppercase tracking-widest opacity-50">Güvenliğiniz için ödemelerinizi platform üzerinden yapın.</p>
                  </div>
                </footer>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_100%)] from-accent-premium/5 to-transparent">
                <div className="w-24 h-24 bg-accent-premium/10 rounded-[2.5rem] flex items-center justify-center mb-8 rotate-12">
                  <MessageSquare size={40} className="text-accent-premium" />
                </div>
                <h3 className="text-2xl font-black text-primary-950 dark:text-white mb-2 tracking-tight">Sohbet Merkezi</h3>
                <p className="text-primary-500 text-sm max-w-xs font-medium leading-relaxed">Sohbet etmek için soldaki listeden bir konuşma seçin veya ilanlar üzerinden mesaj gönderin.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </Layout>
  );
};

export default MessagesPage;
