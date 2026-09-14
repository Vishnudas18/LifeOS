import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { OfflineBanner } from "@/components/common/OfflineBanner";
import { PWAInstallPrompt } from "@/components/common/PWAInstallPrompt";
import { SWUpdateToast } from "@/components/common/SWUpdateToast";

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Sidebar Navigation */}
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Viewport */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Offline Banner */}
        <OfflineBanner />

        <Header onOpenMobileSidebar={() => setMobileOpen(true)} />

        {/* Scrollable Content Container */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-background">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>

      {/* PWA Prompts & Toasts */}
      <PWAInstallPrompt />
      <SWUpdateToast />
    </div>
  );
}

export default AppLayout;
