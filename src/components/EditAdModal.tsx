import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCategories } from '../hooks/useCategories';
import { adService, storageService } from '../services/api';
import toast from 'react-hot-toast';
import { useCities } from '../hooks/useCities';
import { useDistricts } from '../hooks/useDistricts';
import { Ad } from '../types';
import { compressImage } from '../lib/imageCompression';
import { motion } from 'framer-motion';

const sanitizeFileName = (fileName: string) => {
  return fileName.replace(/[^a-zA-Z0-9_.-]/g, '-');
};

interface EditAdModalProps {
  ad: Ad;
  onClose: () => void;
  onAdUpdated: () => void;
}

const EditAdModal: React.FC<EditAdModalProps> = ({ ad, onClose, onAdUpdated }) => {
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
    images: [] as File[],
    existingImages: [] as string[]
  });

  const selectedCityId = useMemo(() => {
    const city = cities.find(c => c.name === formData.city);
    return city?.id as string | undefined;
  }, [cities, formData.city]);

  const { districts } = useDistricts(selectedCityId);

  useEffect(() => {
    setFormData({
      title: ad.title,
      description: ad.description,
      price: ad.price.toString(),
      categoryId: ad.category.id,
      city: ad.location.city,
      district: ad.location.district,
      images: [],
      existingImages: ad.images
    });
  }, [ad]);

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
    if (files.length + formData.images.length + formData.existingImages.length > 10) {
      toast.error('En fazla 10 resim yükleyebilirsiniz');
      return;
    }
    setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
  };

  const removeImage = (index: number, type: 'existing' | 'new') => {
    if (type === 'existing') {
      setFormData(prev => ({
        ...prev,
        existingImages: prev.existingImages.filter((_, i) => i !== index)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Giriş yapmanız gerekiyor');
      return;
    }

    if (user.id !== ad.userId) {
      toast.error('Bu ilanı düzenleme yetkiniz yok');
      return;
    }

    const hasDistrictList = !!(districts && districts.length);

    if (!formData.title || !formData.description || !formData.price || !formData.categoryId || !formData.city) {
      toast.error('Lütfen tüm gerekli alanları doldurun');
      return;
    }

    if (formData.description.trim().length < 60) {
      toast.error('Açıklama en az 60 karakter olmalıdır');
      return;
    }

    if (hasDistrictList && !formData.district) {
      toast.error('Lütfen ilçe seçin');
      return;
    }

    if (formData.existingImages.length + formData.images.length === 0) {
      toast.error('En az bir resim eklemelisiniz');
      return;
    }

    try {
      setLoading(true);

      const newImageUrls: string[] = [];
      for (let i = 0; i < formData.images.length; i++) {
        const file = formData.images[i];
        const compressedFile = await compressImage(file, 1920, 0.85);
        const fileName = `${Date.now()}-${i}-${file.name.replace(/\.[^/.]+$/, '.jpg')}`;
        const sanitizedFileName = sanitizeFileName(fileName);
        await storageService.uploadImage(compressedFile, sanitizedFileName);
        const url = await storageService.getImageUrl(sanitizedFileName);
        newImageUrls.push(url);
      }

      const allImages = [...formData.existingImages, ...newImageUrls];

      await adService.updateAd(ad.id, {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        categoryId: formData.categoryId,
        city: formData.city,
        district: formData.district,
        images: allImages
      });

      toast.success('İlan başarıyla güncellendi');
      onAdUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating ad:', error);
      toast.error('İlan güncellenirken bir sorun oluştu');
    } finally {
      setLoading(false);
    }
  };

  const hasDistrictList = !!(districts && districts.length);

  return (
    <div className="fixed inset-0 bg-slate-50 dark:bg-navy-950/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 lg:p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-silver-700/20 rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-6 border-b border-silver-700/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-accent">edit</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-silver-100">İlanı Düzenle</h2>
              <p className="text-silver-500 text-xs mt-0.5">İlan bilgilerinizi güncelleyin</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white dark:bg-navy-900 hover:bg-navy-950 border border-silver-700/10 rounded-full flex items-center justify-center text-silver-500 hover:text-slate-900 dark:text-silver-100 transition-all"
          >
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
                  placeholder="İlan başlığı"
                  maxLength={100}
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
                  placeholder="İlan açıklaması (En az 60 karakter)"
                  maxLength={1000}
                />
                <div className="mt-1.5 text-[10px] text-silver-500 text-right">
                  {formData.description.length} / 1000
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
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

                <div>
                  <label className="text-[10px] font-semibold text-silver-500 uppercase tracking-wider mb-2 block">Kategori</label>
                  <div className="relative">
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      className="input-base w-full px-4 py-3.5 appearance-none cursor-pointer pr-10"
                    >
                      <option value="">Kategori Seçin</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-silver-500 text-xl">expand_more</span>
                  </div>
                </div>
              </div>

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
                      <option value="">Şehir Seçin</option>
                      {cities.map((c: any) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-silver-500 text-xl">expand_more</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-silver-500 uppercase tracking-wider mb-2 block">İlçe</label>
                  {hasDistrictList ? (
                    <div className="relative">
                      <select
                        name="district"
                        value={formData.district}
                        onChange={handleInputChange}
                        className="input-base w-full px-4 py-3.5 appearance-none cursor-pointer pr-10"
                        required
                      >
                        <option value="">İlçe Seçin</option>
                        {districts.map((d: any) => (
                          <option key={d.id} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-silver-500 text-xl">expand_more</span>
                    </div>
                  ) : (
                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      className="input-base w-full px-4 py-3.5"
                      placeholder="İlçe girin"
                      required={!!formData.city}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-silver-500 uppercase tracking-wider mb-3 block">Görseller (Mevcut & Yeni)</label>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload-edit"
              />
              <label
                htmlFor="image-upload-edit"
                className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-silver-700/20 rounded-xl cursor-pointer hover:border-accent/30 hover:bg-accent/5 transition-all group"
              >
                <span className="material-symbols-outlined text-2xl text-silver-600 group-hover:text-accent">add_photo_alternate</span>
                <span className="text-[10px] font-medium text-silver-500 mt-1">Ekle</span>
              </label>

              {formData.existingImages.map((image, index) => (
                <div key={`existing-${index}`} className="relative aspect-square rounded-xl overflow-hidden group">
                  <img
                    src={image}
                    alt=""
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-slate-50 dark:bg-navy-950/80 text-silver-300 text-[8px] font-medium rounded-md backdrop-blur-sm">Mevcut</div>
                  <button
                    type="button"
                    onClick={() => removeImage(index, 'existing')}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-lg flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              ))}

              {formData.images.map((file, index) => (
                <div key={`new-${index}`} className="relative aspect-square rounded-xl overflow-hidden group ring-2 ring-accent/30">
                  <img
                    src={URL.createObjectURL(file)}
                    alt=""
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-accent/80 text-white text-[8px] font-medium rounded-md backdrop-blur-sm">Yeni</div>
                  <button
                    type="button"
                    onClick={() => removeImage(index, 'new')}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-lg flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-silver-700/10 bg-navy-900/50 flex flex-col sm:flex-row justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary px-6 py-3 text-xs"
          >
            İptal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary px-8 py-3 text-xs disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                <span>Güncelleniyor...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">check</span>
                <span>Güncelle</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default EditAdModal;
