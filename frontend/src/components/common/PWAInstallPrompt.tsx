import React from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWAInstall } from "@/hooks/usePWAInstall";

export const PWAInstallPrompt: React.FC = () => {
  const { canInstall, promptInstall, dismissPrompt } = usePWAInstall();

  if (!canInstall) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full p-4 rounded-xl border border-indigo-500/30 bg-card/95 backdrop-blur shadow-2xl space-y-3 animate-in slide-in-from-bottom-4 duration-200">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-foreground">Install Life OS</h4>
            <p className="text-[11px] text-muted-foreground leading-tight">
              Get a faster, app-like experience on your device.
            </p>
          </div>
        </div>
        <button
          onClick={dismissPrompt}
          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-end space-x-2 pt-1">
        <Button variant="ghost" size="sm" onClick={dismissPrompt} className="h-7 text-xs">
          Not now
        </Button>
        <Button
          size="sm"
          onClick={promptInstall}
          className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
        >
          Install App
        </Button>
      </div>
    </div>
  );
};
