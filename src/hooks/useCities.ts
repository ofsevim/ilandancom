import { useEffect, useState } from 'react';
import { locationService } from '../services/api';

export const useCities = () => {
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCities = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await locationService.getCities();
      setCities(data);
    } catch (err: any) {
      setError(err.message || 'Şehirler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  return { cities, loading, error, refresh: fetchCities };
};
