import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowUp, BarChart3, Flame, TrendingUp, Award } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { IssueCard } from "@/components/issue-card";
import { useIssues } from "@/lib/issues-store";

export const Route = createFileRoute("/trending")({
  head: () => ({
    meta: [
      { title: "Trending reports — CivicFix" },
      { name: "description", content: "Most upvoted neighborhood issues this week." },
      { property: "og:title", content: "Trending reports — CivicFix" },
      { property: "og:description", content: "See what matters most to your community right now." },
    ],
  }),
  component: TrendingPage,
});

function TrendingPage() {
  const all = useIssues();

  const top = useMemo(() =>
    [...all].sort((a, b) => b.upvotes - a.upvotes),
  [all]);

  const hottest = top.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-5 py-12">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-warm text-accent-foreground">
            <Flame className="h-6 w-6" />
          </span>
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight">Trending</h1>
            <p className="mt-1 text-muted-foreground">The most upvoted issues across the community</p>
          </div>
        </div>

        {/* Leaderboard podium */}
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {hottest.map((issue, i) => (
            <Link
              key={issue.id}
              to="/issues/$id"
              params={{ id: issue.id }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition hover:shadow-elegant"
            >
              <div className="absolute right-3 top-3">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-warm text-sm font-bold text-accent-foreground">
                  #{i + 1}
                </span>
              </div>
              <Award className="h-6 w-6 text-accent" />
              <h3 className="mt-3 font-display text-lg font-semibold group-hover:text-accent">
                {issue.title}
              </h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{issue.description}</p>
              <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <ArrowUp className="h-3.5 w-3.5" />
                  {issue.upvotes}
                </span>
                <span className="rounded-full border border-border px-2 py-0.5">{issue.category}</span>
                <span>{issue.address}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Full list */}
        <div className="mt-12">
          <div className="mb-6 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-display text-xl font-semibold">All reports by popularity</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {top.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        </div>

        <div className="mt-12 rounded-2xl border border-border bg-surface p-6 text-center">
          <TrendingUp className="mx-auto h-6 w-6 text-accent" />
          <p className="mt-2 text-sm text-muted-foreground">
            Upvote issues you care about — the hottest ones rise to the top of the city's queue.
          </p>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
