export const API_CONFIG = {
  baseUrl: 'http://159.65.104.132:1234',
  endpoints: {
    // IPO endpoints
    allIpos: '/api/ipo/all',
    upcoming: '/api/ipo/upcoming',
    closed: '/api/ipo/closed',
    search: '/api/ipo/search',
    getIpoBySlug: (slug: string) => `/api/ipo/${slug}`,
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
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
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

  async fetchIpoBySlug(slug: string): Promise<IpoData | null> {
    try {
      const allIpos = await this.fetchAllIpos();
      return allIpos.find(ipo => ipo.slug === slug) || null;
    } catch (error) {
      console.error(`Error fetching IPO with slug ${slug}:`, error);
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