export type NavItem = {
  label: string;
  href: string;
  external?: boolean;
};

export type FooterSection = {
  title: string;
  links: NavItem[];
};

export type NavigationConfig = {
  siteName: string;
  tagline: string;
  header: NavItem[];
  footer: {
    sections: FooterSection[];
    legal: NavItem[];
    social: {
      facebook?: string;
      twitter?: string;
      linkedin?: string;
      github?: string;
    };
  };
};

export const NAVIGATION_CONFIG: NavigationConfig = {
  siteName: "IPOHut",
  tagline: "India's #1 AI-powered platform for all things IPOs in one place.",
  header: [
    { label: "Home", href: "/" },
    { label: "IPOs", href: "/ipos" },
    { label: "GMP", href: "/ipo/sample-slug/gmp" },
    { label: "Subscription", href: "/ipo/sample-slug/subscription-status" },
    { label: "Allotment", href: "/ipo/sample-slug/allotment-status" },
    { label: "FAQ", href: "/ipo/sample-slug/faq" },
  ],
  footer: {
    sections: [
      {
        title: "Services",
        links: [
          { label: "IPO Calendar", href: "/ipos" },
          { label: "GMP Tracking", href: "/ipo/sample-slug/gmp" },
          { label: "Allotment Status", href: "/ipo/sample-slug/allotment-status" },
          { label: "Subscription Status", href: "/ipo/sample-slug/subscription-status" },
          { label: "IPO Reviews", href: "/ipo/sample-slug/review" },
        ],
      },
      {
        title: "Resources",
        links: [
          { label: "Market Analysis", href: "/analysis" },
          { label: "IPO Guide", href: "/guide" },
          { label: "FAQs", href: "/ipo/sample-slug/faq" },
          { label: "Blog", href: "/blog" },
          { label: "Glossary", href: "/glossary" },
        ],
      },
      {
        title: "Company",
        links: [
          { label: "About Us", href: "/about" },
          { label: "Contact", href: "/contact" },
          { label: "Careers", href: "/careers" },
          { label: "Press", href: "/press" },
        ],
      },
      {
        title: "Support",
        links: [
          { label: "Help Center", href: "/help" },
          { label: "API Documentation", href: "/api-docs" },
          { label: "Status", href: "/status" },
          { label: "Feedback", href: "/feedback" },
        ],
      },
    ],
    legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
      { label: "Disclaimer", href: "/disclaimer" },
    ],
    social: {
      facebook: "https://facebook.com/ipohut",
      twitter: "https://twitter.com/ipohut",
      linkedin: "https://linkedin.com/company/ipohut",
      github: "https://github.com/ipoinsights69/IPOHUT",
    },
  },
};