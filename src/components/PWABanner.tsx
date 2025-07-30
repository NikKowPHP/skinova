"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/stores/auth.store";
import { usePathname } from "next/navigation";

const PWA_DISMISS_KEY = "skinova_pwa_install_dismissed";

// This interface is needed because the default Event type doesn't include PWA prompt properties.
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PWABanner() {
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      event.preventDefault();
      const castEvent = event as BeforeInstallPromptEvent;
      setInstallPromptEvent(castEvent);

      // Check if the app is already installed or if the user has dismissed the banner before
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
      const hasDismissed = localStorage.getItem(PWA_DISMISS_KEY);

      if (!isStandalone && !hasDismissed) {
        setIsVisible(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const user = useAuthStore((state) => state.user);
  const pathname = usePathname();

  const handleInstall = async () => {
    if (!installPromptEvent) return;
    
    // Show the browser's install prompt
    await installPromptEvent.prompt();
    
    // Wait for the user to respond to the prompt
    await installPromptEvent.userChoice;
    
    // We hide the banner regardless of the choice. If they dismiss, we don't want to show it again on this session.
    setIsVisible(false);
    // Mark as dismissed so it doesn't reappear on next page load.
    localStorage.setItem(PWA_DISMISS_KEY, "true");
  };

  const handleDismiss = () => {
    localStorage.setItem(PWA_DISMISS_KEY, "true");
    setIsVisible(false);
  };
  
  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password");
  const isLoggedInAppView = user && !isAuthPage;

  if (!isVisible || !user) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed left-0 right-0 bg-background/80 backdrop-blur-lg border-t p-4 flex flex-col sm:flex-row justify-between items-center gap-4 z-50 animate-in slide-in-from-bottom-full",
        isLoggedInAppView ? "bottom-20 md:bottom-0" : "bottom-0", // Position above tab bar on mobile
      )}
    >
      <div className="flex items-center gap-4">
        <Download className="h-6 w-6 text-primary" />
        <p className="text-sm font-medium text-center sm:text-left">
          Add Skinova to your home screen for a better experience.
        </p>
      </div>
      <div className="flex gap-2 shrink-0">
        <Button size="sm" onClick={handleInstall}>
          Install
        </Button>
        <Button variant="ghost" size="icon" onClick={handleDismiss} className="h-9 w-9">
          <X className="h-4 w-4" />
          <span className="sr-only">Dismiss</span>
        </Button>
      </div>
    </div>
  );
}