import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CheckSquare,
  Wallet,
  Calendar,
  Target,
  GraduationCap,
  Timer,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

const mainNavItems: NavItem[] = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Tasks", href: "/tasks", icon: CheckSquare },
  { title: "Expenses", href: "/expenses", icon: Wallet },
  { title: "Calendar", href: "/calendar", icon: Calendar },
  { title: "Goals", href: "/goals", icon: Target },
  { title: "Learning", href: "/learning", icon: GraduationCap },
  { title: "Focus", href: "/focus", icon: Timer },
  { title: "Analytics", href: "/analytics", icon: BarChart3 },
];

const systemNavItems: NavItem[] = [
  { title: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    onCloseMobile();
    await logout();
    navigate("/login");
  };

  const renderNavList = (items: NavItem[]) => (
    <ul className="space-y-1 px-2">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <li key={item.href}>
            <NavLink
              to={item.href}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all cursor-pointer select-none",
                  isActive
                    ? "bg-primary/10 text-primary dark:bg-primary/20 font-semibold"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  collapsed && "justify-center px-2"
                )
              }
              title={collapsed ? item.title : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && (
                <span className="truncate flex-1">{item.title}</span>
              )}
              {!collapsed && item.badge && (
                <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary font-medium">
                  {item.badge}
                </span>
              )}
            </NavLink>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out lg:static",
          collapsed ? "w-16" : "w-64",
          mobileOpen
            ? "translate-x-0 w-64"
            : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Sidebar Header / Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
          <NavLink
            to="/"
            onClick={onCloseMobile}
            className="flex items-center gap-2.5 font-bold text-lg tracking-tight hover:opacity-90 transition-opacity"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            {(!collapsed || mobileOpen) && (
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent font-extrabold text-xl">
                Life OS
              </span>
            )}
          </NavLink>

          {/* Mobile Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-8 w-8"
            onClick={onCloseMobile}
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Desktop Collapse Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          <div>
            {!collapsed && (
              <p className="px-5 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                Main
              </p>
            )}
            {renderNavList(mainNavItems)}
          </div>
        </div>

        {/* Sidebar Footer / Settings & Logout */}
        <div className="border-t border-sidebar-border p-2 space-y-1">
          {!collapsed && (
            <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
              System
            </p>
          )}
          {renderNavList(systemNavItems)}

          <div className="px-2 pt-1">
            <button
              onClick={handleLogout}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-all cursor-pointer select-none",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? "Logout" : undefined}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {!collapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
