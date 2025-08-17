import { HomePageClient } from "@/components/homepage-client";
import { apiUtils } from "@/config/api";

// Server Component: ISR-enabled homepage
export const revalidate = 14400;

export default async function HomePage() {
  const [statisticsData, listingGainsData, lowestGainsData] = await Promise.all([
    apiUtils.fetchIpoStatistics(true, 20),
    apiUtils.fetchListingGains(6, "gain_desc"),
    apiUtils.fetchListingGains(6, "gain_asc"),
  ]);

  return (
    <HomePageClient
      ipoData={statisticsData}
      listingGainsData={listingGainsData}
      lowestGainsData={lowestGainsData}
    />
  );
}
