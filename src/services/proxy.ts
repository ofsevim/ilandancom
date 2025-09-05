// Proxy service to bypass adblockers
class ProxyService {
  private baseUrl: string;
  private apiKey: string;
  private maskedUrls: string[];

  constructor() {
    this.baseUrl = import.meta.env.VITE_SUPABASE_URL;
    this.apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    // Masked URLs to bypass AdBlock
    this.maskedUrls = [
      this.baseUrl,
      this.baseUrl.replace('supabase.co', 'supabase.io'),
      this.baseUrl.replace('rest/v1', 'api/v1'),
      this.baseUrl.replace('rest/v1', 'graphql/v1')
    ];
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}, attempt: number = 0): Promise<any> {
    const baseUrl = this.maskedUrls[attempt % this.maskedUrls.length];
    const url = `${baseUrl}${endpoint}`;
    
    // Randomize headers to avoid detection
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
      'Mozilla/5.0 (compatible; ilandan-bot/1.0)'
    ];
    
    const defaultHeaders = {
      'apikey': this.apiKey,
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)],
      'X-Client-Info': 'ilandan-web',
      'X-Requested-With': 'XMLHttpRequest',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers
        },
        mode: 'cors',
        credentials: 'omit'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error: any) {
      // If blocked, try next URL
      if (error.message?.includes('ERR_BLOCKED_BY_CLIENT') && attempt < this.maskedUrls.length - 1) {
        console.log(`Attempt ${attempt + 1} blocked, trying next URL...`);
        return this.makeRequest(endpoint, options, attempt + 1);
      }
      throw error;
    }
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
