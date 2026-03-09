import React from 'react';
import { X, Info } from 'lucide-react';
import { motion } from 'framer-motion';

interface AboutModalProps {
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-primary-950/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white dark:bg-primary-900 rounded-[2.5rem] max-w-xl w-full overflow-hidden shadow-premium border border-primary-100 dark:border-primary-800"
      >
        <div className="flex items-center justify-between p-8 border-b border-primary-100 dark:border-primary-800 bg-primary-50/50 dark:bg-black/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 gold-gradient rounded-2xl flex items-center justify-center shadow-gold-glow">
              <Info size={24} className="text-primary-950" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-primary-950 dark:text-white tracking-tight">Hakkımızda</h2>
              <p className="text-primary-400 text-xs font-bold uppercase tracking-widest mt-1">Vizyonumuz & Değerlerimiz</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 glass rounded-full flex items-center justify-center text-primary-400 hover:text-primary-600 dark:hover:text-white transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-10 space-y-6">
          <div className="space-y-4">
            <p className="text-primary-600 dark:text-primary-200 text-lg font-medium leading-relaxed italic">
              "Türkiye'nin en seçkin ilan deneyimini inşa ediyoruz."
            </p>
            <div className="h-px w-12 gold-gradient"></div>
          </div>

          <div className="space-y-5 text-primary-600 dark:text-primary-300 font-medium leading-relaxed">
            <p>ilandan.online; kullanıcıların emlak, vasıta, elektronik ve değerli eşyalar için premium kalitede ilan yayınlayabildiği modern bir platformdur.</p>
            <p>Amacımız; sadece bir satış sitesi olmak değil, kullanıcılarımıza güvenli, hızlı ve görsel açıdan kusursuz bir ticaret deneyimi sunmaktır.</p>
            <p>Her detay üzerinde titizlikle çalışıyor, teknoloji ve tasarımı en yüksek standartlarda buluşturuyoruz.</p>
          </div>

          <div className="pt-6">
            <button
              onClick={onClose}
              className="w-full py-4 gold-gradient text-primary-950 rounded-2xl font-black text-xs uppercase tracking-widest shadow-premium hover:-translate-y-1 transition-all"
            >
              Anladım
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AboutModal;
