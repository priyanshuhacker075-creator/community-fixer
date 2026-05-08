import { Link } from "@tanstack/react-router";
import { Home, Compass, BookOpen, Plus } from "lucide-react";

const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/issues", label: "Browse", icon: Compass },
  { to: "/about", label: "How it works", icon: BookOpen },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-5">
        <Link to="/" className="group flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-hero text-primary-foreground shadow-elegant">
            <Home className="h-4 w-4" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">
            CivicFix
          </span>
        </Link>
        <nav className="flex flex-1 items-center justify-center gap-1 sm:gap-2">
          {NAV.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground sm:text-sm sm:px-3"
              activeOptions={{ exact: true }}
              activeProps={{ className: "text-foreground bg-muted" }}
            >
              <l.icon className="h-4 w-4" />
              <span>{l.label}</span>
            </Link>
          ))}
        </nav>
        <Link
          to="/report"
          className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-2 text-xs font-semibold text-background transition hover:opacity-90 sm:px-4 sm:text-sm"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden xs:inline sm:inline">Report</span>
        </Link>
      </div>
    </header>
  );
}
