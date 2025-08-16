import Link from "next/link";
import { NAVIGATION_CONFIG } from "@/config/navigation";

export function Footer() {
  const { siteName, footer } = NAVIGATION_CONFIG;
  return (
    <footer className="border-t bg-background mt-16">
      <div className="container py-10 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        <div>
          <h3 className="font-bold text-xl">{siteName}</h3>
          <p className="text-sm text-muted-foreground mt-2">All things IPOs in one place.</p>
        </div>
        <nav className="col-span-2 grid grid-cols-2 gap-4">
          {footer.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noreferrer" : undefined}
              className="text-sm hover:underline"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {siteName}. All rights reserved.
      </div>
    </footer>
  );
}