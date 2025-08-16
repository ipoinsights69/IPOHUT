"use client";

import * as React from "react";
import Link from "next/link";
import { type IpoData } from "@/config/api";

export function SearchBox() {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<IpoData[] | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const abortRef = React.useRef<AbortController | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  React.useEffect(() => {
    if (query.trim().length < 2) {
      setResults(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setOpen(true);

    // Debounce
    const t = setTimeout(async () => {
      try {
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        const res = await fetch(`/api/ipo/search?query=${encodeURIComponent(query)}` , {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as IpoData[];
        setResults(data);
      } catch (err: unknown) {
        const isAbort =
          err instanceof DOMException
            ? err.name === "AbortError"
            : typeof err === "object" &&
              err !== null &&
              "name" in err &&
              typeof (err as Record<string, unknown>).name === "string" &&
              (err as Record<string, unknown>).name === "AbortError";
        if (!isAbort) {
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(t);
  }, [query]);

  return (
    <div ref={containerRef} className="relative w-full max-w-xs">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => {
          if ((results && results.length > 0) || loading) setOpen(true);
        }}
        placeholder="Search IPOs..."
        className="w-full rounded-md border bg-background px-3 py-2 text-sm shadow-sm focus-visible:ring-4 focus-visible:outline-1"
      />
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow">
          <div className="max-h-72 overflow-auto p-1">
            {loading ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">Searching…</div>
            ) : results && results.length > 0 ? (
              <ul className="divide-y">
                {results.map((ipo) => (
                  <li key={ipo.slug}>
                    <Link
                      href={`/ipo/${ipo.slug}`}
                      className="flex items-center justify-between gap-3 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                      onClick={() => setOpen(false)}
                    >
                      <span className="truncate">{ipo.name}</span>
                      <span className="shrink-0 rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                        {ipo.status}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-3 py-2 text-sm text-muted-foreground">No results</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}