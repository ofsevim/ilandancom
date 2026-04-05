import React, { useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCategories } from '../hooks/useCategories';
import { adService, storageService } from '../services/api';
import toast from 'react-hot-toast';
import { useCities } from '../hooks/useCities';
import { useDistricts } from '../hooks/useDistricts';
import { compressImage } from '../lib/imageCompression';
import { motion } from 'framer-motion';

interface NewAdModalProps {
  onClose: () => void;
  onAdCreated: () => void;
}

const NewAdModal: React.FC<NewAdModalProps> = ({ onClose, onAdCreated }) => {
  const { user } = useAuth();
  const { categories } = useCategories();
  const { cities } = useCities();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    categoryId: '',
    city: '',
    district: '',
    images: [] as File[]
  });

  const selectedCityId = useMemo(() => {
    const city = cities.find(c => c.name === formData.city);
    return city?.id as string | undefined;
  }, [cities, formData.city]);

  const { districts } = useDistricts(selectedCityId);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'city') {
      setFormData(prev => ({ ...prev, city: value, district: '' }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + formData.images.length > 10) {
      toast.error('En fazla 10 resim yükleyebilirsiniz');
      return;
    }
    setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error('Giriş yapmanız gerekiyor'); return; }
    if (!formData.title || !formData.description || !formData.price || !formData.categoryId || !formData.city) {
      toast.error('Lütfen tüm gerekli alanları doldurun'); return;
    }
    if (formData.description.trim().length < 60) {
      toast.error('Açıklama en az 60 karakter olmalıdır'); return;
    }

    try {
      setLoading(true);
      const imageUrls: string[] = [];
      for (let i = 0; i < formData.images.length; i++) {
        const file = formData.images[i];
        const compressedFile = await compressImage(file, 1920, 0.85);
        const fileName = `${Date.now()}-${i}-${file.name.replace(/\.[^/.]+$/, '.jpg')}`;
        await storageService.uploadImage(compressedFile, fileName);
        const url = await storageService.getImageUrl(fileName);
        imageUrls.push(url);
      }

      await adService.createAd({
        ...formData,
        price: parseFloat(formData.price),
        images: imageUrls,
        userId: user.id
      });

      toast.success('İlan başarıyla oluşturuldu!');
      onAdCreated();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl flex items-center justify-center z-[1000] p-4 lg:p-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-[3rem] max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-100 dark:border-slate-800"
      >
        <div className="flex items-center justify-between p-8 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Yeni İlan Oluştur</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Stitch Premium Marketplace</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-primary transition-all">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 lg:p-10 space-y-10 overflow-y-auto flex-1 scrollbar-hide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-8">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">İLAN BAŞLIĞI</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/20 focus:bg-white dark:focus:bg-slate-700 rounded-2xl outline-none text-slate-900 dark:text-white font-semibold transition-all placeholder:text-slate-400"
                  placeholder="Kısa ve öz bir başlık yazın..."
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">AÇIKLAMA</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/20 focus:bg-white dark:focus:bg-slate-700 rounded-2xl outline-none text-slate-900 dark:text-white font-semibold transition-all resize-none placeholder:text-slate-400"
                  placeholder="Detaylı açıklama (en az 60 karakter)..."
                />
                <div className="mt-2 text-[10px] font-bold text-slate-400 text-right uppercase tracking-widest">
                  {formData.description.trim().length} / 1000 KARAKTER
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">İLÇE</label>
                  {districts.length > 0 ? (
                    <div className="relative">
                      <select
                        name="district"
                        value={formData.district}
                        onChange={handleInputChange}
                        className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/20 focus:bg-white dark:focus:bg-slate-700 rounded-2xl outline-none text-slate-900 dark:text-white font-semibold appearance-none cursor-pointer"
                        required
                      >
                        <option value="">Seçin</option>
                        {districts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">expand_more</span>
                    </div>
                  ) : (
                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/20 focus:bg-white dark:focus:bg-slate-700 rounded-2xl outline-none text-slate-900 dark:text-white font-semibold transition-all placeholder:text-slate-400"
                      placeholder="İlçe girin"
                      required
                    />
                  )}
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">KATEGORİ</label>
                  <div className="relative">
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/20 focus:bg-white dark:focus:bg-slate-700 rounded-2xl outline-none text-slate-900 dark:text-white font-semibold appearance-none cursor-pointer"
                    >
                      <option value="">Seçin</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">expand_more</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">ŞEHİR</label>
                  <div className="relative">
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/20 focus:bg-white dark:focus:bg-slate-700 rounded-2xl outline-none text-slate-900 dark:text-white font-semibold appearance-none cursor-pointer"
                    >
                      <option value="">Seçin</option>
                      {cities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">expand_more</span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">İLÇE</label>
                  {districts.length > 0 ? (
                    <div className="relative">
                      <select
                        name="district"
                        value={formData.district}
                        onChange={handleInputChange}
                        className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/20 focus:bg-white dark:focus:bg-slate-700 rounded-2xl outline-none text-slate-900 dark:text-white font-semibold appearance-none cursor-pointer"
                        required
                      >
                        <option value="">Seçin</option>
                        {districts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">expand_more</span>
                    </div>
                  ) : (
                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/20 focus:bg-white dark:focus:bg-slate-700 rounded-2xl outline-none text-slate-900 dark:text-white font-semibold transition-all placeholder:text-slate-400"
                      placeholder="İlçe girin"
                      required
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 block">İLAN GÖRSELLERİ (MAX 10)</label>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
              <label htmlFor="image-upload" className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[2rem] cursor-pointer hover:bg-primary/5 hover:border-primary transition-all group">
                <span className="material-symbols-outlined text-4xl text-slate-300 group-hover:text-primary mb-2">upload</span>
                <span className="text-[10px] font-black text-slate-400 group-hover:text-primary">GÖRSEL EKLE</span>
              </label>

              {formData.images.map((file, i) => (
                <div key={i} className="relative aspect-square rounded-[2rem] overflow-hidden group">
                  <img src={URL.createObjectURL(file)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <button type="button" onClick={() => removeImage(i)} className="absolute top-2 right-2 w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110">
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </form>

        <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col sm:flex-row justify-end gap-4">
          <button onClick={onClose} className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all">İPTAL</button>
          <button onClick={handleSubmit} disabled={loading} className="px-10 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3">
            {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <span className="material-symbols-outlined">add</span>}
            <span>{loading ? 'YAYINLANIYOR...' : 'İLAN YAYINLA'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default NewAdModal;
