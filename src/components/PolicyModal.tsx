import React from 'react';
import { motion } from 'framer-motion';

interface PolicyModalProps {
  onClose: () => void;
  title: string;
  content: string;
}

const PolicyModal: React.FC<PolicyModalProps> = ({ onClose, title, content }) => {
  return (
    <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-navy-800 border border-silver-700/20 rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-silver-700/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-accent">verified</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-silver-100">{title}</h2>
              <p className="text-silver-500 text-xs mt-0.5">Yasal Bilgilendirme</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-navy-900 hover:bg-navy-950 border border-silver-700/10 rounded-full flex items-center justify-center text-silver-500 hover:text-silver-100 transition-all"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="p-6 lg:p-8">
          <div className="max-h-[60vh] overflow-y-auto pr-2">
            <div className="p-5 bg-navy-900 border border-silver-700/10 rounded-xl">
              <p className="text-silver-400 leading-relaxed whitespace-pre-wrap text-sm">
                {content}
              </p>
            </div>
          </div>

          <div className="pt-6 flex justify-end">
            <button
              onClick={onClose}
              className="btn-primary px-8 py-3 text-xs"
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
