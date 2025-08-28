import React from 'react';
import { X, Mail, Phone, MapPin } from 'lucide-react';

interface ContactModalProps {
  onClose: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">İletişim</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X size={22} />
          </button>
        </div>
        <div className="p-5 space-y-4 text-gray-700 dark:text-gray-300 text-sm leading-6">
          <div className="flex items-center"><Mail size={18} className="mr-2" /> destek@ilandan.com</div>
          <div className="flex items-center"><Phone size={18} className="mr-2" /> +90 212 000 00 00</div>
          <div className="flex items-center"><MapPin size={18} className="mr-2" /> İstanbul, Türkiye</div>
          <div className="pt-2">
            <a href="mailto:destek@ilandan.com" className="text-blue-600 dark:text-blue-400 hover:underline">E-posta Gönder</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactModal;
