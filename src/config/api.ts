export const API_CONFIG = {
  baseUrl: 'http://159.65.104.132:1234',
  // baseUrl: 'http://127.0.0.1:1234',

  endpoints: {
    // IPO endpoints
    allIpos: '/api/ipo/all',
    upcoming: '/api/ipo/upcoming',
    closed: '/api/ipo/closed',
    search: '/api/ipo/search',
    getIpoDetails: (slug: string) => `/api/ipo/details/${slug}`,
    getIpoStatistics: '/api/ipo/statistics',
    listingGains: '/api/ipo/listing-gains',
    recentlyListed: '/api/ipo/recently-listed',
    gmp: '/api/ipo/gmp',
    getMarketData: '/api/ipo/get_market_data',
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
  ipo_details?: Array<[string, string]>;
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
  ipo_details: Array<[string, string]>;
  ipo_price: Array<[string, string]>;
  lots: Array<Record<string, string>>;
  objectives: Array<Record<string, string>>;
  promoters: string;
  promoters_holdings: Array<[string, string]>;
  prospectus_links: Array<{href: string; text: string; title: string}>;
  reservation: Array<Record<string, string>>;
  review: Array<Record<string, string>>;
  status: string;
  timeline: Array<[string, string]>;
  listing_details?: Array<[string, string]>;
  listing_gain_percent?: string;
  recommendation?: {
    confidence: "LOW" | "MEDIUM" | "HIGH";
    details: {
      broker_score: number;
      brokers: {
        avoid: number;
        neutral: number;
        subscribe: number;
      };
      member_score: number;
      members: {
        avoid: number;
        neutral: number;
        subscribe: number;
      };
      total_reviews: number;
    };
    reason: string;
    recommendation: "AVOID" | "NEUTRAL" | "SUBSCRIBE";
    score: number;
  };
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

export interface IpoListingGain {
  name: string;
  slug: string;
  status: string;
  listing_gain_percent: string;
  ipo_date: string;
  issue_size: string | null;
  listing_at: string;
  listing_date: string;
  listing_trading: {
    "Final Issue Price": string;
    "High": string;
    "Last Trade": string;
    "Low": string;
    "Open": string;
  };
  year: number;
}

export interface ListingGainsResponse {
  filters: {
    limit: number;
    status: string | null;
    year: number | null;
  };
  ipos: IpoListingGain[];
  sort_by: string;
  total_count: number;
}

// Market data types
export type TimeframeKey = '1D' | '7D' | '15D' | '1M' | '3M' | '6M' | '1Y' | '2Y';

export interface Candle {
  close: number;
  high: number;
  low: number;
  open: number;
  time: string; // ISO timestamp
  volume: number;
}

export interface MarketSeries {
  daily_candles: Candle[];
}

export type MarketDataPayload = Partial<Record<TimeframeKey, MarketSeries>>;

export interface MarketDataResponse {
  data: MarketDataPayload;
  last_updated?: string;
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
  },

  async fetchListingGains(limit: number = 6, sortBy: string = 'gain_desc'): Promise<ListingGainsResponse | null> {
    try {
      const url = new URL(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.listingGains}`);
      url.searchParams.append('limit', limit.toString());
      url.searchParams.append('sort_by', sortBy);
      
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching listing gains:', error);
      return null;
    }
  },
  
  async fetchRecentlyListed(limit: number = 8): Promise<RecentlyListedResponse | null> {
    try {
      const url = new URL(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.recentlyListed}`);
      url.searchParams.append('limit', limit.toString());
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching recently listed IPOs:', error);
      return null;
    }
  },

  async fetchGmp(limit: number = 20): Promise<GmpResponse | null> {
    try {
      const url = new URL(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.gmp}`);
      url.searchParams.append('limit', limit.toString());
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data as GmpResponse;
    } catch (error) {
      console.error('Error fetching IPO GMP data:', error);
      return null;
    }
  },

  async fetchMarketData(isin: string, timeframes: TimeframeKey[] = ['7D']): Promise<MarketDataResponse | null> {
    try {
      const url = new URL(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.getMarketData}`);
      url.searchParams.append('isin', isin);
      if (timeframes && timeframes.length > 0) {
        url.searchParams.append('timeframes', timeframes.join(','));
      }
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data as MarketDataResponse;
    } catch (error) {
      console.error('Error fetching IPO market data:', error);
      return null;
    }
  }
};

export interface RecentlyListedIpo {
  name: string;
  slug: string;
  issue_price: string;
  listing_price: string;
  listing_date: string;
  exchange: string;
}

export interface RecentlyListedResponse {
  ipos: RecentlyListedIpo[];
  total_count?: number;
}

export interface GmpItem {
  basis_of_allotment_date: string;
  closing_date: string;
  display_order: number;
  gmp_percentage: string; // e.g. "0.00%"
  gmp_price: string; // may be empty or a number as string
  ipo_category: string; // e.g. "SME"
  ipo_id: string;
  ipo_price: string; // may be empty or like "142"
  ipo_size: string; // e.g. "₹66.51 Cr" or "0.40 Cr Shares"
  last_updated: string; // e.g. "18-Aug 5:55"
  listing_date: string;
  lot_size: string;
  market_interest: string; // e.g. "Moderate Demand"
  name: string; // e.g. "Shivashrit Foods SME"
  opening_date: string;
  pe_ratio: string;
  slug: string; // e.g. "shivashrit-foods-ipo"
  subscription: string;
}

export interface GmpResponse {
  data: GmpItem[];
  total_count?: number;
}