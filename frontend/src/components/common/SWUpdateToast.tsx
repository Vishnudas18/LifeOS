import React from "react";
import { RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useServiceWorkerUpdate } from "@/hooks/useServiceWorkerUpdate";

export const SWUpdateToast: React.FC = () => {
  const { needRefresh, updateServiceWorker, dismissUpdate } = useServiceWorkerUpdate();

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm w-full p-4 rounded-xl border border-emerald-500/30 bg-card/95 backdrop-blur shadow-2xl space-y-3 animate-in slide-in-from-bottom-4 duration-200">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <RefreshCw className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-foreground">Update Available</h4>
            <p className="text-[11px] text-muted-foreground leading-tight">
              A new version of Life OS is ready to load.
            </p>
          </div>
        </div>
        <button
          onClick={dismissUpdate}
          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-end space-x-2 pt-1">
        <Button variant="ghost" size="sm" onClick={dismissUpdate} className="h-7 text-xs">
          Later
        </Button>
        <Button
          size="sm"
          onClick={() => updateServiceWorker()}
          className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
        >
          Reload & Update
        </Button>
      </div>
    </div>
  );
};
