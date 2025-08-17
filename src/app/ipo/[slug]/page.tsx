import { notFound } from "next/navigation";
import { apiUtils } from "@/config/api";
import IpoDetailClient from "@/components/ipo-detail-client";
import { generateIpoPageMetadata } from "@/config/seo";

export const revalidate = 14400; // REVALIDATE_PAGES.ipoDetail
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const basicData = await apiUtils.fetchIpoBySlug(slug);
  if (!basicData) return {};
  const detailData = await apiUtils.fetchIpoDetails(slug);
  return generateIpoPageMetadata('ipoDetail', basicData, detailData);
}

export async function generateStaticParams() {
  const slugs = await apiUtils.getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function IpoDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const basicData = await apiUtils.fetchIpoBySlug(slug);
  if (!basicData) notFound();

  const detailData = await apiUtils.fetchIpoDetails(slug);

  return (
    <IpoDetailClient
      basicData={basicData}
      detailData={detailData}
    />
  );
}