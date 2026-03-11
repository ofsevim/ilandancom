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
              <div className="flex gap-4">
                {[
                  { icon: 'share', label: 'Sosyal Medya' },
                  { icon: 'language', label: 'Web' },
                  { icon: 'public', label: 'Global' }
                ].map((social, i) => (
                  <a 
                    key={i}
                    href="#" 
                    className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 group"
                  >
                    <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">{social.icon}</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="lg:ml-auto">
              <h4 className="font-bold mb-6 mt-2 uppercase text-[10px] tracking-[0.2em] text-slate-400 dark:text-slate-500">Kurumsal</h4>
              <ul className="space-y-4 text-sm font-semibold">
                <li><button onClick={() => setShowAbout(true)} className="text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">Hakkımızda</button></li>
                <li><button onClick={() => setShowAbout(true)} className="text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">Sürdürülebilirlik</button></li>
                <li><button onClick={() => setShowAbout(true)} className="text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">Kariyer</button></li>
                <li><button onClick={() => setShowContact(true)} className="text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">Bize Ulaşın</button></li>
              </ul>
            </div>

            <div className="lg:ml-auto">
              <h4 className="font-bold mb-6 mt-2 uppercase text-[10px] tracking-[0.2em] text-slate-400 dark:text-slate-500">Hizmetlerimiz</h4>
              <ul className="space-y-4 text-sm font-semibold">
                <li><button className="text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">İlan Dopingi</button></li>
                <li><button className="text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">Güvenli Ödeme</button></li>
                <li><button className="text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">Hizmet İlanları</button></li>
                <li><button className="text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">Reklam Ver</button></li>
              </ul>
            </div>

            <div className="lg:ml-auto">
              <h4 className="font-bold mb-6 mt-2 uppercase text-[10px] tracking-[0.2em] text-slate-400 dark:text-slate-500">Yardım & Hukuki</h4>
              <ul className="space-y-4 text-sm font-semibold">
                <li><button onClick={() => setPolicy(policies.privacy)} className="text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">Gizlilik Politikası</button></li>
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
              <img 
                alt="App Store" 
                className="h-8 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqtbpJSIkZmaSvyVBSU96mr3iH_yW-uhdzcn3PubGDsIETCKoHgfc3S_MAAA3jsW_KM3zBZQqb_dnmu-JEXDd_dcsQmNe9o2uniJ8j9C1pwZ9G2fPh4Cy0zDh1OM0RRUi9bb6kBRthsEd-TxLiyD7Hc5xuQD8I8x33VtA2-PpcpIGA5hc1ODGYx9jKFK7yJOQSBEbl8sunmwhi2JXzsJVn5Nx7XkX7RcPcBk-rJH2y3WPYo52A2UT-9UzMQ-yLjNSGp0kIuEKKoR_o"
              />
              <img 
                alt="Google Play" 
                className="h-8 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBOzbV0xJVGP7eHTXCzKjiNN8bzuuQN-mUd73TOsokShI7aQHyTPMZpwO0ZnfW1ECr-Y3lO5VWs9wOWB1xhjGO5CNny75ohid0zBKGgsOd4OUPOJrccBGY_YX--c1hLbdvrBOukx8h5-h49X23aanVmEnLitC4QerQfg1vrZgOTI1czofdbh_rchsNkee-w9lczhCcY2-5LwnlLIK_EF85vakGGG-9J55YNqv12AVyl16FyH5A4InnUSssv2BotF5uCDjRrFArTnVS"
              />
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
