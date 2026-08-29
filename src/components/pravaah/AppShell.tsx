import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  CircleUser,
  Database,
  FlaskConical,
  Gauge,
  Layers,
  LifeBuoy,
  Map as MapIcon,
  Menu,
  Mountain,
  Radar,
  Route as RouteIcon,
  Satellite,
  Settings,
  Siren,
  Users,
  Waves,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const NAV: Array<{ group: string; items: Array<{ to: string; label: string; icon: typeof Gauge }> }> = [
  {
    group: "Operations",
    items: [
      { to: "/", label: "Dashboard", icon: Gauge },
      { to: "/live-map", label: "Live Risk Map", icon: MapIcon },
      { to: "/risk-analysis", label: "Risk Analysis", icon: Activity },
      { to: "/cascade-analysis", label: "Cascade Analysis", icon: Waves },
      { to: "/incidents", label: "Incidents", icon: AlertTriangle },
      { to: "/alerts", label: "Alerts", icon: Siren },
    ],
  },
  {
    group: "Impact",
    items: [
      { to: "/exposure", label: "Exposure", icon: Users },
      { to: "/infrastructure", label: "Infrastructure", icon: Building2 },
      { to: "/evacuation", label: "Evacuation", icon: LifeBuoy },
      { to: "/safe-routes", label: "Safe Routes", icon: RouteIcon },
    ],
  },
  {
    group: "Intelligence",
    items: [
      { to: "/weather", label: "Weather", icon: Radar },
      { to: "/satellite", label: "Satellite", icon: Satellite },
      { to: "/historical-events", label: "Historical Events", icon: BookOpen },
      { to: "/analytics", label: "Analytics", icon: BarChart3 },
      { to: "/simulation", label: "Simulation", icon: FlaskConical },
      { to: "/case-studies", label: "Case Studies", icon: Mountain },
    ],
  },
  {
    group: "System",
    items: [
      { to: "/data-sources", label: "Data Sources", icon: Database },
      { to: "/model-performance", label: "Model Performance", icon: Layers },
      { to: "/settings", label: "Settings", icon: Settings },
      { to: "/admin/users", label: "Users & Roles", icon: CircleUser },
    ],
  },
];

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 flex h-14 items-center gap-3 border-b border-border bg-surface/95 px-3 backdrop-blur md:px-4">
        <button
          className="rounded-md p-2 hover:bg-secondary lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle navigation"
        >
          <Menu className="size-4" />
        </button>
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-md bg-primary/15 text-primary">
            <Waves className="size-4" />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold tracking-wide">PRAVAAH AI</span>
            <span className="label-mono hidden sm:block">Predictive Risk & Vulnerability Analysis</span>
          </span>
        </Link>
        <div className="ml-auto flex items-center gap-2 text-xs">
          <span className="hidden items-center gap-1.5 rounded-md border border-risk-low/40 bg-risk-low/10 px-2 py-1 text-risk-low md:inline-flex">
            <span className="size-1.5 animate-pulse rounded-full bg-current" /> SYSTEM NOMINAL
          </span>
          <span className="hidden rounded-md border border-border px-2 py-1 text-muted-foreground lg:inline">
            Region: India · Himalaya & Northeast
          </span>
          <Link
            to="/alerts"
            className="relative rounded-md border border-border p-1.5 hover:bg-secondary"
            aria-label="Alerts"
          >
            <Bell className="size-4" />
            <span className="absolute -top-1 -right-1 grid size-4 place-items-center rounded-full bg-risk-extreme text-[10px] font-bold text-foreground">
              4
            </span>
          </Link>
          <Link to="/login" className="flex items-center gap-2 rounded-md border border-border px-2 py-1.5 hover:bg-secondary">
            <CircleUser className="size-4" />
            <span className="hidden sm:inline">District Authority</span>
          </Link>
        </div>
      </header>

      <div className="flex">
        <aside
          className={cn(
            "fixed inset-y-14 left-0 z-40 w-60 shrink-0 overflow-y-auto border-r border-sidebar-border bg-sidebar p-3 transition-transform lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)] lg:translate-x-0",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          {NAV.map((group) => (
            <div key={group.group} className="mb-4">
              <p className="label-mono px-2 pb-1">{group.group}</p>
              <nav className="space-y-0.5">
                {group.items.map((item) => {
                  const active = pathname === item.to;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors",
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
                      )}
                    >
                      <item.icon className={cn("size-4", active && "text-primary")} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
          <p className="px-2 pt-2 text-[11px] text-muted-foreground">
            Decision-support prototype. Outputs are risk estimates, not deterministic predictions.
          </p>
        </aside>

        <main className="min-w-0 flex-1 space-y-5 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
