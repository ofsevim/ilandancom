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

  const renderDistrictField = () => {
    if (districts.length > 0) {
      return (
        <div className="relative">
          <select
            name="district"
            value={formData.district}
            onChange={handleInputChange}
            className="input-base w-full px-4 py-3.5 appearance-none cursor-pointer pr-10"
            required
          >
            <option value="">Seçin</option>
            {districts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
          </select>
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-silver-500 text-xl">expand_more</span>
        </div>
      );
    }
    return (
      <input
        type="text"
        name="district"
        value={formData.district}
        onChange={handleInputChange}
        className="input-base w-full px-4 py-3.5"
        placeholder="İlçe girin"
        required
      />
    );
  };

  return (
    <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-md flex items-center justify-center z-[1000] p-4 lg:p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-navy-800 border border-silver-700/20 rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-6 border-b border-silver-700/10">
          <div>
            <h2 className="text-lg font-bold text-silver-100">Yeni İlan Oluştur</h2>
            <p className="text-silver-500 text-xs mt-0.5">İlan bilgilerini doldurun</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-navy-900 hover:bg-navy-950 border border-silver-700/10 rounded-full flex items-center justify-center text-silver-500 hover:text-silver-100 transition-all">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 lg:p-8 space-y-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-semibold text-silver-500 uppercase tracking-wider mb-2 block">İlan Başlığı</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="input-base w-full px-4 py-3.5"
                  placeholder="Kısa ve öz bir başlık yazın..."
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-silver-500 uppercase tracking-wider mb-2 block">Açıklama</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={6}
                  className="input-base w-full px-4 py-3.5 resize-none"
                  placeholder="Detaylı açıklama (en az 60 karakter)..."
                />
                <div className="mt-1.5 text-[10px] text-silver-500 text-right">
                  {formData.description.trim().length} / 1000
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-semibold text-silver-500 uppercase tracking-wider mb-2 block">Şehir</label>
                  <div className="relative">
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="input-base w-full px-4 py-3.5 appearance-none cursor-pointer pr-10"
                    >
                      <option value="">Seçin</option>
                      {cities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-silver-500 text-xl">expand_more</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-silver-500 uppercase tracking-wider mb-2 block">İlçe</label>
                  {renderDistrictField()}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-silver-500 uppercase tracking-wider mb-2 block">Kategori</label>
                <div className="relative">
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="input-base w-full px-4 py-3.5 appearance-none cursor-pointer pr-10"
                  >
                    <option value="">Seçin</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-silver-500 text-xl">expand_more</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-silver-500 uppercase tracking-wider mb-2 block">Fiyat (TL)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="input-base w-full px-4 py-3.5"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-silver-500 uppercase tracking-wider mb-4 block">Görseller (Max 10)</label>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
              <label htmlFor="image-upload" className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-silver-700/20 rounded-xl cursor-pointer hover:border-accent/30 hover:bg-accent/5 transition-all group">
                <span className="material-symbols-outlined text-3xl text-silver-600 group-hover:text-accent mb-1">add_photo_alternate</span>
                <span className="text-[10px] font-medium text-silver-500 group-hover:text-accent">Ekle</span>
              </label>

              {formData.images.map((file, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                  <img src={URL.createObjectURL(file)} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <button type="button" onClick={() => removeImage(i)} className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-lg flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110">
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-silver-700/10 bg-navy-900/50 flex flex-col sm:flex-row justify-end gap-3">
          <button onClick={onClose} className="btn-secondary px-6 py-3 text-xs">İptal</button>
          <button onClick={handleSubmit} disabled={loading} className="btn-primary px-8 py-3 text-xs disabled:opacity-50">
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span className="material-symbols-outlined text-sm">add</span>
            )}
            <span>{loading ? 'Yayınlanıyor...' : 'İlan Yayınla'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default NewAdModal;
