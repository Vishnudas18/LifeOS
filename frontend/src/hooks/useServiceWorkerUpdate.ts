import { useRegisterSW } from "virtual:pwa-register/react";

export function useServiceWorkerUpdate() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, r) {
      if (r) {
        setInterval(async () => {
          if (!(!r.installing && r.waiting)) return;
          if (navigator.serviceWorker.controller) {
            await r.update();
          }
        }, 60 * 60 * 1000); // Check for updates hourly
      }
    },
    onRegisterError(error) {
      console.warn("Service worker registration error:", error);
    },
  });

  const dismissUpdate = () => {
    setNeedRefresh(false);
  };

  return {
    needRefresh,
    updateServiceWorker: () => updateServiceWorker(true),
    dismissUpdate,
  };
}
