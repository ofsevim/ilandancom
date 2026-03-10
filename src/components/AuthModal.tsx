import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Mail, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface AuthModalProps {
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        onClose();
      } else {
        await register(formData.name, formData.email, formData.password);
        toast.success('Kayıt oluşturuldu. Lütfen e‑posta kutunuzu doğrulama için kontrol edin.');
        onClose();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const modalVariants: any = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 30, stiffness: 500, mass: 0.8 } },
    exit: { opacity: 0, scale: 0.9, y: 20 }
  };

  return (
    <div className="fixed inset-0 bg-primary-950/60 backdrop-blur-md flex items-center justify-center z-[1000] p-4">
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="bg-white dark:bg-primary-900 rounded-[2.5rem] max-w-md w-full p-8 lg:p-10 relative shadow-premium border border-primary-100 dark:border-primary-800"
      >
        {/* Close Button - Premium */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 glass-premium rounded-full flex items-center justify-center text-primary-400 hover:text-white transition-all z-50 hover:scale-110 active:scale-90"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-10">
          <div className="w-20 h-20 gold-gradient rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-premium rotate-3">
            <Lock size={32} className="text-primary-950" />
          </div>
          <h2 className="text-3xl font-black text-primary-950 dark:text-white tracking-tight">
            {isLogin ? 'Tekrar Hoşgeldiniz' : 'Yeni Hesap Oluştur'}
          </h2>
          <p className="text-primary-500 dark:text-primary-400 mt-3 font-medium text-sm">
            {isLogin ? 'Premium ilan dünyasına giriş yapın' : 'Avantajlı satış ve alışverişe başlayın'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <AnimatePresence mode="popLayout">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="relative"
              >
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary-400">
                  <User size={20} />
                </div>
                <input
                  type="text"
                  name="name"
                  placeholder="Ad Soyad"
                  value={formData.name}
                  onChange={handleChange}
                  required={!isLogin}
                  className="w-full pl-12 pr-6 py-4 bg-primary-50 dark:bg-primary-800/50 border border-primary-100 dark:border-primary-800 rounded-2xl focus:ring-2 focus:ring-accent-premium focus:border-transparent outline-none text-primary-950 dark:text-white font-semibold transition-all placeholder:text-primary-300"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary-400">
              <Mail size={20} />
            </div>
            <input
              type="email"
              name="email"
              placeholder="E-posta Adresiniz"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full pl-12 pr-6 py-4 bg-primary-50 dark:bg-primary-800/50 border border-primary-100 dark:border-primary-800 rounded-2xl focus:ring-2 focus:ring-accent-premium focus:border-transparent outline-none text-primary-950 dark:text-white font-semibold transition-all placeholder:text-primary-300"
            />
          </div>

          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary-400">
              <Lock size={20} />
            </div>
            <input
              type="password"
              name="password"
              placeholder="Şifreniz"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full pl-12 pr-6 py-4 bg-primary-50 dark:bg-primary-800/50 border border-primary-100 dark:border-primary-800 rounded-2xl focus:ring-2 focus:ring-accent-premium focus:border-transparent outline-none text-primary-950 dark:text-white font-semibold transition-all placeholder:text-primary-300"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full gold-gradient text-primary-950 py-5 rounded-[1.25rem] font-black text-sm uppercase tracking-widest shadow-premium hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading
                ? 'İşlem yapılıyor...'
                : (isLogin ? 'Giriş Yap' : 'Hemen Katıl')
              }
            </button>
          </div>
        </form>

        <div className="mt-10 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary-500 dark:text-primary-400 font-bold hover:text-accent-premium transition-colors text-sm"
          >
            {isLogin
              ? 'Henüz hesabınız yok mu? '
              : 'Zaten üyeliğiniz var mı? '
            }
            <span className="text-accent-premium border-b-2 border-accent-premium/30 pb-0.5 ml-1">
              {isLogin ? 'Kayıt Ol' : 'Giriş Yap'}
            </span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthModal;
