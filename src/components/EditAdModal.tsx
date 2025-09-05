import React, { useMemo, useState, useEffect } from 'react';
import { X, Upload, Plus, Trash2, Edit } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCategories } from '../hooks/useCategories';
import { adService, storageService } from '../services/api';
import toast from 'react-hot-toast';
import { useCities } from '../hooks/useCities';
import { useDistricts } from '../hooks/useDistricts';
import { Ad } from '../types';

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

  // Form verilerini mevcut ilan bilgileriyle doldur
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

      // Yeni resimleri yükle
      const newImageUrls: string[] = [];
      for (let i = 0; i < formData.images.length; i++) {
        const file = formData.images[i];
        const fileName = `${Date.now()}-${i}-${file.name}`;
        await storageService.uploadImage(file, fileName);
        const url = await storageService.getImageUrl(fileName);
        newImageUrls.push(url);
      }

      // Tüm resimleri birleştir
      const allImages = [...formData.existingImages, ...newImageUrls];

      // İlanı güncelle
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
    } catch (error: any) {
      console.error('Error updating ad:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      // Network error kontrolü
      if (error.message?.includes('ERR_BLOCKED_BY_CLIENT')) {
        toast.error('AdBlock veya güvenlik eklentisi API isteklerini engelliyor. Lütfen AdBlock\'u devre dışı bırakın veya siteyi beyaz listeye ekleyin.');
      } else if (error.message?.includes('Failed to fetch') || error.message?.includes('Network error')) {
        toast.error('Bağlantı hatası! İnternet bağlantınızı kontrol edin ve tekrar deneyin.');
      } else {
        toast.error(`İlan güncellenirken hata oluştu: ${error.message || 'Bilinmeyen hata'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = categories.find(c => c.id === formData.categoryId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <Edit size={20} className="mr-2" />
            İlan Düzenle
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              İlan Başlığı *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="İlan başlığını girin"
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Açıklama * (En az 60 karakter)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="İlan detaylarını açıklayın"
              maxLength={1000}
            />
            <div className="text-sm text-gray-500 mt-1">
              {formData.description.length}/1000 karakter
            </div>
          </div>

          {/* Price and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fiyat (TL) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Kategori *
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">Kategori seçin</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Şehir *
              </label>
              <select
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">Şehir seçin</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                İlçe {districts && districts.length > 0 ? '*' : ''}
              </label>
              <select
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                disabled={!districts || districts.length === 0}
              >
                <option value="">İlçe seçin</option>
                {districts?.map((district) => (
                  <option key={district.id} value={district.name}>
                    {district.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Resimler * (En az 1, en fazla 10)
            </label>
            
            {/* Existing Images */}
            {formData.existingImages.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Mevcut Resimler</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {formData.existingImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Resim ${index + 1}`}
                        className="w-full h-24 object-cover rounded border border-gray-200 dark:border-gray-600"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index, 'existing')}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images */}
            {formData.images.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Yeni Resimler</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {formData.images.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Yeni resim ${index + 1}`}
                        className="w-full h-24 object-cover rounded border border-gray-200 dark:border-gray-600"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index, 'new')}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Button */}
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload size={24} className="text-gray-400 mb-2" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Resim yüklemek için tıklayın veya sürükleyin
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  PNG, JPG, WEBP (Max 10MB)
                </span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Güncelleniyor...
                </>
              ) : (
                <>
                  <Edit size={16} className="mr-2" />
                  Güncelle
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAdModal;
