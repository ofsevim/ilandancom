import { useEffect, useState } from 'react';
import { locationService } from '../services/api';

export const useDistricts = (cityId?: string) => {
  const [districts, setDistricts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      if (!cityId) {
        setDistricts([]);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const data = await locationService.getDistrictsByCity(cityId);
        setDistricts(data);
      } catch (err: any) {
        setError(err.message || 'İlçeler yüklenirken hata oluştu');
        setDistricts([]);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [cityId]);

  return { districts, loading, error };
};
