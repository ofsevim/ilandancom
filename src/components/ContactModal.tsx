import React from 'react';
import { X, Mail, Phone, MapPin, Send } from 'lucide-react';
import { motion } from 'framer-motion';

interface ContactModalProps {
  onClose: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-primary-950/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white dark:bg-primary-900 rounded-[2.5rem] max-w-md w-full overflow-hidden shadow-premium border border-primary-100 dark:border-primary-800"
      >
        <div className="flex items-center justify-between p-8 border-b border-primary-100 dark:border-primary-800 bg-primary-50/50 dark:bg-black/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 gold-gradient rounded-2xl flex items-center justify-center shadow-gold-glow">
              <Phone size={24} className="text-primary-950" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-primary-950 dark:text-white tracking-tight">İletişim</h2>
              <p className="text-primary-400 text-[10px] font-bold uppercase tracking-widest mt-1">Bize Ulaşın</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 glass rounded-full flex items-center justify-center text-primary-400 hover:text-primary-600 dark:hover:text-white transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <ul className="space-y-4">
            <li className="flex items-center gap-5 p-4 bg-primary-50 dark:bg-primary-800/50 rounded-2xl group hover:shadow-premium transition-all">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-primary-900 flex items-center justify-center text-accent-premium shadow-sm group-hover:shadow-gold-glow transition-all">
                <Mail size={18} />
              </div>
              <div>
                <span className="block text-[10px] font-black text-primary-400 uppercase tracking-widest">E-posta</span>
                <span className="text-sm font-bold text-primary-900 dark:text-white">omersvm0606@gmail.com</span>
              </div>
            </li>
            <li className="flex items-center gap-5 p-4 bg-primary-50 dark:bg-primary-800/50 rounded-2xl group hover:shadow-premium transition-all">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-primary-900 flex items-center justify-center text-accent-premium shadow-sm group-hover:shadow-gold-glow transition-all">
                <Phone size={18} />
              </div>
              <div>
                <span className="block text-[10px] font-black text-primary-400 uppercase tracking-widest">Telefon</span>
                <span className="text-sm font-bold text-primary-900 dark:text-white">+90 312 000 00 00</span>
              </div>
            </li>
            <li className="flex items-center gap-5 p-4 bg-primary-50 dark:bg-primary-800/50 rounded-2xl group hover:shadow-premium transition-all">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-primary-900 flex items-center justify-center text-accent-premium shadow-sm group-hover:shadow-gold-glow transition-all">
                <MapPin size={18} />
              </div>
              <div>
                <span className="block text-[10px] font-black text-primary-400 uppercase tracking-widest">Merkez</span>
                <span className="text-sm font-bold text-primary-900 dark:text-white">Ankara, Türkiye</span>
              </div>
            </li>
          </ul>

          <div className="pt-4">
            <a
              href="mailto:omersvm0606@gmail.com"
              className="w-full flex items-center justify-center gap-3 py-4 gold-gradient text-primary-950 rounded-2xl font-black text-xs uppercase tracking-widest shadow-premium hover:-translate-y-1 transition-all"
            >
              <Send size={16} />
              Mesaj Gönder
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ContactModal;
