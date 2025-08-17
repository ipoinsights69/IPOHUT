import type { Metadata } from 'next';
import { IpoData, IpoDetailData } from './api';

/**
 * SEO Configuration
 * 
 * Configure metadata for all pages including tiPritles, descriptions, keywords, and Open Graph data.
 * 
 * Available variables for dynamic pages:
 * - For IPO pages: {ipoName}, {status}, {priceRange}, {openDate}, {closeDate}, {issueSize}
 * - For detail pages: {lotSize}, {faceValue}, {listingDate}
 * 
 * Usage:
 * import { SEO_CONFIG, generateIpoPageMetadata } from '@/config/seo';
 * export const metadata = SEO_CONFIG.pages.homepage;
 */

// Base SEO configuration (removed if unused to avoid lint warning)
// interface BaseSeoConfig {
//   title: string;
//   description: string;
//   keywords: string[];
//   openGraph?: {
//     title?: string;
//     description?: string;
//     type?: string;
//     images?: string[];
//   };
//   twitter?: {
//     card?: 'summary' | 'summary_large_image';
//     title?: string;
//     description?: string;
//     images?: string[];
//   };
// }

// Site-wide defaults
const SITE_CONFIG = {
  name: 'IPO Hut',
  domain: 'ipohut.com',
  description: 'Complete IPO tracking platform with real-time GMP, allotment checker, and expert analysis',
  keywords: ['IPO', 'Initial Public Offering', 'GMP', 'Grey Market Premium', 'Allotment', 'Stock Market', 'Investment'],
  author: 'IPO Hut Team',
  twitterHandle: '@ipohut',
  defaultImage: '/og-image.jpg', // You'll need to create this
} as const;

// Default/fallback metadata
export const SEO_CONFIG = {
  // Default/fallback metadata
  default: {
    title: `${SITE_CONFIG.name} - IPO Tracking & Analysis Platform`,
    description: SITE_CONFIG.description,
    keywords: [...SITE_CONFIG.keywords],
    openGraph: {
      type: 'website',
      title: `${SITE_CONFIG.name} - IPO Tracking Platform`,
      description: SITE_CONFIG.description,
      images: [SITE_CONFIG.defaultImage],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: `${SITE_CONFIG.name} - IPO Tracking Platform`,
      description: SITE_CONFIG.description,
      images: [SITE_CONFIG.defaultImage],
    },
  },

  // Static pages
  pages: {
    homepage: {
      title: `${SITE_CONFIG.name} - Live IPO Tracking, GMP & Allotment Status`,
      description: 'Track live IPOs with real-time GMP updates, check allotment status, and get expert analysis. Complete IPO calendar and investment insights.',
      keywords: [
        ...SITE_CONFIG.keywords,
        'Live IPO Tracking',
        'IPO Calendar',
        'Investment Analysis',
        'Real-time Data',
        'Stock Market India'
      ],
      openGraph: {
        type: 'website',
        title: `${SITE_CONFIG.name} - Live IPO Tracking & Analysis`,
        description: 'India\'s most comprehensive IPO tracking platform with live GMP, allotment checker, and expert insights.',
        images: [SITE_CONFIG.defaultImage],
      },
      twitter: {
        card: 'summary_large_image' as const,
        title: `${SITE_CONFIG.name} - Live IPO Tracking`,
        description: 'Track IPOs with real-time GMP, allotment status & expert analysis',
        images: [SITE_CONFIG.defaultImage],
      },
    } satisfies Metadata,

    ipoList: {
      title: `All IPOs - Current & Upcoming | ${SITE_CONFIG.name}`,
      description: 'Browse all current and upcoming IPOs. Filter by status, check price bands, issue sizes, and important dates. Complete IPO database.',
      keywords: [
        ...SITE_CONFIG.keywords,
        'IPO List',
        'Upcoming IPOs',
        'Current IPOs',
        'IPO Database',
        'Price Bands'
      ],
      openGraph: {
        type: 'website',
        title: `All IPOs - Current & Upcoming | ${SITE_CONFIG.name}`,
        description: 'Complete database of current and upcoming IPOs with detailed information and analysis.',
        images: [SITE_CONFIG.defaultImage],
      },
      twitter: {
        card: 'summary_large_image' as const,
        title: `All IPOs | ${SITE_CONFIG.name}`,
        description: 'Browse current & upcoming IPOs with detailed analysis',
        images: [SITE_CONFIG.defaultImage],
      },
    } satisfies Metadata,
  },

  // Dynamic page templates
  templates: {
    ipoDetail: {
      title: '{ipoName} - Price, Dates, GMP & Analysis | {siteName}',
      description: '{ipoName} IPO details: Price band {priceRange}, Open {openDate} to {closeDate}. Live GMP tracking, allotment status, and expert review.',
      keywords: [
        '{ipoName} IPO',
        '{ipoName} GMP',
        '{ipoName} Allotment',
        'IPO Analysis',
        'IPO Review',
        'Stock Market'
      ],
    },
    
    allotmentStatus: {
      title: '{ipoName} Allotment Status - Check IPO Allotment | {siteName}',
      description: 'Check {ipoName} IPO allotment status. Instant verification with PAN number. Get allotment results and next steps.',
      keywords: [
        '{ipoName} Allotment Status',
        '{ipoName} Allotment Check',
        'IPO Allotment',
        'Allotment Results'
      ],
    },
    
    gmp: {
      title: '{ipoName} GMP (Grey Market Premium) - Live Tracking | {siteName}',
      description: 'Live {ipoName} GMP tracking. Current grey market premium, historical trends, and listing price predictions.',
      keywords: [
        '{ipoName} GMP',
        '{ipoName} Grey Market Premium',
        'GMP Tracking',
        'IPO Premium'
      ],
    },
    
    subscriptionStatus: {
      title: '{ipoName} Subscription Status - Live Bidding Data | {siteName}',
      description: 'Real-time {ipoName} subscription status. Live bidding data, oversubscription ratios, and category-wise analysis.',
      keywords: [
        '{ipoName} Subscription',
        '{ipoName} Bidding Status',
        'IPO Subscription',
        'Oversubscription'
      ],
    },
    
    review: {
      title: '{ipoName} IPO Review & Analysis - Expert Opinion | {siteName}',
      description: 'Expert {ipoName} IPO review and analysis. Investment recommendation, company fundamentals, and risk assessment.',
      keywords: [
        '{ipoName} Review',
        '{ipoName} Analysis',
        'IPO Review',
        'Investment Analysis'
      ],
    },
    
    faq: {
      title: '{ipoName} IPO FAQ - Common Questions & Answers | {siteName}',
      description: 'Frequently asked questions about {ipoName} IPO. Get answers about application process, allotment, and listing.',
      keywords: [
        '{ipoName} FAQ',
        '{ipoName} Questions',
        'IPO FAQ',
        'IPO Help'
      ],
    },
  },
} // removed "as const"

// Helper function to generate metadata for IPO pages
export function generateIpoPageMetadata(
  pageType: keyof typeof SEO_CONFIG.templates,
  ipoData: IpoData,
  detailData?: IpoDetailData | null
): Metadata {
  const template = SEO_CONFIG.templates[pageType];
  
  // Extract IPO information for replacements
  const ipoInfo = extractIpoInfo(ipoData, detailData);
  
  // Replace template variables
  const title = replaceTemplateVars(template.title, ipoInfo);
  const description = replaceTemplateVars(template.description, ipoInfo);
  const keywords = template.keywords.map(k => replaceTemplateVars(k, ipoInfo));
  
  return {
    title,
    description,
    keywords: keywords.join(', '),
    openGraph: {
      type: 'article',
      title,
      description,
      images: [SITE_CONFIG.defaultImage],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [SITE_CONFIG.defaultImage],
    },
  };
}

// Helper function to extract IPO information
function extractIpoInfo(ipoData: IpoData, detailData?: IpoDetailData | null) {
  // Extract price range from ipo_details
  const priceDetail = ipoData.ipo_details?.find(([key]) => 
    key.toLowerCase().includes('price') || key.toLowerCase().includes('band')
  );
  const priceRange = priceDetail?.[1] || 'TBA';
  
  // Extract dates from timeline
  const openDateDetail = ipoData.timeline?.find(([key]) => 
    key.toLowerCase().includes('open') || key.toLowerCase().includes('start')
  );
  const closeDateDetail = ipoData.timeline?.find(([key]) => 
    key.toLowerCase().includes('close') || key.toLowerCase().includes('end')
  );
  
  const openDate = openDateDetail?.[1] || 'TBA';
  const closeDate = closeDateDetail?.[1] || 'TBA';
  
  // Extract issue size
  const issueSizeDetail = ipoData.ipo_details?.find(([key]) => 
    key.toLowerCase().includes('size') || key.toLowerCase().includes('amount')
  );
  const issueSize = issueSizeDetail?.[1] || 'TBA';
  
  // Extract lot size and face value from detail data
  const lotSize = detailData?.ipo_price?.find(([key]) => 
    key.toLowerCase().includes('lot')
  )?.[1] || 'TBA';
  
  const faceValue = detailData?.ipo_price?.find(([key]) => 
    key.toLowerCase().includes('face')
  )?.[1] || 'TBA';
  
  // Extract listing date
  const listingDateDetail = ipoData.timeline?.find(([key]) => 
    key.toLowerCase().includes('listing')
  );
  const listingDate = listingDateDetail?.[1] || 'TBA';
  
  return {
    ipoName: ipoData.name,
    siteName: SITE_CONFIG.name,
    status: ipoData.status,
    priceRange,
    openDate,
    closeDate,
    issueSize,
    lotSize,
    faceValue,
    listingDate,
  };
}

// Helper function to replace template variables
function replaceTemplateVars(template: string, vars: Record<string, string>): string {
  let result = template;
  
  Object.entries(vars).forEach(([key, value]) => {
    const placeholder = `{${key}}`;
    result = result.replace(new RegExp(placeholder, 'g'), value);
  });
  
  return result;
}

// Export types
export type SeoPageKey = keyof typeof SEO_CONFIG.pages;
export type SeoTemplateKey = keyof typeof SEO_CONFIG.templates;

// Export constants
export { SITE_CONFIG };