import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Home, Compass, BookOpen, Plus, Menu, X, Map, BarChart3,
  Bell, HelpCircle, Shield, Mail, Code2, Sparkles,
} from "lucide-react";

const NAV_GROUPS = [
  {
    label: "Explore",
    items: [
      { to: "/", label: "Home", icon: Home, desc: "Overview & live pollution map" },
      { to: "/issues", label: "Browse reports", icon: Compass, desc: "Filter the community feed" },
      { to: "/map", label: "Map view", icon: Map, desc: "See every pin worldwide" },
      { to: "/trending", label: "Trending", icon: BarChart3, desc: "Most upvoted this week" },
    ],
  },
  {
    label: "Get involved",
    items: [
      { to: "/report", label: "Report an issue", icon: Plus, desc: "AI-assisted in 30 seconds" },
      { to: "/about", label: "How it works", icon: BookOpen, desc: "Our process, end-to-end" },
      { to: "/ai-insights", label: "AI insights", icon: Sparkles, desc: "How we classify pollution" },
      { to: "/alerts", label: "Subscribe to alerts", icon: Bell, desc: "Updates for your block" },
    ],
  },
  {
    label: "Support",
    items: [
      { to: "/faq", label: "Help & FAQ", icon: HelpCircle, desc: "Common questions" },
      { to: "/privacy", label: "Privacy", icon: Shield, desc: "How we handle your data" },
      { to: "/contact", label: "Contact", icon: Mail, desc: "Reach the team" },
      { to: "/opensource", label: "Open source", icon: Code2, desc: "Star us on GitHub" },
    ],
  },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-[1000] border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-5">
        <Link to="/" className="group flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-hero text-primary-foreground shadow-elegant">
            <Home className="h-4 w-4" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">CivicFix</span>
        </Link>

        <div ref={ref} className="relative flex items-center gap-2">
          <Link
            to="/report"
            className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Report
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Open menu"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-sm font-semibold transition hover:bg-muted"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            <span>Menu</span>
          </button>

          {open && (
            <div className="flex flex-col absolute right-0 top-[calc(100%+0.5rem)] z-[9999] w-[min(92vw,520px)] origin-top-right max-h-[calc(100vh-5rem)] rounded-2xl border border-border bg-card shadow-deep">
              <div className="overflow-y-auto overscroll-contain p-2">
                {NAV_GROUPS.map((group) => (
                  <div key={group.label} className="p-2">
                    <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      {group.label}
                    </div>
                    <div className="grid gap-1">
                      {group.items.map((item, i) => (
                        <Link
                          key={`${group.label}-${i}`}
                          to={item.to}
                          onClick={() => setOpen(false)}
                          className="group flex items-start gap-3 rounded-xl px-3 py-2.5 transition hover:bg-muted"
                        >
                          <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface text-foreground transition group-hover:bg-foreground group-hover:text-background">
                            <item.icon className="h-4 w-4" />
                          </span>
                          <span className="flex-1">
                            <span className="block text-sm font-semibold">{item.label}</span>
                            <span className="block text-xs text-muted-foreground">{item.desc}</span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between gap-2 border-t border-border bg-surface px-4 py-3 text-xs text-muted-foreground shrink-0">
                <span>Built by neighbors, for neighbors.</span>
                <Link
                  to="/report"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-1 rounded-full bg-foreground px-3 py-1.5 text-xs font-semibold text-background hover:opacity-90"
                >
                  <Plus className="h-3.5 w-3.5" /> New report
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
