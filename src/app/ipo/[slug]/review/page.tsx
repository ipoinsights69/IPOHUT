import { notFound } from "next/navigation";
import { apiUtils } from "@/config/api";

export const revalidate = 60;
export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await apiUtils.getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function ReviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await apiUtils.fetchIpoBySlug(slug);
  if (!data) notFound();

  return (
    <main className="container py-10">
      <h1 className="text-3xl font-bold">Review Page</h1>
      <p className="mt-2 text-muted-foreground">Dummy page for slug: {slug}</p>
    </main>
  );
}