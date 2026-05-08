import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, ArrowUp, MapPin, MessageSquare } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useIssues, issuesStore } from "@/lib/issues-store";
import { STATUS_LABEL, STATUS_TONE } from "@/lib/issues";

export const Route = createFileRoute("/issues/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Report ${params.id} — CivicFix` },
      { name: "description", content: `Public detail and status for report ${params.id}.` },
      { property: "og:title", content: `Report ${params.id} — CivicFix` },
      { property: "og:description", content: `Public detail and status for report ${params.id}.` },
    ],
  }),
  component: IssueDetail,
});

function IssueDetail() {
  const { id } = useParams({ from: "/issues/$id" });
  const issues = useIssues();
  const issue = issues.find((i) => i.id === id);

  if (!issue) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-5 py-24 text-center">
          <h1 className="font-display text-3xl font-bold">Report not found</h1>
          <Link to="/issues" className="mt-6 inline-block text-primary hover:underline">← Back to all reports</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <article className="mx-auto max-w-4xl px-5 py-12">
        <Link to="/issues" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> All reports
        </Link>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">{issue.category}</span>
          <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_TONE[issue.status]}`}>
            {STATUS_LABEL[issue.status]}
          </span>
          <span className="text-xs text-muted-foreground">· {issue.id}</span>
        </div>

        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-balance md:text-5xl">{issue.title}</h1>
        <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" /> {issue.address} · reported by {issue.reporter}
        </p>

        <div className="mt-8 grid gap-8 md:grid-cols-[1fr_280px]">
          <div>
            <p className="text-base leading-relaxed">{issue.description}</p>

            <h2 className="mt-10 flex items-center gap-2 font-display text-xl font-semibold">
              <MessageSquare className="h-5 w-5 text-primary" /> Activity
            </h2>
            <ol className="mt-4 space-y-4 border-l-2 border-border pl-5">
              {issue.updates.length === 0 && (
                <li className="text-sm text-muted-foreground">No official updates yet — be the first to upvote so it gets prioritized.</li>
              )}
              {issue.updates.map((u, idx) => (
                <li key={idx} className="relative">
                  <span className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full bg-accent ring-4 ring-background" />
                  <div className="text-sm font-semibold">{u.by}</div>
                  <div className="text-xs text-muted-foreground">{new Date(u.at).toLocaleString()}</div>
                  <p className="mt-1 text-sm">{u.note}</p>
                </li>
              ))}
            </ol>
          </div>

          <aside className="h-fit rounded-2xl border border-border bg-card p-5">
            <button
              onClick={() => issuesStore.upvote(issue.id)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-3 text-sm font-semibold text-background hover:opacity-90"
            >
              <ArrowUp className="h-4 w-4" /> Upvote · {issue.upvotes}
            </button>
            <p className="mt-3 text-xs text-muted-foreground">Upvotes signal urgency to local agencies.</p>
            <div className="mt-5 grid h-40 place-items-center rounded-xl bg-gradient-hero text-primary-foreground">
              <div className="text-center text-sm opacity-80">
                <MapPin className="mx-auto h-6 w-6" />
                <div className="mt-1">{issue.lat.toFixed(3)}, {issue.lng.toFixed(3)}</div>
              </div>
            </div>
          </aside>
        </div>
      </article>
      <SiteFooter />
    </div>
  );
}
