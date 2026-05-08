import { createFileRoute, Link } from "@tanstack/react-router";
import { Code2, Github, Star, GitFork, Heart, Globe, ExternalLink } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/opensource")({
  head: () => ({
    meta: [
      { title: "Open source — CivicFix" },
      { name: "description", content: "CivicFix is open source. Contribute on GitHub." },
      { property: "og:title", content: "Open source — CivicFix" },
      { property: "og:description", content: "Built in the open, for everyone." },
    ],
  }),
  component: OpenSourcePage,
});

function OpenSourcePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="mx-auto max-w-4xl px-5 py-16">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-hero text-primary-foreground">
            <Code2 className="h-6 w-6" />
          </span>
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight">Open source</h1>
            <p className="mt-1 text-muted-foreground">Built in the open, for everyone</p>
          </div>
        </div>

        <p className="mt-8 text-lg text-muted-foreground">
          CivicFix is 100% open source under the MIT license. Every line of code is visible,
          auditable, and forkable. We believe civic tech should be a public good.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="https://github.com/civicfix"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition hover:opacity-90"
          >
            <Github className="h-4 w-4" /> View on GitHub <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <Link
            to="/report"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold transition hover:bg-muted"
          >
            <Star className="h-4 w-4" /> Star the repo
          </Link>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            { icon: Code2, title: "MIT licensed", body: "Use it, modify it, ship it. No strings attached." },
            { icon: GitFork, title: "Contributions welcome", body: "Bug fixes, features, translations — all PRs appreciated." },
            { icon: Heart, title: "Community driven", body: "Built by neighbors for neighbors, not by a corporation." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card p-5 text-center">
              <span className="inline-grid h-10 w-10 place-items-center rounded-xl bg-gradient-warm text-accent-foreground">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-3 font-semibold">{f.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-3xl border border-border bg-surface p-8">
          <Globe className="h-6 w-6 text-accent" />
          <h2 className="mt-3 font-display text-xl font-semibold">Tech stack</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {["React 19", "TanStack Router", "TypeScript", "Tailwind CSS", "Vite", "Cloudflare Workers", "Google Gemini", "Leaflet", "Framer Motion", "shadcn/ui"].map((t) => (
              <span key={t} className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium">
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            Found a bug?{" "}
            <a href="https://github.com/civicfix" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
              Open an issue on GitHub
            </a>
          </p>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
