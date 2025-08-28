import React, { useState } from 'react';
import { X, MapPin, Clock, Eye, Heart, Phone, MessageCircle, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { Ad } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface AdDetailModalProps {
  ad: Ad;
  onClose: () => void;
}

const AdDetailModal: React.FC<AdDetailModalProps> = ({ ad, onClose }) => {
  const { favorites, toggleFavorite, user } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContactInfo, setShowContactInfo] = useState(false);

  const isFavorite = favorites.includes(ad.id);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === ad.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? ad.images.length - 1 : prev - 1
    );
  };

  const handleFavoriteClick = () => {
    toggleFavorite(ad.id);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-6xl w-full my-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-opacity-100 transition-all"
        >
          <X size={20} />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {/* Images */}
          <div className="space-y-4">
            {ad.images.length > 0 ? (
              <div className="relative">
                <img
                  src={ad.images[currentImageIndex]}
                  alt={ad.title}
                  className="w-full h-[520px] object-cover rounded-lg"
                />
                
                {ad.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white bg-opacity-80 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white bg-opacity-80 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all"
                    >
                      <ChevronRight size={20} />
                    </button>
                    
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {ad.images.length}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="w-full h-[520px] bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">Fotoğraf Yok</span>
              </div>
            )}

            {/* Thumbnail Images */}
            {ad.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {ad.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                      index === currentImageIndex 
                        ? 'border-blue-500' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <img
                      src={image}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  {ad.featured && (
                    <span className="inline-block bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium mb-2">
                      VİTRİN İLANI
                    </span>
                  )}
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {ad.title}
                  </h1>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {formatPrice(ad.price)}
                  </div>
                </div>

                <button
                  onClick={handleFavoriteClick}
                  className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Heart
                    size={20}
                    className={isFavorite ? 'text-red-500 fill-current' : 'text-gray-500 dark:text-gray-400'}
                  />
                </button>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <MapPin size={16} className="mr-1" />
                  <span>{ad.location.district}, {ad.location.city}</span>
                </div>
                
                <div className="flex items-center">
                  <Clock size={16} className="mr-1" />
                  <span>{formatDate(ad.createdAt)}</span>
                </div>
                
                <div className="flex items-center">
                  <Eye size={16} className="mr-1" />
                  <span>{ad.viewCount} görüntülenme</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Açıklama
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {ad.description}
              </p>
            </div>

            {/* Category */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Kategori
              </h3>
              <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-lg text-sm font-medium">
                {ad.category.name}
              </span>
            </div>

            {/* Seller Info */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Satıcı Bilgileri
              </h3>
              
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <User size={20} className="text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {ad.user.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Üyelik: {formatDate(ad.user.createdAt)}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {!showContactInfo ? (
                  <button
                    onClick={() => setShowContactInfo(true)}
                    className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Phone size={18} />
                    <span>Telefonu Göster</span>
                  </button>
                ) : (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-blue-800 dark:text-blue-200">
                        <Phone size={18} />
                        <span className="font-medium">
                          {ad.user.phone || '+90 5XX XXX XX XX'}
                        </span>
                      </div>
                      {ad.user.phone && (
                        <a href={`tel:${ad.user.phone}`} className="text-blue-600 dark:text-blue-300 text-sm font-medium hover:underline">Ara</a>
                      )}
                    </div>
                    {ad.user.email && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-blue-800 dark:text-blue-200">
                          <MessageCircle size={18} />
                          <span className="font-medium">{ad.user.email}</span>
                        </div>
                        <a href={`mailto:${ad.user.email}`} className="text-blue-600 dark:text-blue-300 text-sm font-medium hover:underline">E‑posta</a>
                      </div>
                    )}
                    {ad.user.phone && (
                      <a
                        href={`https://wa.me/${ad.user.phone.replace(/\D/g,'')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center text-green-700 dark:text-green-300 text-sm font-medium hover:underline"
                      >
                        WhatsApp ile yaz
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdDetailModal;