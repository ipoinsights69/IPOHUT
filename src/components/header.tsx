"use client";

import Link from "next/link";
import { NAVIGATION_CONFIG } from "@/config/navigation";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { SearchBox } from "@/components/search-box";

export function Header() {
  const { siteName, header } = NAVIGATION_CONFIG;
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="container flex h-14 items-center gap-4">
        <Link href="/" className="font-bold text-lg whitespace-nowrap">
          {siteName}
        </Link>
        <div className="flex-1">
          <SearchBox />
        </div>
        <NavigationMenu viewport={false}>
          <NavigationMenuList>
            {header.map((item) => (
              <NavigationMenuItem key={item.href}>
                <NavigationMenuLink asChild className="px-3 py-2">
                  <Link href={item.href}>
                    {item.label}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  );
}