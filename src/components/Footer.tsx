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
        "ilandan.online'ı kullanarak ilan ekleme, düzenleme ve mesajlaşma özelliklerinden faydalanabilirsiniz. Yasaya aykırı içerik ve telif haklarını ihlal eden paylaşımlar kabul edilmez."
    },
    cookies: {
      title: 'Çerez Politikası',
      content:
        'Deneyimi iyileştirmek için zorunlu ve analitik çerezler kullanırız. Tarayıcı ayarlarından çerez tercihlerinizi yönetebilirsiniz.'
    }
  } as const;

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-navy-950 border-t border-slate-200 dark:border-silver-700/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <span className="material-symbols-outlined text-accent text-xl">storefront</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-silver-100">
                ilandan<span className="text-accent">.online</span>
              </h2>
            </div>
            <p className="text-slate-500 dark:text-silver-600 text-sm leading-relaxed max-w-xs">
              Türkiye'nin premium ilan platformu. Emlak, vasıta ve tüm alışveriş kategorilerinde güvenle ilanlarınızı yayınlayın.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-6 uppercase text-[11px] tracking-[0.2em] text-slate-400 dark:text-silver-700">Kurumsal</h4>
            <ul className="space-y-4 text-sm">
              <li><button onClick={() => setShowAbout(true)} className="text-slate-600 dark:text-silver-400 hover:text-accent transition-colors">Hakkımızda</button></li>
              <li><button onClick={() => setShowContact(true)} className="text-slate-600 dark:text-silver-400 hover:text-accent transition-colors">Bize Ulaşın</button></li>
              <li><button onClick={() => setPolicy(policies.privacy)} className="text-slate-600 dark:text-silver-400 hover:text-accent transition-colors">Gizlilik Politikası</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-6 uppercase text-[11px] tracking-[0.2em] text-slate-400 dark:text-silver-700">Yardım & Hukuki</h4>
            <ul className="space-y-4 text-sm">
              <li><button onClick={() => setPolicy(policies.terms)} className="text-slate-600 dark:text-silver-400 hover:text-accent transition-colors">Kullanım Koşulları</button></li>
              <li><button onClick={() => setPolicy(policies.cookies)} className="text-slate-600 dark:text-silver-400 hover:text-accent transition-colors">Çerez Politikası</button></li>
              <li><button onClick={() => setShowContact(true)} className="text-slate-600 dark:text-silver-400 hover:text-accent transition-colors">Yardım Merkezi</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-6 uppercase text-[11px] tracking-[0.2em] text-slate-400 dark:text-silver-700">İletişim</h4>
            <ul className="space-y-4 text-sm text-slate-500 dark:text-silver-400">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-slate-400 dark:text-silver-700">mail</span>
                <span>info@ilandan.online</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-slate-400 dark:text-silver-700">public</span>
                <span>www.ilandan.online</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-silver-700/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400 dark:text-silver-700 font-medium tracking-wide">
            © {currentYear} ilandan.online. Tüm hakları saklıdır.
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-silver-700">
            <span className="material-symbols-outlined text-sm">verified</span>
            <span>Güvenli Alışveriş</span>
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
