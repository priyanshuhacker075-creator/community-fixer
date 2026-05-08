import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, MapPin, Megaphone, CheckCircle2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "How CivicFix works" },
      { name: "description", content: "Four steps from spotting a problem to seeing it resolved on your block." },
      { property: "og:title", content: "How CivicFix works" },
      { property: "og:description", content: "From report to resolved — transparently." },
    ],
  }),
  component: About,
});

const STEPS = [
  { icon: Camera, title: "Snap & describe", body: "Open CivicFix, pick a category, add a photo and a sentence about the issue." },
  { icon: MapPin, title: "Drop a pin", body: "We auto-detect your location or let you place a pin on the map for accuracy." },
  { icon: Megaphone, title: "Neighbors amplify", body: "Anyone in the area can upvote — louder reports rise to the top of city queues." },
  { icon: CheckCircle2, title: "Closed in public", body: "Status updates and resolution photos are posted publicly. No black box, no excuses." },
];

function About() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="mx-auto max-w-4xl px-5 py-16">
        <h1 className="font-display text-5xl font-bold tracking-tight text-balance">
          A 4-step civic loop, fully transparent.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          CivicFix is built on the idea that fixing a city is a team sport — between residents, agencies, and everyone watching.
        </p>

        <ol className="mt-12 space-y-5">
          {STEPS.map((s, i) => (
            <li key={s.title} className="flex gap-5 rounded-3xl border border-border bg-card p-6">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-hero text-primary-foreground">
                <s.icon className="h-5 w-5" />
              </span>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Step {i + 1}</div>
                <h2 className="font-display text-xl font-semibold">{s.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-12 rounded-3xl bg-gradient-warm p-8 text-accent-foreground">
          <h2 className="font-display text-2xl font-bold">Ready to try it?</h2>
          <p className="mt-1 text-sm opacity-90">It takes about 30 seconds — promise.</p>
          <Link to="/report" className="mt-5 inline-block rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:opacity-90">
            File your first report
          </Link>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
