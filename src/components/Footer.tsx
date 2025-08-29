import React, { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
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
        'ilandan.com’u kullanarak ilan ekleme, düzenleme ve mesajlaşma özelliklerinden faydalanabilirsiniz. Yasaya aykırı içerik ve telif haklarını ihlal eden paylaşımlar kabul edilmez.'
    },
    cookies: {
      title: 'Çerez Politikası',
      content:
        'Deneyimi iyileştirmek için zorunlu ve analitik çerezler kullanırız. Tarayıcı ayarlarından çerez tercihlerinizi yönetebilirsiniz.'
    }
  } as const;

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">ilandan</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Türkiye'nin modern ilan platformu. Emlak, araç, elektronik ve daha fazlası.
            </p>
          </div>

          {/* Kurumsal */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Kurumsal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => setShowAbout(true)} className="text-left text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  Hakkımızda
                </button>
              </li>
              <li>
                <button onClick={() => setShowContact(true)} className="text-left text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  İletişim
                </button>
              </li>
              <li>
                <a className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400" href="#">Kariyer</a>
              </li>
            </ul>
          </div>

          {/* Politikalar */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Politikalar</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => setPolicy(policies.privacy)}
                  className="text-left text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Gizlilik Politikası
                </button>
              </li>
              <li>
                <button
                  onClick={() => setPolicy(policies.terms)}
                  className="text-left text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Kullanım Koşulları
                </button>
              </li>
              <li>
                <button
                  onClick={() => setPolicy(policies.cookies)}
                  className="text-left text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Çerez Politikası
                </button>
              </li>
            </ul>
          </div>

          {/* İletişim */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">İletişim</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center"><Mail size={16} className="mr-2" /> omersvm0606@gmail.com</li>
              <li className="flex items-center"><Phone size={16} className="mr-2" /> +90 312 000 00 00</li>
              <li className="flex items-center"><MapPin size={16} className="mr-2" /> Ankara, Türkiye</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <p>© {new Date().getFullYear()} ilandan. Tüm hakları saklıdır.</p>
          <div className="mt-2 md:mt-0 space-x-4">
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Yardım</a>
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Güvenlik</a>
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">SSS</a>
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
