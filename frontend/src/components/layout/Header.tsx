import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  Sun,
  Moon,
  Laptop,
  Search,
  User,
  Activity,
  LogOut,
} from "lucide-react";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";
import { CommandPalette } from "@/features/search/components/CommandPalette";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";
import { useAuthStore } from "@/stores/authStore";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { checkBackendHealth } from "@/services/health";

interface HeaderProps {
  onOpenMobileSidebar: () => void;
}

const routeTitles: Record<string, string> = {
  "/": "Dashboard",
  "/tasks": "Tasks",
  "/expenses": "Expenses",
  "/calendar": "Calendar",
  "/goals": "Goals",
  "/learning": "Learning",
  "/focus": "Focus",
  "/analytics": "Analytics",
  "/search": "Global Search",
  "/settings": "Settings",
};

export function Header({ onOpenMobileSidebar }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const { isOnline } = useOnlineStatus();
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const currentTitle = routeTitles[location.pathname] || "Life OS";

  useEffect(() => {
    checkBackendHealth().then((res) => {
      setApiConnected(res?.success === true);
    });
  }, []);

  // Global Ctrl+K / Cmd+K keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-6">
        {/* Left section: Mobile menu toggle & page title */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-9 w-9"
            onClick={onOpenMobileSidebar}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight text-foreground">
              {currentTitle}
            </h1>

            {/* Connection Status Badge */}
            <div
              className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border bg-muted/50 text-muted-foreground ml-2"
              title={
                !isOnline
                  ? "You are offline"
                  : apiConnected === true
                  ? "Backend API Connected (http://localhost:5000)"
                  : apiConnected === false
                  ? "Backend API Offline"
                  : "Checking API..."
              }
            >
              <Activity
                className={`h-3 w-3 ${
                  !isOnline
                    ? "text-rose-500"
                    : apiConnected === true
                    ? "text-emerald-500 animate-pulse"
                    : apiConnected === false
                    ? "text-rose-500"
                    : "text-amber-500"
                }`}
              />
              <span>
                {!isOnline
                  ? "Offline"
                  : apiConnected === true
                  ? "API Online"
                  : apiConnected === false
                  ? "API Offline"
                  : "API..."}
              </span>
            </div>
          </div>
        </div>

        {/* Center section: Search bar trigger for Command Palette */}
        <div
          onClick={() => setIsCommandPaletteOpen(true)}
          className="hidden md:flex items-center w-full max-w-sm px-3 py-1.5 rounded-lg border border-input bg-muted/30 text-sm text-muted-foreground hover:bg-muted/50 cursor-pointer transition-colors"
        >
          <Search className="h-4 w-4 mr-2 text-muted-foreground/70" />
          <span className="w-full text-muted-foreground/70 select-none">
            Search tasks, goals, expenses...
          </span>
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            ⌘K
          </kbd>
        </div>

        {/* Right section: Mobile search button, theme switcher, notifications, user avatar & logout */}
        <div className="flex items-center gap-2">
          {/* Mobile Search Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCommandPaletteOpen(true)}
            aria-label="Search"
            title="Global Search (Ctrl+K)"
            className="md:hidden h-9 w-9 text-muted-foreground hover:text-foreground"
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Theme Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title={`Current theme: ${theme}. Click to change.`}
            aria-label="Toggle theme"
            className="h-9 w-9"
          >
            {theme === "light" && <Sun className="h-4 w-4 text-amber-500" />}
            {theme === "dark" && <Moon className="h-4 w-4 text-blue-400" />}
            {theme === "system" && <Laptop className="h-4 w-4 text-muted-foreground" />}
          </Button>

          {/* Notifications Bell */}
          <NotificationBell />

          {/* User Profile Info & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-border">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 font-medium text-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold leading-tight text-foreground truncate max-w-[120px]">
                {user?.name || "User"}
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight truncate max-w-[120px]">
                {user?.email || "Life OS Member"}
              </span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="Logout"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Global Command Palette Dialog Overlay */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </>
  );
}
