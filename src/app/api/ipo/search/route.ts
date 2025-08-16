import { NextRequest, NextResponse } from "next/server";
import { API_CONFIG, type IpoData } from "@/config/api";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query")?.trim() || "";

  if (!query) {
    return NextResponse.json<IpoData[]>([], { status: 200 });
  }

  try {
    const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.search}?query=${encodeURIComponent(query)}`;
    const res = await fetch(url, { next: { revalidate: 0 } });

    if (!res.ok) {
      return NextResponse.json({ error: `Upstream error ${res.status}` }, { status: 502 });
    }

    const data = (await res.json()) as IpoData[];
    return NextResponse.json(data, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Search failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}