import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

function normalizePath(p: string): string {
  if (!p) return '/';
  return p.startsWith('/') ? p : `/${p}`;
}

function parseCommaSeparated(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map(normalizePath);
}

function parsePathsFromSearchParams(sp: URLSearchParams): string[] {
  // Support multiple ?path=/a&path=/b and/or comma-separated ?path=/a,/b and ?paths=/a,/b
  const multiPathParams = sp.getAll('path');
  const collected: string[] = [];

  for (const p of multiPathParams) {
    collected.push(...parseCommaSeparated(p));
  }

  if (sp.has('paths')) {
    collected.push(...parseCommaSeparated(sp.get('paths')));
  }

  // Dedupe
  return Array.from(new Set(collected));
}

function parsePathsFromBody(body: any): string[] {
  if (!body) return [];
  const collected: string[] = [];

  if (Array.isArray(body.paths)) {
    collected.push(...body.paths.map((p: string) => normalizePath(String(p))));
  }

  if (typeof body.path === 'string') {
    collected.push(...parseCommaSeparated(body.path));
  }

  if (typeof body.paths === 'string') {
    collected.push(...parseCommaSeparated(body.paths));
  }

  // Dedupe
  return Array.from(new Set(collected));
}

function isAuthorized(secretFromRequest: string | null): boolean {
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected) return false;
  return secretFromRequest === expected;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sp = url.searchParams;

  const secret = sp.get('secret');
  if (!isAuthorized(secret)) {
    return NextResponse.json({ message: 'Invalid or missing secret' }, { status: 401 });
  }

  const tag = sp.get('tag');
  const typeParam = sp.get('type');
  const type = typeParam === 'layout' ? 'layout' : 'page';

  try {
    if (tag) {
      revalidateTag(tag);
      return NextResponse.json({ revalidated: true, mode: 'tag', tag });
    }

    const paths = parsePathsFromSearchParams(sp);
    if (!paths.length) {
      return NextResponse.json(
        { revalidated: false, message: 'Provide at least one path via `path` or `paths`, or a `tag`' },
        { status: 400 }
      );
    }

    for (const p of paths) {
      revalidatePath(p, type as 'page' | 'layout');
    }

    return NextResponse.json({ revalidated: true, mode: 'path', paths, type });
  } catch (err: any) {
    return NextResponse.json({ revalidated: false, error: err?.message || 'Unknown error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { secret, tag, type: rawType } = body || {};

    if (!isAuthorized(secret)) {
      return NextResponse.json({ message: 'Invalid or missing secret' }, { status: 401 });
    }

    const type: 'page' | 'layout' = rawType === 'layout' ? 'layout' : 'page';

    if (typeof tag === 'string' && tag) {
      revalidateTag(tag);
      return NextResponse.json({ revalidated: true, mode: 'tag', tag });
    }

    const paths = parsePathsFromBody(body);
    if (!paths.length) {
      return NextResponse.json(
        { revalidated: false, message: 'Provide at least one `path`/`paths` or a `tag`' },
        { status: 400 }
      );
    }

    for (const p of paths) {
      revalidatePath(p, type);
    }

    return NextResponse.json({ revalidated: true, mode: 'path', paths, type });
  } catch (err: any) {
    return NextResponse.json({ revalidated: false, error: err?.message || 'Unknown error' }, { status: 500 });
  }
}