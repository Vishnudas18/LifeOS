import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "lifeos_pwa_install_dismissed";

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISSED_KEY) === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!isDismissed) {
        setCanInstall(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, [isDismissed]);

  const promptInstall = async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setCanInstall(false);
        setDeferredPrompt(null);
      }
    } catch {
      // Ignore install prompt errors
    }
  };

  const dismissPrompt = () => {
    setIsDismissed(true);
    setCanInstall(false);
    try {
      localStorage.setItem(DISMISSED_KEY, "true");
    } catch {
      // Ignore
    }
  };

  return {
    canInstall: canInstall && !isDismissed,
    promptInstall,
    dismissPrompt,
  };
}
