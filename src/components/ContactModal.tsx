import React from 'react';
import { motion } from 'framer-motion';

interface ContactModalProps {
  onClose: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-50 dark:bg-navy-950/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-silver-700/20 rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-silver-700/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-accent">call</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-silver-100">İletişim</h2>
              <p className="text-silver-500 text-xs mt-0.5">Bize Ulaşın</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white dark:bg-navy-900 hover:bg-navy-950 border border-silver-700/10 rounded-full flex items-center justify-center text-silver-500 hover:text-slate-900 dark:text-silver-100 transition-all"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <ul className="space-y-3">
            <li className="flex items-center gap-4 p-3 bg-white dark:bg-navy-900 border border-silver-700/10 rounded-xl">
              <div className="w-9 h-9 bg-slate-50 dark:bg-navy-800 border border-silver-700/10 rounded-lg flex items-center justify-center text-accent">
                <span className="material-symbols-outlined text-lg">mail</span>
              </div>
              <div>
                <span className="block text-[10px] font-medium text-silver-500 uppercase tracking-wider">E-posta</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-silver-100">omersvm0606@gmail.com</span>
              </div>
            </li>
            <li className="flex items-center gap-4 p-3 bg-white dark:bg-navy-900 border border-silver-700/10 rounded-xl">
              <div className="w-9 h-9 bg-slate-50 dark:bg-navy-800 border border-silver-700/10 rounded-lg flex items-center justify-center text-accent">
                <span className="material-symbols-outlined text-lg">phone</span>
              </div>
              <div>
                <span className="block text-[10px] font-medium text-silver-500 uppercase tracking-wider">Telefon</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-silver-100">+90 312 000 00 00</span>
              </div>
            </li>
            <li className="flex items-center gap-4 p-3 bg-white dark:bg-navy-900 border border-silver-700/10 rounded-xl">
              <div className="w-9 h-9 bg-slate-50 dark:bg-navy-800 border border-silver-700/10 rounded-lg flex items-center justify-center text-accent">
                <span className="material-symbols-outlined text-lg">location_on</span>
              </div>
              <div>
                <span className="block text-[10px] font-medium text-silver-500 uppercase tracking-wider">Merkez</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-silver-100">Ankara, Türkiye</span>
              </div>
            </li>
          </ul>

          <div className="pt-2">
            <a
              href="mailto:omersvm0606@gmail.com"
              className="btn-primary w-full py-3 text-xs"
            >
              <span className="material-symbols-outlined text-sm">send</span>
              Mesaj Gönder
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ContactModal;
