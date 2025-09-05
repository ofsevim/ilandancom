// Proxy service to bypass adblockers
class ProxyService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_SUPABASE_URL;
    this.apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders = {
      'apikey': this.apiKey,
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (compatible; ilandan-bot/1.0)',
      'X-Client-Info': 'ilandan-web'
    };

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async updateAd(id: string, data: any) {
    return this.makeRequest(`/rest/v1/ads?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async getAd(id: string) {
    return this.makeRequest(`/rest/v1/ads?id=eq.${id}&select=*`);
  }

  async getAds(filters: any = {}) {
    let query = '/rest/v1/ads?select=*';
    
    if (filters.status) {
      query += `&status=eq.${filters.status}`;
    }
    
    if (filters.category) {
      query += `&category_id=eq.${filters.category}`;
    }
    
    if (filters.city) {
      query += `&city=eq.${filters.city}`;
    }
    
    if (filters.district) {
      query += `&district=eq.${filters.district}`;
    }
    
    if (filters.minPrice !== undefined) {
      query += `&price=gte.${filters.minPrice}`;
    }
    
    if (filters.maxPrice !== undefined) {
      query += `&price=lte.${filters.maxPrice}`;
    }
    
    if (filters.query) {
      query += `&or=(title.ilike.%${filters.query}%,description.ilike.%${filters.query}%)`;
    }
    
    // Sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'newest':
          query += '&order=created_at.desc';
          break;
        case 'oldest':
          query += '&order=created_at.asc';
          break;
        case 'price_low':
          query += '&order=price.asc';
          break;
        case 'price_high':
          query += '&order=price.desc';
          break;
        case 'most_viewed':
          query += '&order=view_count.desc';
          break;
      }
    }

    return this.makeRequest(query);
  }
}

export const proxyService = new ProxyService();
