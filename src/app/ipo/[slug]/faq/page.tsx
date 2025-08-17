import { notFound } from "next/navigation";
import { apiUtils } from "@/config/api";
import { generateIpoPageMetadata } from "@/config/seo";

export const revalidate = 14400; // REVALIDATE_PAGES.ipoSubPages
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const basicData = await apiUtils.fetchIpoBySlug(slug);
  if (!basicData) return {};
  const detailData = await apiUtils.fetchIpoDetails(slug);
  return generateIpoPageMetadata('faq', basicData, detailData);
}

export async function generateStaticParams() {
  const slugs = await apiUtils.getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function FaqPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await apiUtils.fetchIpoBySlug(slug);
  if (!data) notFound();

  return (
    <main className="container py-10">
      <h1 className="text-3xl font-bold">FAQ Page</h1>
      <p className="mt-2 text-muted-foreground">Dummy page for slug: {slug}</p>
    </main>
  );
}