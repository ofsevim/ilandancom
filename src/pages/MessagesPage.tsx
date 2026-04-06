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
  MessageSquare,
  Trash2
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
  const [showMenu, setShowMenu] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadConversations = async () => {
    try {
      const data = await messageService.getConversations();
      setConversations(data);
      if (data.length > 0 && !activeConversation) {
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
        .channel('conversations-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload: any) => {
          const m = payload.new;
          
          loadConversations();

          if (payload.eventType === 'INSERT' && m && activeConversation) {
            const isRelated = (
              ((m.sender_id === activeConversation.other_user_id && m.receiver_id === user.id) || 
               (m.sender_id === user.id && m.receiver_id === activeConversation.other_user_id)) &&
              (m.ad_id === activeConversation.ad_id)
            );
            if (isRelated) {
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

  useEffect(() => {
    if (activeConversation && user) {
      const loadMessages = async () => {
        try {
          const data = await messageService.getConversation(activeConversation.other_user_id, activeConversation.ad_id);
          setMessages(data);
          
          await messageService.markConversationRead(activeConversation.other_user_id, activeConversation.ad_id);
          
          const userData = await publicUserService.getPublicUserById(activeConversation.other_user_id);
          setOtherUser(userData);

          if (activeConversation.ad_id) {
            const ad = await adService.getAdById(activeConversation.ad_id);
            if (ad) setAdDetail(ad);
          }
        } catch (error) {
          console.error('Error loading messages:', error);
        }
      };
      loadMessages();
    }
  }, [activeConversation, user]);

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
          <MessageSquare size={48} className="text-accent mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-silver-100">Mesajlarınızı görmek için giriş yapın</h2>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-[1600px] mx-auto px-0 sm:px-4 h-[calc(100vh-80px)] md:h-[calc(100vh-100px)] flex flex-col">
        <div className="flex flex-1 overflow-hidden bg-white dark:bg-navy-950 shadow-card rounded-none sm:rounded-[2rem] border border-slate-200 dark:border-silver-700/10">
          
          <aside className={`${activeConversation ? 'hidden md:flex' : 'flex'} w-full md:w-[400px] border-r border-slate-200 dark:border-silver-700/10 flex-col bg-slate-50 dark:bg-navy-900/50`}>
            <div className="p-6 md:p-8 pb-4">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-[28px] font-black tracking-tight text-slate-900 dark:text-silver-100 uppercase">Mesajlar</h1>
                <button className="p-2.5 hover:bg-white dark:hover:bg-accent/10 rounded-2xl transition-colors text-accent shadow-sm border border-transparent dark:hover:border-accent/20">
                  <Edit3 size={20} />
                </button>
              </div>
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-accent" />
                <input 
                  className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-navy-800 border border-slate-200 dark:border-silver-700/15 rounded-2xl focus:ring-2 focus:ring-accent/30 text-[13px] font-bold text-slate-900 dark:text-silver-100 placeholder-silver-400 dark:placeholder-silver-600 outline-none transition-all shadow-sm" 
                  placeholder="Sohbetlerde ara..." 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 space-y-2 pb-6">
              {loading ? (
                <div className="flex flex-col items-center py-12 gap-4 bg-white dark:bg-navy-800 rounded-2xl border border-slate-200 dark:border-silver-700/10 my-2">
                  <div className="animate-spin w-8 h-8 border-[3px] border-accent border-t-transparent rounded-full" />
                  <p className="text-[10px] font-bold text-accent uppercase tracking-widest text-center">Yükleniyor...</p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-navy-800 rounded-2xl border border-dashed border-slate-200 dark:border-silver-700/15 my-2">
                  <p className="text-[11px] font-bold text-silver-500 dark:text-silver-600 uppercase tracking-widest">Sohbet bulunamadı</p>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isActive = activeConversation?.other_user_id === conv.other_user_id && activeConversation?.ad_id === conv.ad_id;
                  return (
                    <div 
                      key={`${conv.ad_id}-${conv.other_user_id}`}
                      onClick={() => setActiveConversation(conv)}
                      className={`flex items-center gap-4 p-4 rounded-[1.5rem] cursor-pointer transition-all border ${isActive 
                        ? 'bg-accent/10 dark:bg-accent/10 border-accent/20 dark:border-accent/20 shadow-sm' 
                        : 'bg-white dark:bg-transparent border-slate-200 dark:border-transparent hover:bg-slate-50 dark:hover:bg-white/5 shadow-sm hover:shadow-md'}`}
                    >
                      <div className="relative flex-shrink-0">
                        <div className="w-14 h-14 rounded-[1.25rem] bg-accent/10 dark:bg-navy-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-silver-700/10">
                          <UserIcon size={24} className="text-accent" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className={`font-black text-[15px] truncate ${isActive ? 'text-accent dark:text-accent-light' : 'text-slate-900 dark:text-silver-100'}`}>
                            {conv.other_user_name}
                          </h3>
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${conv.unread_count > 0 ? 'text-accent' : 'text-silver-500 dark:text-silver-600'}`}>
                            {new Date(conv.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[12px] font-medium text-silver-500 dark:text-silver-600 truncate leading-relaxed">
                            <span className="font-bold text-silver-400 dark:text-silver-700 mr-1.5">{conv.ad_title}:</span>
                            {conv.last_message}
                          </p>
                          {conv.unread_count > 0 && (
                            <span className="bg-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-glow shrink-0">
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

          <main className={`${!activeConversation ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-slate-50 dark:bg-transparent relative`}>
            {activeConversation ? (
              <>
                <header className="h-[88px] border-b border-slate-200 dark:border-silver-700/10 bg-white/80 dark:bg-navy-950/80 backdrop-blur-xl flex items-center justify-between px-8 z-10 w-full">
                  <div className="flex items-center gap-5">
                    <button 
                      onClick={() => setActiveConversation(null)}
                      className="md:hidden p-2 -ml-2 text-accent hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl border border-transparent dark:hover:border-silver-700/10"
                    >
                      <ChevronRight className="rotate-180" size={24} />
                    </button>
                    <div className="relative">
                      <div className="w-[44px] h-[44px] rounded-2xl bg-accent/10 dark:bg-navy-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-silver-700/15 shadow-sm">
                        {otherUser?.avatar ? (
                          <img src={otherUser.avatar} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <UserIcon size={20} className="text-accent" />
                        )}
                      </div>
                    </div>
                    <div>
                      <h2 className="font-black text-[18px] text-slate-900 dark:text-silver-100 leading-none mb-1.5 tracking-tight">
                        {activeConversation.other_user_name}
                      </h2>
                      <p className="text-[10px] text-silver-500 dark:text-silver-600 font-bold uppercase tracking-[0.1em] flex items-center gap-1.5">
                        {otherUser?.role === 'admin' ? 'Yönetici' : 'Bireysel Kullanıcı'}
                      </p>
                    </div>
                  </div>

                  {adDetail && (
                    <div className="hidden lg:flex items-center gap-4 py-2.5 px-3 pr-5 bg-white dark:bg-navy-800 rounded-[1.25rem] border border-slate-200 dark:border-silver-700/10 cursor-pointer hover:shadow-md active:scale-[0.98] transition-all group">
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-slate-50 dark:bg-navy-800 border border-slate-100 dark:border-silver-700/10">
                        {adDetail.images && adDetail.images[0] ? (
                          <img src={adDetail.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><MessageSquare size={16} className="text-slate-400 dark:text-silver-400" /></div>
                        )}
                      </div>
                      <div className="min-w-0 pr-2">
                        <p className="text-[11px] font-black text-slate-900 dark:text-silver-100 leading-tight truncate max-w-[140px] tracking-tight mb-1">
                          {adDetail.title}
                        </p>
                        <p className="text-[13px] text-accent font-extrabold tracking-tighter">
                          {adDetail.price.toLocaleString('tr-TR')} ₺
                        </p>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-accent/10 dark:group-hover:bg-accent/10 transition-colors">
                        <ChevronRight size={16} className="text-silver-400 group-hover:text-accent" />
                      </div>
                    </div>
                  )}

                   <div className="flex items-center gap-2 sm:gap-3 relative">
                    <a 
                      href={otherUser?.phone ? `tel:${otherUser.phone}` : '#'}
                      onClick={(e) => !otherUser?.phone && (e.preventDefault(), toast.error('Telefon numarası bulunamadı'))}
                      className="w-11 h-11 flex items-center justify-center bg-white dark:bg-navy-800 hover:bg-accent/10 dark:hover:bg-accent/10 border border-slate-200 dark:border-silver-700/10 rounded-[14px] text-slate-600 dark:text-silver-300 hover:text-accent transition-all shadow-sm"
                      title="Ara"
                    >
                      <Phone size={18} />
                    </a>
                    
                    <div className="relative">
                      <button 
                        onClick={() => setShowMenu(!showMenu)}
                        className={`w-11 h-11 flex items-center justify-center bg-white dark:bg-navy-800 border border-slate-200 dark:border-silver-700/10 rounded-[14px] text-slate-600 dark:text-silver-300 transition-all shadow-sm ${showMenu ? 'ring-2 ring-accent/50 text-accent' : 'hover:text-accent'}`}
                      >
                        <MoreVertical size={18} />
                      </button>

                      {showMenu && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-navy-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-silver-700/15 p-2 z-50">
                            <button 
                              onClick={async () => {
                                if (!confirm('Bu konuşmayı tamamen silmek istediğinize emin misiniz?')) return;
                                try {
                                  setConversations(prev => prev.filter(c => 
                                    !(c.other_user_id === activeConversation.other_user_id && c.ad_id === activeConversation.ad_id)
                                  ));

                                  await messageService.deleteConversation(activeConversation.other_user_id, activeConversation.ad_id);
                                  toast.success('Konuşma silindi');
                                  setActiveConversation(null);
                                  
                                  setTimeout(() => {
                                    loadConversations();
                                  }, 800);

                                  setShowMenu(false);
                                } catch (e: any) {
                                  toast.error(e.message || 'Silme başarısız');
                                  loadConversations();
                                }
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-600 dark:text-silver-300 hover:text-red-500 dark:hover:text-red-400 rounded-xl transition-all text-sm font-bold"
                            >
                              <Trash2 size={16} />
                              Konuşmayı Sil
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </header>

                <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] dark:bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-20">
                  <div className="flex justify-center my-4">
                    <span className="px-5 py-2 glass rounded-full text-[10px] font-bold text-silver-500 dark:text-silver-600 uppercase tracking-[0.25em] shadow-sm border border-slate-200 dark:border-silver-700/10">Bugün</span>
                  </div>

                  {messages.map((m, idx) => {
                    const isMine = m.sender_id === user.id;
                    return (
                      <div key={idx} className={`flex items-end gap-3 max-w-[85%] sm:max-w-[70%] ${isMine ? 'ml-auto flex-row-reverse' : ''}`}>
                        {!isMine && (
                          <div className="w-9 h-9 rounded-[10px] bg-slate-200 dark:bg-navy-800 flex-shrink-0 flex items-center justify-center text-silver-500 border border-slate-300 dark:border-silver-700/10 shadow-sm">
                            <UserIcon size={18} />
                          </div>
                        )}
                        <div className={`group flex flex-col gap-2 ${isMine ? 'items-end' : ''}`}>
                          <div className={`p-5 rounded-3xl shadow-sm border ${isMine 
                            ? 'bg-accent text-white rounded-br-none border-transparent shadow-accent-glow' 
                            : 'bg-white dark:bg-navy-800 text-slate-900 dark:text-silver-100 rounded-bl-none border-slate-200 dark:border-silver-700/10'}`}>
                            <p className="text-[15px] font-medium leading-relaxed tracking-tight">{m.content}</p>
                          </div>
                          <div className="flex items-center gap-2 px-2">
                            <span className={`text-[10px] font-bold uppercase tracking-widest leading-none ${isMine ? 'text-silver-400 dark:text-silver-600' : 'text-silver-400 dark:text-silver-600'}`}>
                              {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isMine && <CheckCheck size={14} className="text-accent" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <footer className="p-6 md:p-8 pt-4 bg-white dark:bg-navy-950 border-t border-slate-200 dark:border-silver-700/10 z-10 glass">
                  <form onSubmit={handleSendMessage} className="flex items-center gap-4 bg-slate-50 dark:bg-navy-800 rounded-full p-2.5 pr-3 shadow-inner border border-slate-200 dark:border-silver-700/10">
                    <div className="flex items-center pl-2">
                      <button type="button" className="p-2 hover:bg-white dark:hover:bg-white/5 rounded-full transition-all text-silver-400 hover:text-accent">
                        <Paperclip size={20} />
                      </button>
                      <button type="button" className="p-2 hover:bg-white dark:hover:bg-white/5 rounded-full transition-all text-silver-400 hover:text-accent ml-1">
                        <Smile size={20} />
                      </button>
                    </div>
                    <input 
                      className="flex-1 bg-transparent border-none focus:ring-0 text-[15px] py-3 text-slate-900 dark:text-silver-100 placeholder-silver-400 dark:placeholder-silver-600 font-medium outline-none" 
                      placeholder="Mesajınızı yazın..." 
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                    />
                    <button 
                      type="submit"
                      disabled={!input.trim() || sending}
                      className="w-12 h-12 bg-accent text-white rounded-full flex items-center justify-center shadow-glow hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 shrink-0"
                    >
                      <Send size={20} className="ml-0.5" />
                    </button>
                  </form>
                  <div className="mt-5 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[14px] text-emerald-500">shield</span>
                    <p className="text-[10px] font-bold text-silver-500 dark:text-silver-600 uppercase tracking-widest">Güvenliğiniz için ödemelerinizi platform üzerinden yapın.</p>
                  </div>
                </footer>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center glass">
                <div className="w-32 h-32 bg-accent/10 dark:bg-navy-800 rounded-full flex items-center justify-center mb-8 shadow-sm border border-slate-100 dark:border-silver-700/10 relative">
                  <div className="absolute inset-0 rounded-full border border-accent/20 animate-[spin_10s_linear_infinite]"></div>
                  <MessageSquare size={48} className="text-accent" />
                </div>
                <h3 className="text-[28px] font-black text-slate-900 dark:text-silver-100 mb-4 tracking-tighter">Sohbet Merkezi</h3>
                <p className="text-silver-500 dark:text-silver-600 text-[15px] max-w-sm font-medium leading-relaxed">
                  Sohbet etmek için soldaki listeden bir konuşma seçin veya ilanlar üzerinden doğrudan mesaj gönderin.
                </p>
                <button className="mt-8 px-8 py-3.5 bg-white dark:bg-navy-800 rounded-2xl border border-slate-200 dark:border-silver-700/15 text-[11px] font-bold text-slate-900 dark:text-silver-100 uppercase tracking-widest shadow-sm hover:border-accent transition-colors">
                  İlanları Keşfet
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </Layout>
  );
};

export default MessagesPage;
