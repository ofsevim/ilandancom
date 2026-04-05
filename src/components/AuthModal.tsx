import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
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
      if (isForgot) {
        const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
          redirectTo: `${window.location.origin}/`
        });
        if (error) throw new Error(error.message);
        toast.success('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.');
        setIsForgot(false);
      } else if (isLogin) {
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

  return (
    <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-md flex items-center justify-center z-[1000] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 30, stiffness: 500, mass: 0.8 }}
        className="bg-navy-800 border border-silver-700/20 rounded-2xl shadow-xl max-w-md w-full p-8 lg:p-10 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-10 h-10 bg-navy-900 hover:bg-navy-950 border border-silver-700/10 rounded-full flex items-center justify-center text-silver-500 hover:text-silver-100 transition-all z-50"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-accent/10 border border-accent/20 rounded-2xl mx-auto mb-5 flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-accent">lock</span>
          </div>
          <h2 className="text-2xl font-bold text-silver-100 tracking-tight">
            {isForgot ? 'Şifreni Sıfırla' : isLogin ? 'Tekrar Hoşgeldiniz' : 'Yeni Hesap Oluştur'}
          </h2>
          <p className="text-silver-500 mt-2 text-sm">
            {isForgot ? 'E-posta adresinize sıfırlama bağlantısı göndereceğiz' : isLogin ? 'İlan dünyasına giriş yapın' : 'Satış ve alışverişe başlayın'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="popLayout">
            {!isLogin && !isForgot && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              >
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-silver-500 text-xl">person</span>
                  <input
                    type="text"
                    name="name"
                    placeholder="Ad Soyad"
                    value={formData.name}
                    onChange={handleChange}
                    required={!isLogin}
                    className="input-base w-full pl-12 pr-4 py-3.5"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-silver-500 text-xl">mail</span>
            <input
              type="email"
              name="email"
              placeholder="E-posta Adresiniz"
              value={formData.email}
              onChange={handleChange}
              required
              className="input-base w-full pl-12 pr-4 py-3.5"
            />
          </div>

          {!isForgot && (
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-silver-500 text-xl">lock</span>
              <input
                type="password"
                name="password"
                placeholder="Şifreniz"
                value={formData.password}
                onChange={handleChange}
                required
                className="input-base w-full pl-12 pr-4 py-3.5"
              />
            </div>
          )}

          {isLogin && !isForgot && (
            <div className="text-right -mt-1">
              <button
                type="button"
                onClick={() => setIsForgot(true)}
                className="text-xs font-medium text-silver-500 hover:text-accent transition-colors"
              >
                Şifremi Unuttum
              </button>
            </div>
          )}

          <div className="pt-3">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3.5 text-sm"
            >
              {isLoading
                ? 'İşlem yapılıyor...'
                : isForgot ? 'Sıfırlama Bağlantısı Gönder' : (isLogin ? 'Giriş Yap' : 'Hemen Katıl')
              }
            </button>
          </div>
        </form>

        <div className="mt-8 text-center space-y-2">
          {isForgot ? (
            <button
              onClick={() => setIsForgot(false)}
              className="text-silver-500 font-medium hover:text-accent transition-colors text-sm"
            >
              ← Giriş ekranına dön
            </button>
          ) : (
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-silver-500 font-medium hover:text-accent transition-colors text-sm"
            >
              {isLogin
                ? 'Henüz hesabınız yok mu? '
                : 'Zaten üyeliğiniz var mı? '
              }
              <span className="text-accent ml-1">
                {isLogin ? 'Kayıt Ol' : 'Giriş Yap'}
              </span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AuthModal;
