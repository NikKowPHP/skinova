"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ScanFace, ListOrdered, BarChart3, Settings, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserProfile } from "@/lib/hooks/data";

const baseNavItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/scan", label: "Scan", icon: ScanFace },
  { href: "/routine", label: "Routine", icon: ListOrdered },
  { href: "/progress", label: "Progress", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function BottomTabBar() {
  const pathname = usePathname();
  const { data: userProfile } = useUserProfile();
  
  const navItems = userProfile?.subscriptionTier === 'ADMIN'
    ? [...baseNavItems.slice(0, 4), { href: "/admin", label: "Admin", icon: Shield }, ...baseNavItems.slice(4)]
    : baseNavItems;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-background/80 backdrop-blur-lg border-t border-border z-40">
      <div className="flex justify-around items-start h-full pt-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-full transition-colors h-full",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-caption-2">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}