import Link from "next/link";
import { notFound } from "next/navigation";
import { apiUtils } from "@/config/api";

export const revalidate = 60; // ISR
export const dynamicParams = false; // Only allow known slugs, others 404

export async function generateStaticParams() {
  const slugs = await apiUtils.getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function IpoDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await apiUtils.fetchIpoBySlug(slug);
  if (!data) {
    notFound();
  }

  return (
    <main className="container py-10">
      <h1 className="text-3xl font-bold">IPO Details Page</h1>
      <p className="mt-2 text-muted-foreground">Showing dummy details for slug: {slug}</p>

      <nav className="mt-6 flex flex-wrap gap-3 text-primary underline">
        <Link href={`/ipo/${slug}/allotment-status/`}>Allotment Status</Link>
        <Link href={`/ipo/${slug}/subscription-status/`}>Subscription Status</Link>
        <Link href={`/ipo/${slug}/gmp/`}>GMP</Link>
        <Link href={`/ipo/${slug}/review/`}>Review</Link>
        <Link href={`/ipo/${slug}/faq/`}>FAQ</Link>
      </nav>
    </main>
  );
}