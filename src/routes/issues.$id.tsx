import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, ArrowUp, MapPin, MessageSquare, Sparkles, Camera, Clock, ShieldCheck, ShieldAlert, CheckCircle2, AlertTriangle } from "lucide-react";
import { useIssues, issuesStore } from "@/lib/issues-store";
import { STATUS_LABEL, STATUS_TONE, SEVERITY_LABEL, SEVERITY_COLOR } from "@/lib/issues";

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

function timeAgo(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function IssueDetail() {
  const { id } = useParams({ from: "/issues/$id" });

  const issues = useIssues();
  const issue = issues.find((i) => i.id === id);
  const upvoteCount = issue?.upvotes ?? 0;
  const voted = issuesStore.hasVoted(id);

  if (!issue) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24 text-center">
        <h1 className="font-display text-3xl font-bold">Report not found</h1>
        <p className="mt-2 text-muted-foreground">
          This report may have been removed or never existed.
        </p>
        <Link
          to="/issues"
          className="mt-6 inline-block rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:opacity-90"
        >
          ← Browse all reports
        </Link>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-4xl px-5 py-12">
      <Link
          to="/issues"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> All reports
        </Link>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            {issue.category}
          </span>
          <span className={`rounded-full border px-3 py-1 text-xs font-medium ${STATUS_TONE[issue.status]}`}>
            {STATUS_LABEL[issue.status]}
          </span>
          {issue.severity && (
            <span
              className="rounded-full px-3 py-1 text-xs font-bold text-white"
              style={{ background: SEVERITY_COLOR[issue.severity] }}
            >
              {SEVERITY_LABEL[issue.severity]}
            </span>
          )}
          <span className="text-xs text-muted-foreground">· {issue.id}</span>
        </div>

        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-balance md:text-5xl">
          {issue.title}
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4" /> {issue.address}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4" /> {timeAgo(issue.createdAt)}
          </span>
          <span>by {issue.reporter}</span>
        </div>

        <div className="mt-8 grid gap-8 md:grid-cols-[1fr_280px]">
          <div>
            {issue.image && (
              <img
                src={issue.image}
                alt={issue.title}
                className="w-full rounded-2xl border border-border object-cover max-h-80 mb-6"
              />
            )}

            <p className="text-base leading-relaxed">{issue.description}</p>

            {issue.aiReasoning && (
              <div className="mt-6 rounded-2xl border border-border bg-surface p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-accent" /> AI reasoning
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{issue.aiReasoning}</p>
              </div>
            )}

            {issue.aiVerification && (
              <div className="mt-4 space-y-2">
                <div className={`rounded-xl border p-3 ${
                  issue.aiVerification.isGenuine
                    ? "border-success/30 bg-success/5"
                    : "border-destructive/30 bg-destructive/5"
                }`}>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
                    {issue.aiVerification.isGenuine
                      ? <><ShieldCheck className="h-3.5 w-3.5 text-success" /> Photo verified</>
                      : <><ShieldAlert className="h-3.5 w-3.5 text-destructive" /> Photo flagged</>}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{issue.aiVerification.genuineReason}</p>
                </div>
                <div className={`rounded-xl border p-3 ${
                  issue.aiVerification.descriptionMatch
                    ? "border-success/30 bg-success/5"
                    : "border-destructive/30 bg-destructive/5"
                }`}>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
                    {issue.aiVerification.descriptionMatch
                      ? <><CheckCircle2 className="h-3.5 w-3.5 text-success" /> Description matches photo</>
                      : <><AlertTriangle className="h-3.5 w-3.5 text-destructive" /> Description may not match photo</>}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{issue.aiVerification.descriptionMatchReason}</p>
                </div>
              </div>
            )}

            {/* Location map */}
            <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
              <div className="flex items-center gap-2 border-b border-border px-5 py-3 text-xs font-semibold text-muted-foreground">
                <MapPin className="h-4 w-4 text-accent" /> Location
              </div>
              <div className="grid h-48 place-items-center bg-gradient-to-br from-muted to-surface px-5 text-center text-sm text-muted-foreground">
                <div>
                  <MapPin className="mx-auto h-6 w-6 text-accent/60" />
                  <p className="mt-1 font-medium text-foreground">{issue.address}</p>
                  <p className="text-xs">
                    {issue.lat.toFixed(5)}, {issue.lng.toFixed(5)}
                  </p>
                </div>
              </div>
            </div>

            {/* Activity timeline */}
            <h2 className="mt-10 flex items-center gap-2 font-display text-xl font-semibold">
              <MessageSquare className="h-5 w-5 text-primary" /> Activity
            </h2>
            <ol className="mt-4 space-y-4 border-l-2 border-border pl-5">
              {issue.updates.length === 0 && (
                <li className="text-sm text-muted-foreground">
                  No official updates yet — upvote so it gets prioritized.
                </li>
              )}
              {issue.updates.map((u, idx) => (
                <li key={idx} className="relative">
                  <span className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full bg-accent ring-4 ring-background" />
                  <div className="text-sm font-semibold">{u.by}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(u.at).toLocaleString()}
                  </div>
                  <p className="mt-1 text-sm">{u.note}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* Sidebar */}
          <aside className="h-fit space-y-4">
            <button
              onClick={() => issuesStore.toggleUpvote(issue.id)}
              className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition ${
                voted
                  ? "bg-accent text-accent-foreground hover:opacity-90"
                  : "bg-foreground text-background hover:opacity-90"
              }`}
            >
              <ArrowUp className="h-4 w-4" /> {voted ? "Upvoted" : "Upvote"} · {upvoteCount}
            </button>
            <p className="text-xs text-muted-foreground text-center">
              {voted ? "Tap again to remove your vote." : "Upvote to signal urgency to local agencies."}
            </p>

            <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Details
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium text-right">{STATUS_LABEL[issue.status]}</span>
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium text-right">{issue.category}</span>
                {issue.severity && (
                  <>
                    <span className="text-muted-foreground">Severity</span>
                    <span className="font-medium text-right">{SEVERITY_LABEL[issue.severity]}</span>
                  </>
                )}
                <span className="text-muted-foreground">Upvotes</span>
                <span className="font-medium text-right">{upvoteCount}</span>
                <span className="text-muted-foreground">Reporter</span>
                <span className="font-medium text-right">{issue.reporter}</span>
                <span className="text-muted-foreground">Reported</span>
                <span className="font-medium text-right text-xs">
                  {new Date(issue.createdAt).toLocaleDateString()}
                </span>
                {issue.aiVerification && (
                  <>
                    <span className="text-muted-foreground">AI confidence</span>
                    <span className="font-medium text-right">
                      {(issue.aiVerification.confidence * 100).toFixed(0)}%
                    </span>
                    <span className="text-muted-foreground">Photo verified</span>
                    <span className="font-medium text-right">
                      {issue.aiVerification.isGenuine ? "Yes" : "Flagged"}
                    </span>
                    <span className="text-muted-foreground">Desc. matches</span>
                    <span className="font-medium text-right">
                      {issue.aiVerification.descriptionMatch ? "Yes" : "No"}
                    </span>
                  </>
                )}
              </div>
            </div>

            {issue.image && (
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <Camera className="h-3.5 w-3.5" /> Photo
                </div>
                <img
                  src={issue.image}
                  alt=""
                  className="mt-2 w-full rounded-xl object-cover max-h-32"
                />
              </div>
            )}
          </aside>
        </div>
    </article>
  );
}