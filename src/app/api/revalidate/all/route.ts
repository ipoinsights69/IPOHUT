import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { apiUtils } from '@/config/api';

function normalizePath(p: string): string {
  if (!p) return '/';
  return p.startsWith('/') ? p : `/${p}`;
}

function isAuthorized(secretFromRequest: string | null): boolean {
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected) return false;
  return secretFromRequest === expected;
}

async function collectAllStaticPaths(): Promise<string[]> {
  const staticPaths: string[] = ['/', '/ipos'];

  // Fetch all IPO slugs to generate detail and sub-pages
  const slugs = await apiUtils.getAllSlugs();
  const subRoutes = ['', '/allotment-status', '/faq', '/gmp', '/review', '/subscription-status'];

  for (const slug of slugs) {
    for (const sub of subRoutes) {
      staticPaths.push(normalizePath(`/ipo/${slug}${sub}`));
    }
  }

  // Dedupe and return
  return Array.from(new Set(staticPaths));
}

async function revalidateAll(type: 'page' | 'layout'): Promise<{ count: number; paths: string[] }> {
  const paths = await collectAllStaticPaths();
  for (const p of paths) {
    revalidatePath(p, type);
  }
  return { count: paths.length, paths };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const secret = url.searchParams.get('secret');
  if (!isAuthorized(secret)) {
    return NextResponse.json({ message: 'Invalid or missing secret' }, { status: 401 });
    }

  const typeParam = url.searchParams.get('type');
  const type: 'page' | 'layout' = typeParam === 'layout' ? 'layout' : 'page';

  try {
    const result = await revalidateAll(type);
    return NextResponse.json({ revalidated: true, mode: 'all', ...result, type });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ revalidated: false, error: errorMessage }, { status: 500 });
  }
}

interface RevalidateAllBody {
  secret?: string;
  type?: string;
}

export async function POST(req: Request) {
  try {
    const body: RevalidateAllBody = await req.json().catch(() => ({}));
    const { secret, type: rawType } = body || {};

    if (!isAuthorized(secret ?? null)) {
      return NextResponse.json({ message: 'Invalid or missing secret' }, { status: 401 });
    }

    const type: 'page' | 'layout' = rawType === 'layout' ? 'layout' : 'page';

    const result = await revalidateAll(type);
    return NextResponse.json({ revalidated: true, mode: 'all', ...result, type });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ revalidated: false, error: errorMessage }, { status: 500 });
  }
}