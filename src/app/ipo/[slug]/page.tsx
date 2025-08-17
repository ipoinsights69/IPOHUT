import { notFound } from "next/navigation";
import { apiUtils } from "@/config/api";
import IpoDetailClient from "@/components/ipo-detail-client";

export const revalidate = 60;
export const dynamicParams = false;

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