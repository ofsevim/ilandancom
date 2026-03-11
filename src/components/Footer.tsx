import React, { useState } from 'react';
import AboutModal from './AboutModal';
import ContactModal from './ContactModal';
import PolicyModal from './PolicyModal';

const Footer: React.FC = () => {
  const [showAbout, setShowAbout] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [policy, setPolicy] = useState<{ title: string; content: string } | null>(null);

  const policies = {
    privacy: {
      title: 'Gizlilik Politikası',
      content:
        'Kullanıcı verilerini yalnızca hizmet sunmak amacıyla işler, üçüncü taraflarla paylaşmayız. Verileriniz Supabase üzerinde güvenle saklanır. Talep halinde hesabınızı ve verilerinizi silebilirsiniz.'
    },
    terms: {
      title: 'Kullanım Koşulları',
      content:
        'ilandan.online’ı kullanarak ilan ekleme, düzenleme ve mesajlaşma özelliklerinden faydalanabilirsiniz. Yasaya aykırı içerik ve telif haklarını ihlal eden paylaşımlar kabul edilmez.'
    },
    cookies: {
      title: 'Çerez Politikası',
      content:
        'Deneyimi iyileştirmek için zorunlu ve analitik çerezler kullanırız. Tarayıcı ayarlarından çerez tercihlerinizi yönetebilirsiniz.'
    }
  } as const;

  const currentYear = new Date().getFullYear();

  return (
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="space-y-6">
              <div 
                className="flex items-center gap-2 cursor-pointer group"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <div className="bg-primary p-2 rounded-xl text-white group-hover:rotate-12 transition-transform">
                  <span className="material-symbols-outlined text-2xl">layers</span>
                </div>
                <h1 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">
                  ilandan<span className="text-primary">.online</span>
                </h1>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-xs">
                Türkiye'nin en modern ve kullanıcı dostu ilan platformu. Emlak, vasıta ve tüm alışveriş kategorilerinde güvenle ilanlarınızı yayınlayın.
              </p>
            </div>

            <div className="lg:ml-auto">
              <h4 className="font-bold mb-6 mt-2 uppercase text-[10px] tracking-[0.2em] text-slate-400 dark:text-slate-500">Kurumsal</h4>
              <ul className="space-y-4 text-sm font-semibold">
                <li><button onClick={() => setShowAbout(true)} className="text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">Hakkımızda</button></li>
                <li><button onClick={() => setShowContact(true)} className="text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">Bize Ulaşın</button></li>
                <li><button onClick={() => setPolicy(policies.privacy)} className="text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">Gizlilik Politikası</button></li>
              </ul>
            </div>

            <div className="lg:ml-auto">
              <h4 className="font-bold mb-6 mt-2 uppercase text-[10px] tracking-[0.2em] text-slate-400 dark:text-slate-500">Yardım & Hukuki</h4>
              <ul className="space-y-4 text-sm font-semibold">
                <li><button onClick={() => setPolicy(policies.terms)} className="text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">Kullanım Koşulları</button></li>
                <li><button onClick={() => setPolicy(policies.cookies)} className="text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">Çerez Politikası</button></li>
                <li><button onClick={() => setShowContact(true)} className="text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">Yardım Merkezi</button></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
              © {currentYear} ilandan.online. Tüm hakları saklıdır.
            </p>
            <div className="flex items-center gap-6">
            </div>
          </div>
        </div>

      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
      {showContact && <ContactModal onClose={() => setShowContact(false)} />}
      {policy && (
        <PolicyModal
          title={policy.title}
          content={policy.content}
          onClose={() => setPolicy(null)}
        />
      )}
    </footer>
  );
};

export default Footer;
