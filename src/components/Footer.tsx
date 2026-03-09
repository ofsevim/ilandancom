import React, { useState } from 'react';
import { Mail, Phone, MapPin, Instagram, Twitter, Facebook, ArrowUpRight } from 'lucide-react';
import AboutModal from './AboutModal';
import ContactModal from './ContactModal';
import PolicyModal from './PolicyModal';
import { motion } from 'framer-motion';

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
    <footer className="relative mt-24 overflow-hidden">
      {/* Premium Decorative Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-accent-premium/30 to-transparent"></div>

      <div className="bg-primary-950 text-white relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            {/* Brand Section */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2">
                <div className="w-10 h-10 bg-accent-premium rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-white font-black text-xl">i</span>
                </div>
                <h3 className="text-2xl font-black tracking-tight text-white outfit-font">ilandan<span className="text-accent-premium">.online</span></h3>
              </div>
              <p className="text-primary-400 text-sm font-medium leading-relaxed max-w-xs">
                Türkiye'nin en seçkin ilan platformu. Emlak, araç ve değerli eşyalarınız için premium satış deneyimi.
              </p>
              <div className="flex items-center gap-4">
                {[Facebook, Twitter, Instagram].map((Icon, i) => (
                  <motion.a
                    key={i}
                    href="#"
                    whileHover={{ y: -3 }}
                    className="w-10 h-10 glass rounded-full flex items-center justify-center text-primary-400 hover:text-accent-premium transition-colors"
                  >
                    <Icon size={18} />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-accent-premium mb-8">Kurumsal</h4>
              <ul className="space-y-4">
                {[
                  { label: 'Hakkımızda', onClick: () => setShowAbout(true) },
                  { label: 'İletişim', onClick: () => setShowContact(true) },
                  { label: 'Kariyer', onClick: () => setShowAbout(true) }
                ].map((link, i) => (
                  <li key={i}>
                    <button
                      onClick={link.onClick}
                      className="text-primary-400 hover:text-white transition-colors text-sm font-semibold flex items-center group"
                    >
                      {link.label}
                      <ArrowUpRight size={14} className="ml-1 opacity-0 group-hover:opacity-100 -translate-y-1 translate-x-1 transition-all" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-accent-premium mb-8">Hukuki</h4>
              <ul className="space-y-4">
                {[
                  { label: 'Gizlilik Politikası', policy: policies.privacy },
                  { label: 'Kullanım Koşulları', policy: policies.terms },
                  { label: 'Çerez Politikası', policy: policies.cookies }
                ].map((link, i) => (
                  <li key={i}>
                    <button
                      onClick={() => setPolicy(link.policy)}
                      className="text-primary-400 hover:text-white transition-colors text-sm font-semibold flex items-center group"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Section */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-accent-premium mb-8">İletişim</h4>
              <ul className="space-y-6">
                <li className="flex items-start gap-4 group">
                  <div className="w-10 h-10 bg-primary-900 rounded-xl flex items-center justify-center text-accent-light shrink-0 transition-all border border-primary-800">
                    <Mail size={18} />
                  </div>
                  <div>
                    <span className="block text-[10px] font-black text-primary-500 uppercase tracking-widest mb-1">E-posta</span>
                    <a href="mailto:omersvm0606@gmail.com" className="text-sm font-bold text-primary-100 hover:text-white transition-colors">omersvm0606@gmail.com</a>
                  </div>
                </li>
                <li className="flex items-start gap-4 group">
                  <div className="w-10 h-10 bg-primary-900 rounded-xl flex items-center justify-center text-accent-light shrink-0 transition-all border border-primary-800">
                    <Phone size={18} />
                  </div>
                  <div>
                    <span className="block text-[10px] font-black text-primary-500 uppercase tracking-widest mb-1">Telefon</span>
                    <a href="tel:+905070000000" className="text-sm font-bold text-primary-100 hover:text-white transition-colors">+90 507 000 00 00</a>
                  </div>
                </li>
                <li className="flex items-start gap-4 group">
                  <div className="w-10 h-10 bg-primary-900 rounded-xl flex items-center justify-center text-accent-light shrink-0 transition-all border border-primary-800">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <span className="block text-[10px] font-black text-primary-500 uppercase tracking-widest mb-1">Merkez</span>
                    <p className="text-sm font-bold text-primary-100">Ankara, Türkiye</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-900 bg-black/50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-primary-500 text-sm font-medium">
              © {currentYear} <span className="text-primary-300">ilandan.online</span>. Tüm hakları saklıdır.
            </p>
            <div className="flex items-center gap-8">
              {[
                { label: 'Yardım', onClick: () => setShowContact(true) },
                { label: 'Güvenlik', onClick: () => setPolicy(policies.privacy) },
                { label: 'SSS', onClick: () => setShowAbout(true) }
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className="text-primary-500 hover:text-accent-premium text-xs font-black uppercase tracking-widest transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
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
