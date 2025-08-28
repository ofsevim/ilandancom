import React from 'react';
import { X } from 'lucide-react';

interface AboutModalProps {
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Hakkımızda</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X size={22} />
          </button>
        </div>
        <div className="p-5 space-y-4 text-gray-700 dark:text-gray-300 text-sm leading-6">
          <p>ilandan.com; kullanıcıların emlak, vasıta, elektronik ve daha birçok kategoride ilan yayınlayabildiği modern bir platformdur.</p>
          <p>Amacımız; güvenli, hızlı ve kolay bir ilan deneyimi sunmak. Şeffaflık ve kullanıcı memnuniyeti odaklı çalışıyoruz.</p>
          <p>Her gün geliştirmeye devam ediyor, geri bildirimlere önem veriyoruz.</p>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;
