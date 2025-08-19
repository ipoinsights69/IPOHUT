import { HomePageClient } from "@/components/homepage-client";
import { apiUtils } from "@/config/api";
import { SEO_CONFIG } from "@/config/seo";

// Server Component: ISR-enabled homepage
export const revalidate = 14400; // REVALIDATE_PAGES.homepage (4 hours)
export const metadata = SEO_CONFIG.pages.homepage;

export default async function HomePage() {
  const [statisticsData, listingGainsData, lowestGainsData, recentlyListedData, gmpData] = await Promise.all([
    apiUtils.fetchIpoStatistics(true, 20),
    apiUtils.fetchListingGains(6, "gain_desc"),
    apiUtils.fetchListingGains(6, "gain_asc"),
    apiUtils.fetchRecentlyListed(8),
    apiUtils.fetchGmp(30),
  ]);

  return (
    <HomePageClient
      ipoData={statisticsData}
      listingGainsData={listingGainsData}
      lowestGainsData={lowestGainsData}
      recentlyListedData={recentlyListedData}
      gmpData={gmpData}
    />
  );
}
