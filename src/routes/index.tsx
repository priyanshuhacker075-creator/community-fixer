import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, MapPin, Megaphone, ShieldCheck, Sparkles } from "lucide-react";
import heroImg from "@/assets/hero-city.jpg";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { IssueCard } from "@/components/issue-card";
import { useIssues } from "@/lib/issues-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CivicFix — Report neighborhood issues that actually get fixed" },
      { name: "description", content: "Report potholes, broken streetlights, graffiti and more. Track resolution in real time and rally your neighbors." },
      { property: "og:title", content: "CivicFix — Civic issues, transparently tracked" },
      { property: "og:description", content: "A modern community-driven way to report and resolve neighborhood issues." },
    ],
  }),
  component: Home,
});

function Home() {
  const issues = useIssues();
  const stats = [
    { label: "Reports filed", value: "12,480" },
    { label: "Resolved this month", value: "1,932" },
    { label: "Avg. response", value: "31h" },
    { label: "Neighborhoods", value: "84" },
  ];
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={heroImg} alt="" width={1920} height={1080} className="h-full w-full object-cover opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />
        </div>
        <div className="mx-auto max-w-7xl px-5 pb-24 pt-20 md:pb-32 md:pt-28">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              A friendlier 311 for the modern block
            </span>
            <h1 className="mt-5 font-display text-5xl font-bold leading-[1.05] tracking-tight text-balance md:text-7xl">
              See it. Click it.{" "}
              <span className="bg-gradient-warm bg-clip-text text-transparent">Fix it together.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground text-balance">
              Report potholes, dead lights, dumping and more in 30 seconds.
              Watch your city respond — out in the open, on a map, with everyone watching.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/report"
                className="group inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background shadow-elegant transition hover:opacity-90"
              >
                Report something now
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/issues"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-6 py-3 text-sm font-semibold backdrop-blur transition hover:bg-card"
              >
                Browse the map
              </Link>
            </div>
          </motion.div>

          {/* STATS */}
          <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.08, duration: 0.5 }}
                className="rounded-2xl border border-border bg-card/80 p-5 backdrop-blur"
              >
                <div className="font-display text-3xl font-bold tracking-tight text-foreground">{s.value}</div>
                <div className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY DIFFERENT */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 md:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "Verified, not noisy", body: "Every report is geo-checked and de-duped, so officials see signal — not spam." },
            { icon: Megaphone, title: "Loud when it matters", body: "Neighbors upvote what's hurting them most. The city sees the priorities, you see the heat." },
            { icon: CheckCircle2, title: "Closed in the open", body: "Status changes are public. Photos at resolution. No more reports vanishing into a void." },
          ].map((f) => (
            <div key={f.title} className="rounded-3xl border border-border bg-card p-7">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-hero text-primary-foreground">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-display text-xl font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* RECENT */}
      <section className="mx-auto max-w-7xl px-5 py-20">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Pulse of the streets</h2>
            <p className="mt-2 text-muted-foreground">Latest reports from the neighborhood feed.</p>
          </div>
          <Link to="/issues" className="hidden items-center gap-1 text-sm font-semibold text-primary hover:underline md:inline-flex">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {issues.slice(0, 6).map((i) => (
            <IssueCard key={i.id} issue={i} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-10 text-primary-foreground md:p-16">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/30 blur-3xl" />
          <div className="absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-primary/40 blur-3xl" />
          <div className="relative max-w-2xl">
            <MapPin className="h-8 w-8 text-accent" />
            <h2 className="mt-4 font-display text-3xl font-bold leading-tight md:text-5xl">
              Your block deserves better than a phone tree.
            </h2>
            <p className="mt-4 text-base text-primary-foreground/80 md:text-lg">
              Drop a pin. Add a photo. We do the routing — and the public follow-up.
            </p>
            <Link
              to="/report"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-glow transition hover:opacity-90"
            >
              Start a report <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
