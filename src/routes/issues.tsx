import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { IssueCard } from "@/components/issue-card";
import { useIssues } from "@/lib/issues-store";
import { CATEGORIES, IssueStatus, STATUS_LABEL } from "@/lib/issues";

export const Route = createFileRoute("/issues")({
  head: () => ({
    meta: [
      { title: "Browse all issues — CivicFix" },
      { name: "description", content: "Filter and search every neighborhood report by status, category and location." },
      { property: "og:title", content: "Browse all issues — CivicFix" },
      { property: "og:description", content: "Filter and search every neighborhood report on CivicFix." },
    ],
  }),
  component: IssuesPage,
});

const STATUSES: IssueStatus[] = ["open", "acknowledged", "in_progress", "resolved"];

function IssuesPage() {
  const all = useIssues();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<IssueStatus | "all">("all");
  const [cat, setCat] = useState<string>("all");

  const filtered = useMemo(() => {
    return all.filter((i) => {
      if (status !== "all" && i.status !== status) return false;
      if (cat !== "all" && i.category !== cat) return false;
      if (q && !(`${i.title} ${i.description} ${i.address}`.toLowerCase().includes(q.toLowerCase()))) return false;
      return true;
    });
  }, [all, q, status, cat]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-5 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight">All reports</h1>
            <p className="mt-2 text-muted-foreground">{filtered.length} of {all.length} reports</p>
          </div>
          <Link to="/report" className="rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:opacity-90">
            + New report
          </Link>
        </div>

        {/* Filter bar */}
        <div className="mt-8 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search title, address, description..."
              className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>
          <div className="flex items-center gap-2 text-xs">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <select value={status} onChange={(e) => setStatus(e.target.value as IssueStatus | "all")}
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm">
              <option value="all">All statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
            </select>
            <select value={cat} onChange={(e) => setCat(e.target.value)}
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm">
              <option value="all">All categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((i) => <IssueCard key={i.id} issue={i} />)}
        </div>
        {filtered.length === 0 && (
          <div className="mt-16 rounded-2xl border border-dashed border-border bg-surface p-12 text-center text-muted-foreground">
            No reports match those filters.
          </div>
        )}
      </section>
      <SiteFooter />
    </div>
  );
}
