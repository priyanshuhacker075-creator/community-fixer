import { useNavigate } from "@tanstack/react-router";
import { ArrowUp, MapPin } from "lucide-react";
import { Issue, STATUS_LABEL, STATUS_TONE } from "@/lib/issues";
import { useIssues, issuesStore } from "@/lib/issues-store";

function timeAgo(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function IssueCard({ issue }: { issue: Issue }) {
  const navigate = useNavigate();
  const issues = useIssues();
  const current = issues.find((i) => i.id === issue.id) ?? issue;
  const voted = issuesStore.hasVoted(issue.id);

  return (
    <article
      onClick={() => navigate({ to: "/issues/$id", params: { id: issue.id } })}
      className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-elegant cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            {issue.category}
          </span>
          <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_TONE[issue.status]}`}>
            {STATUS_LABEL[issue.status]}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            issuesStore.toggleUpvote(issue.id);
          }}
          className={`flex flex-col items-center rounded-lg border px-2 py-1 text-xs font-semibold transition shrink-0 ${
            voted
              ? "bg-foreground text-background border-foreground"
              : "border-border bg-background hover:border-accent hover:text-accent-foreground"
          }`}
          aria-label={voted ? "Remove upvote" : "Upvote issue"}
        >
          <ArrowUp className={`h-3.5 w-3.5 ${voted ? "text-background" : ""}`} />
          {current.upvotes}
        </button>
      </div>

      <h3 className="mt-3 font-display text-lg font-semibold leading-snug text-balance group-hover:text-primary">
        {issue.title}
      </h3>
      <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground flex-1">
        {issue.description}
      </p>

      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" /> {issue.address}
        </span>
        <span>{timeAgo(issue.createdAt)} · {issue.id}</span>
      </div>
    </article>
  );
}
