import React from 'react';
import { motion } from 'framer-motion';

interface AboutModalProps {
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-50 dark:bg-navy-950/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-silver-700/20 rounded-2xl shadow-xl max-w-xl w-full overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-silver-700/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-accent">info</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-silver-100">Hakkımızda</h2>
              <p className="text-silver-500 text-xs mt-0.5">Vizyonumuz & Değerlerimiz</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white dark:bg-navy-900 hover:bg-navy-950 border border-silver-700/10 rounded-full flex items-center justify-center text-silver-500 hover:text-slate-900 dark:text-silver-100 transition-all"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="p-8 space-y-5">
          <div className="space-y-3">
            <p className="text-silver-300 text-base leading-relaxed italic">
              "Türkiye'nin en seçkin ilan deneyimini inşa ediyoruz."
            </p>
            <div className="h-px w-10 bg-accent/30"></div>
          </div>

          <div className="space-y-4 text-silver-400 leading-relaxed">
            <p>ilandan.online; kullanıcıların emlak, vasıta, elektronik ve değerli eşyalar için premium kalitede ilan yayınlayabildiği modern bir platformdur.</p>
            <p>Amacımız; sadece bir satış sitesi olmak değil, kullanıcılarımıza güvenli, hızlı ve görsel açıdan kusursuz bir ticaret deneyimi sunmaktır.</p>
            <p>Her detay üzerinde titizlikle çalışıyor, teknoloji ve tasarımı en yüksek standartlarda buluşturuyoruz.</p>
          </div>

          <div className="pt-4">
            <button
              onClick={onClose}
              className="btn-primary w-full py-3 text-xs"
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
