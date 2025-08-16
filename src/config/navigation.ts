export type NavItem = {
  label: string;
  href: string;
  external?: boolean;
};

export type NavigationConfig = {
  siteName: string;
  header: NavItem[];
  footer: NavItem[];
};

export const NAVIGATION_CONFIG: NavigationConfig = {
  siteName: "IPOHut",
  header: [
    { label: "Home", href: "/" },
    { label: "IPOs", href: "/ipos" },
    { label: "GMP", href: "/ipo/sample-slug/gmp" },
    { label: "Subscription", href: "/ipo/sample-slug/subscription-status" },
    { label: "Allotment", href: "/ipo/sample-slug/allotment-status" },
    { label: "FAQ", href: "/ipo/sample-slug/faq" },
  ],
  footer: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "GitHub", href: "https://github.com/ipoinsights69/IPOHUT", external: true },
  ],
};