export interface RevalidatePagesConfig {
  homepage: number;
  ipoList: number;
  ipoDetail: number;
  ipoSubPages: number;
}

export interface RevalidateApiConfig {
  search: number;
  statistics: number;
  listingGains: number;
}

export interface RevalidateSpecialConfig {
  static: number;
  content: number;
  admin: number;
}

export interface RevalidatePeriodsConfig {
  REALTIME: number;
  THIRTY_SECONDS: number;
  ONE_MINUTE: number;
  TWO_MINUTES: number;
  FIVE_MINUTES: number;
  TEN_MINUTES: number;
  THIRTY_MINUTES: number;
  ONE_HOUR: number;
  SIX_HOURS: number;
  TWELVE_HOURS: number;
  ONE_DAY: number;
  ONE_WEEK: number;
}

export interface RevalidateConfigShape {
  pages: RevalidatePagesConfig;
  api: RevalidateApiConfig;
  special: RevalidateSpecialConfig;
  periods: RevalidatePeriodsConfig;
  getRevalidateTime: (page: keyof RevalidatePagesConfig, environment?: string) => number;
}

export const REVALIDATE_CONFIG: RevalidateConfigShape = {
  pages: {
    homepage: 14400,
    ipoList: 60,
    ipoDetail: 60,
    ipoSubPages: 120,
  },
  api: {
    search: 30,
    statistics: 300,
    listingGains: 120,
  },
  special: {
    static: 86400,
    content: 3600,
    admin: 0,
  },
  periods: {
    REALTIME: 0,
    THIRTY_SECONDS: 30,
    ONE_MINUTE: 60,
    TWO_MINUTES: 120,
    FIVE_MINUTES: 300,
    TEN_MINUTES: 600,
    THIRTY_MINUTES: 1800,
    ONE_HOUR: 3600,
    SIX_HOURS: 21600,
    TWELVE_HOURS: 43200,
    ONE_DAY: 86400,
    ONE_WEEK: 604800,
  },
  getRevalidateTime: (page: keyof RevalidatePagesConfig, environment?: string) => {
    const baseTime = REVALIDATE_PAGES[page];
    if (environment === 'development') {
      return Math.min(baseTime, 60);
    }
    return baseTime;
  },
};

export type RevalidatePageKey = keyof RevalidatePagesConfig;
export type RevalidateApiKey = keyof RevalidateApiConfig;
export type RevalidateSpecialKey = keyof RevalidateSpecialConfig;

export const REVALIDATE_PAGES = REVALIDATE_CONFIG.pages;
export const REVALIDATE_API = REVALIDATE_CONFIG.api;
export const REVALIDATE_SPECIAL = REVALIDATE_CONFIG.special;
export const REVALIDATE_PERIODS = REVALIDATE_CONFIG.periods;