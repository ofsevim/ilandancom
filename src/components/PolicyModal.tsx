import React from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface PolicyModalProps {
  onClose: () => void;
  title: string;
  content: string;
}

const PolicyModal: React.FC<PolicyModalProps> = ({ onClose, title, content }) => {
  return (
    <div className="fixed inset-0 bg-primary-950/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-primary-900 rounded-[2.5rem] max-w-2xl w-full overflow-hidden shadow-premium border border-primary-100 dark:border-primary-800"
      >
        <div className="flex items-center justify-between p-8 border-b border-primary-100 dark:border-primary-800 bg-primary-50/50 dark:bg-black/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 gold-gradient rounded-2xl flex items-center justify-center shadow-gold-glow">
              <ShieldCheck size={24} className="text-primary-950" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-primary-950 dark:text-white tracking-tight">{title}</h2>
              <p className="text-primary-400 text-[10px] font-bold uppercase tracking-widest mt-1">Yasal Bilgilendirme</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 glass rounded-full flex items-center justify-center text-primary-400 hover:text-primary-600 dark:hover:text-white transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 lg:p-10">
          <div className="max-h-[60vh] overflow-y-auto pr-4 scrollbar-hide">
            <div className="p-6 bg-primary-50 dark:bg-primary-800/30 rounded-3xl border border-primary-100 dark:border-primary-800/50">
              <p className="text-primary-700 dark:text-primary-300 font-medium leading-[1.8] whitespace-pre-wrap text-sm">
                {content}
              </p>
            </div>
          </div>

          <div className="pt-8 flex justify-end">
            <button
              onClick={onClose}
              className="px-10 py-4 gold-gradient text-primary-950 rounded-2xl font-black text-xs uppercase tracking-widest shadow-premium hover:-translate-y-1 transition-all"
            >
              Onayla ve Kapat
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PolicyModal;
