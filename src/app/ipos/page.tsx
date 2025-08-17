import Link from "next/link";
import { apiUtils } from "@/config/api";
import { SEO_CONFIG } from "@/config/seo";

export const revalidate = 60; // REVALIDATE_PAGES.ipoList
export const metadata = SEO_CONFIG.pages.ipoList;

export default async function IposPage() {
  const ipos = await apiUtils.fetchAllIpos();

  return (
    <main className="container py-10">
      <h1 className="text-3xl font-bold">All IPOs</h1>
      <p className="mt-2 text-muted-foreground">Static page with ISR. Generated at build time and revalidated periodically.</p>

      {ipos.length === 0 ? (
        <p className="mt-6">No IPOs found.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {ipos.map((ipo) => (
            <li key={ipo.slug} className="border rounded-md p-4">
              <div className="font-semibold">{ipo.name}</div>
              <div className="text-sm text-muted-foreground">Slug: {ipo.slug}</div>
              <div className="mt-2 flex flex-wrap gap-3 text-primary underline">
                <Link href={`/ipo/${ipo.slug}/`}>Details</Link>
                <Link href={`/ipo/${ipo.slug}/allotment-status/`}>Allotment Status</Link>
                <Link href={`/ipo/${ipo.slug}/subscription-status/`}>Subscription Status</Link>
                <Link href={`/ipo/${ipo.slug}/gmp/`}>GMP</Link>
                <Link href={`/ipo/${ipo.slug}/review/`}>Review</Link>
                <Link href={`/ipo/${ipo.slug}/faq/`}>FAQ</Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}