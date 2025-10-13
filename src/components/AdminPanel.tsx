import React, { useState } from 'react';
import { X, Image, Zap } from 'lucide-react';
import { optimizeAllImages } from '../scripts/optimizeImages';
import toast from 'react-hot-toast';

interface AdminPanelProps {
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [optimizing, setOptimizing] = useState(false);
  const [progress, setProgress] = useState('');

  const handleOptimizeImages = async () => {
    if (!window.confirm('Tüm ilanların resimlerini optimize etmek istediğinize emin misiniz? Bu işlem uzun sürebilir.')) {
      return;
    }

    setOptimizing(true);
    setProgress('Başlıyor...');

    try {
      // Console log'ları yakalayalım
      const originalLog = console.log;
      console.log = (...args) => {
        setProgress(args.join(' '));
        originalLog(...args);
      };

      await optimizeAllImages();

      console.log = originalLog;
      toast.success('Tüm resimler optimize edildi!');
      setProgress('Tamamlandı! ✅');
    } catch (error) {
      console.error(error);
      toast.error('Optimizasyon sırasında hata oluştu');
      setProgress('Hata oluştu ❌');
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Admin Paneli
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Resim Optimizasyonu */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-blue-200 dark:border-gray-600">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Image size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Resim Optimizasyonu
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Tüm ilanların resimlerini sıkıştırır ve optimize eder. Sayfa yükleme hızını %80-90 artırır.
                </p>
                
                {progress && (
                  <div className="bg-white dark:bg-gray-900 rounded-lg p-3 mb-4 font-mono text-xs text-gray-700 dark:text-gray-300 max-h-32 overflow-y-auto">
                    {progress}
                  </div>
                )}
                
                <button
                  onClick={handleOptimizeImages}
                  disabled={optimizing}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Zap size={16} />
                  {optimizing ? 'Optimize Ediliyor...' : 'Tüm Resimleri Optimize Et'}
                </button>
              </div>
            </div>
          </div>

          {/* Uyarı */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              ⚠️ <strong>Dikkat:</strong> Bu işlem geri alınamaz ve uzun sürebilir. İşlem sırasında sayfayı kapatmayın.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
