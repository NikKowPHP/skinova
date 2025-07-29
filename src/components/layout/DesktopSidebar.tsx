"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, ScanFace, ListOrdered, BarChart3, Settings, LogOut, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/stores/auth.store";
import { SkinovaLogo } from "../SkinovaLogo";
import { useUserProfile } from "@/lib/hooks/data";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/scan", label: "New Scan", icon: ScanFace },
  { href: "/routine", label: "My Routine", icon: ListOrdered },
  { href: "/progress", label: "Progress", icon: BarChart3 },
];

export function DesktopSidebar() {
  const pathname = usePathname();
  const { signOut } = useAuthStore();
  const router = useRouter();
  const { data: userProfile } = useUserProfile();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-sidebar border-r border-sidebar-border">
      <div className="flex items-center h-16 border-b px-6">
        <Link href="/">
          <SkinovaLogo />
        </Link>
      </div>
      <div className="flex-1 p-4">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
           {userProfile?.subscriptionTier === 'ADMIN' && (
             <Link
                href="/admin"
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  pathname.startsWith("/admin")
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                )}
              >
                <Shield className="h-5 w-5" />
                <span>Admin</span>
              </Link>
           )}
        </nav>
      </div>
      <div className="mt-auto p-4 border-t space-y-1">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            pathname.startsWith("/settings")
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent/50",
          )}
        >
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </Link>
        <button
          onClick={async () => {
            await signOut();
            router.push("/");
          }}
          className={cn(
            "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors text-sidebar-foreground hover:bg-sidebar-accent/50",
          )}
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}