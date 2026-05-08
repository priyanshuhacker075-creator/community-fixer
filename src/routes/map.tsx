import { createFileRoute, Link } from "@tanstack/react-router";
import { Map, Navigation, ZoomIn, ZoomOut } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WorldPollutionMap } from "@/components/world-pollution-map";
import { useIssues } from "@/lib/issues-store";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Global issue map — CivicFix" },
      { name: "description", content: "Every neighborhood issue plotted on a live world map." },
      { property: "og:title", content: "Global issue map — CivicFix" },
      { property: "og:description", content: "See every reported issue worldwide on an interactive map." },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  const issues = useIssues();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-5 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-hero text-primary-foreground">
              <Map className="h-6 w-6" />
            </span>
            <div>
              <h1 className="font-display text-4xl font-bold tracking-tight">Map view</h1>
              <p className="mt-1 text-muted-foreground">{issues.length} issues plotted worldwide</p>
            </div>
          </div>
          <Link
            to="/report"
            className="rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:opacity-90"
          >
            + Report an issue
          </Link>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-border shadow-elegant">
          <WorldPollutionMap issues={issues} />
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <Navigation className="h-5 w-5 text-accent" />
            <h3 className="mt-2 font-semibold text-sm">Click any pin</h3>
            <p className="mt-1 text-xs text-muted-foreground">See report details, photos, and status updates.</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <ZoomIn className="h-5 w-5 text-accent" />
            <h3 className="mt-2 font-semibold text-sm">Zoom in</h3>
            <p className="mt-1 text-xs text-muted-foreground">Explore issues block by block in your neighborhood.</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <ZoomOut className="h-5 w-5 text-accent" />
            <h3 className="mt-2 font-semibold text-sm">Zoom out</h3>
            <p className="mt-1 text-xs text-muted-foreground">See global pollution patterns at a glance.</p>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
