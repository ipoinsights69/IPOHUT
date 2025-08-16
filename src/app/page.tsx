"use client";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="container py-10">
      <h1 className="text-3xl font-bold">IPOHut</h1>
      <p className="mt-4 text-muted-foreground">This is a dummy homepage. Use the routes below to navigate:</p>
      <ul className="list-disc pl-5 mt-4 space-y-2">
        <li>
          All IPOs List: <Link href="/ipos" className="text-primary underline">/ipos</Link>
        </li>
        <li>
          IPO Details Page (example): <Link href="/ipo/lgt-business-connextions-ltd-ipo" className="text-primary underline">/ipo/lgt-business-connextions-ltd-ipo</Link>
        </li>
        <li>
          Allotment Checker (example): <Link href="/ipo/lgt-business-connextions-ltd-ipo/allotment-status" className="text-primary underline">/ipo/lgt-business-connextions-ltd-ipo/allotment-status</Link>
        </li>
        <li>
          Subscription Status (example): <Link href="/ipo/lgt-business-connextions-ltd-ipo/subscription-status" className="text-primary underline">/ipo/lgt-business-connextions-ltd-ipo/subscription-status</Link>
        </li>
        <li>
          GMP Price (example): <Link href="/ipo/lgt-business-connextions-ltd-ipo/gmp" className="text-primary underline">/ipo/lgt-business-connextions-ltd-ipo/gmp</Link>
        </li>
        <li>
          Review Page (example): <Link href="/ipo/lgt-business-connextions-ltd-ipo/review" className="text-primary underline">/ipo/lgt-business-connextions-ltd-ipo/review</Link>
        </li>
        <li>
          FAQ Page (example): <Link href="/ipo/lgt-business-connextions-ltd-ipo/faq" className="text-primary underline">/ipo/lgt-business-connextions-ltd-ipo/faq</Link>
        </li>
      </ul>
    </main>
  );
}
