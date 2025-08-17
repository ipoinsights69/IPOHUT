export const API_CONFIG = {
  // baseUrl: 'http://159.65.104.132:1234',
  baseUrl: 'http://127.0.0.1:1234',

  endpoints: {
    // IPO endpoints
    allIpos: '/api/ipo/all',
    upcoming: '/api/ipo/upcoming',
    closed: '/api/ipo/closed',
    search: '/api/ipo/search',
    getIpoDetails: (slug: string) => `/api/ipo/details/${slug}`,
    getIpoStatistics: '/api/ipo/statistics',
  }
} as const;

export interface IpoData {
  html_path: string;
  json_path: string;
  name: string;
  slug: string;
  status: string;
  url: string;
  year: number;
  ipo_details?: Array<Record<string, string>>;
  timeline?: Array<[string, string]>;
}

export interface IpoDetailData {
  about_company: {
    description: string;
    competitive_strengths: string[];
  };
  company_name: string;
  EPS: Array<Record<string, string>>;
  KPI: Array<{KPI: string; Values: string}>;
  ipo_details: Array<Record<string, string>>;
  ipo_price: Array<Record<string, string>>;
  lots: Array<Record<string, string>>;
  objectives: Array<Record<string, string>>;
  promoters: string;
  promoters_holdings: Array<[string, string]>;
  prospectus_links: Array<{href: string; text: string; title: string}>;
  reservation: Array<Record<string, string>>;
  review: Array<Record<string, string>>;
  status: string;
  timeline: Array<[string, string]>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface IpoStatistics {
  by_status: {
    Open: {
      count: number;
      ipos: IpoData[] | null;
    };
    Upcoming: {
      count: number;
      ipos: IpoData[] | null;
    };
    Closed: {
      count: number;
      ipos: IpoData[] | null;
    };
    Unknown?: {
      count: number;
      ipos: IpoData[] | null;
    };
  };
  by_year: Record<string, {
    count: number;
    ipos: IpoData[] | null;
  }>;
  by_industry?: Record<string, number>;
  by_listing_type?: Record<string, number>;
}

// API utility functions
export const apiUtils = {
  async fetchAllIpos(): Promise<IpoData[]> {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.allIpos}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching IPOs:', error);
      return [];
    }
  },
  
  async fetchIpoStatistics(includeDetails: boolean = true, limit: number = 10): Promise<IpoStatistics | null> {
    try {
      const url = new URL(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.getIpoStatistics}`);
      url.searchParams.append('include_details', includeDetails.toString());
      url.searchParams.append('limit', limit.toString());
      
      const response = await fetch(url.toString());
      console.log(response)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching IPO statistics:', error);
      return null;
    }
  },

  async fetchIpoBySlug(slug: string): Promise<IpoData | null> {
    try {
      const allIpos = await this.fetchAllIpos();
      return allIpos.find(ipo => ipo.slug === slug) || null;
    } catch (error) {
      console.error(`Error fetching IPO with slug ${slug}:`, error);
      return null;
    }
  },
  
  async fetchIpoDetails(slug: string): Promise<IpoDetailData | null> {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.getIpoDetails(slug)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching IPO details with slug ${slug}:`, error);
      return null;
    }
  },

  async getAllSlugs(): Promise<string[]> {
    try {
      const allIpos = await this.fetchAllIpos();
      return allIpos.map(ipo => ipo.slug);
    } catch (error) {
      console.error('Error fetching slugs:', error);
      return [];
    }
  }
};