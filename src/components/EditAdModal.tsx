import React, { useMemo, useState, useEffect } from 'react';
import { X, Upload, Trash2, Edit } from 'lucide-react';
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

  const modalVariants: any = {
    hidden: { opacity: 0, scale: 0.95, y: 30 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } },
    exit: { opacity: 0, scale: 0.95, y: 30 }
  };

  const hasDistrictList = !!(districts && districts.length);

  return (
    <div className="fixed inset-0 bg-primary-950/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 lg:p-8 overflow-y-auto">
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="bg-white dark:bg-primary-900 rounded-[2.5rem] max-w-4xl w-full max-h-full overflow-hidden flex flex-col shadow-premium border border-primary-100 dark:border-primary-800"
      >
        {/* Close Button - Premium */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 glass-premium rounded-full flex items-center justify-center text-primary-400 hover:text-white transition-all z-50 hover:scale-110 active:scale-90"
        >
          <X size={20} />
        </button>

        <div className="flex items-center justify-between p-8 border-b border-primary-100 dark:border-primary-800 bg-primary-50/50 dark:bg-black/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-neon-indigo rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Edit size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-primary-950 dark:text-white tracking-tight">İlanı Düzenle</h2>
              <p className="text-primary-500 text-[10px] font-bold uppercase tracking-widest mt-1">İlan bilgilerinizi güncelleyin</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 lg:p-10 space-y-8 overflow-y-auto flex-1 scrollbar-hide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-3 block pl-4">İlan Başlığı</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 bg-primary-50 dark:bg-primary-800 border border-primary-100 dark:border-primary-800 rounded-2xl focus:ring-2 focus:ring-accent-premium outline-none text-primary-950 dark:text-white font-semibold transition-all"
                  placeholder="İlan başlığı"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-3 block pl-4">Açıklama</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-6 py-4 bg-primary-50 dark:bg-primary-800 border border-primary-100 dark:border-primary-800 rounded-2xl focus:ring-2 focus:ring-accent-premium outline-none text-primary-950 dark:text-white font-semibold transition-all resize-none"
                  placeholder="İlan açıklaması (En az 60 karakter)"
                  maxLength={1000}
                />
                <div className="mt-2 text-[10px] font-bold text-primary-400 text-right pr-4">
                  {formData.description.length} / 1000
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-3 block pl-4">Fiyat (TL)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 bg-primary-50 dark:bg-primary-800 border border-primary-100 dark:border-primary-800 rounded-2xl focus:ring-2 focus:ring-accent-premium outline-none text-primary-950 dark:text-white font-semibold transition-all"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-3 block pl-4">Kategori</label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 bg-primary-50 dark:bg-primary-800 border border-primary-100 dark:border-primary-800 rounded-2xl focus:ring-2 focus:ring-accent-premium outline-none text-primary-950 dark:text-white font-semibold transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Kategori Seçin</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-3 block pl-4">Şehir</label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 bg-primary-50 dark:bg-primary-800 border border-primary-100 dark:border-primary-800 rounded-2xl focus:ring-2 focus:ring-accent-premium outline-none text-primary-950 dark:text-white font-semibold transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Şehir Seçin</option>
                    {cities.map((c: any) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-3 block pl-4">İlçe</label>
                  {hasDistrictList ? (
                    <select
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 bg-primary-50 dark:bg-primary-800 border border-primary-100 dark:border-primary-800 rounded-2xl focus:ring-2 focus:ring-accent-premium outline-none text-primary-950 dark:text-white font-semibold transition-all appearance-none cursor-pointer"
                      required
                    >
                      <option value="">İlçe Seçin</option>
                      {districts.map((d: any) => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 bg-primary-50 dark:bg-primary-800 border border-primary-100 dark:border-primary-800 rounded-2xl focus:ring-2 focus:ring-accent-premium outline-none text-primary-950 dark:text-white font-semibold transition-all"
                      placeholder="İlçe girin"
                      required={!!formData.city}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-4 block pl-4">Görseller (Mevcut & Yeni)</label>
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
                className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-primary-200 dark:border-primary-700 rounded-3xl cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-800 transition-all group"
              >
                <Upload className="h-8 w-8 text-primary-400 group-hover:text-accent-premium transition-colors" />
                <span className="text-[10px] font-bold text-primary-400 mt-2 uppercase">Ekle</span>
              </label>

              {formData.existingImages.map((image, index) => (
                <div key={`existing-${index}`} className="relative aspect-square rounded-3xl overflow-hidden shadow-sm group">
                  <img
                    src={image}
                    alt=""
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-primary-950/50 text-white text-[8px] font-bold rounded-full backdrop-blur-sm">MEVCUT</div>
                  <button
                    type="button"
                    onClick={() => removeImage(index, 'existing')}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all hover:bg-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              {formData.images.map((file, index) => (
                <div key={`new-${index}`} className="relative aspect-square rounded-3xl overflow-hidden shadow-sm group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt=""
                    className="w-full h-full object-cover transition-transform group-hover:scale-110 border-2 border-accent-premium/30"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-accent-premium/80 text-primary-950 text-[8px] font-bold rounded-full backdrop-blur-sm">YENİ</div>
                  <button
                    type="button"
                    onClick={() => removeImage(index, 'new')}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all hover:bg-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </form>

        <div className="p-8 border-t border-primary-100 dark:border-primary-800 bg-primary-50/50 dark:bg-black/20 flex flex-col sm:flex-row justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-4 bg-white dark:bg-primary-800 text-primary-900 dark:text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-100 dark:hover:bg-primary-700 transition-all border border-primary-100 dark:border-primary-800 shadow-sm"
          >
            İptal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-10 py-4 gold-gradient text-primary-950 rounded-2xl font-black text-xs uppercase tracking-widest shadow-premium hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-950"></div>
                <span>Güncelleniyor...</span>
              </>
            ) : (
              <>
                <Edit size={18} />
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
