import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Mail, CheckCircle2, Loader2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Subscribe to alerts — CivicFix" },
      { name: "description", content: "Get notified about new issues and updates in your neighborhood." },
      { property: "og:title", content: "Subscribe to alerts — CivicFix" },
      { property: "og:description", content: "Stay informed about what's happening on your block." },
    ],
  }),
  component: AlertsPage,
});

function AlertsPage() {
  const [email, setEmail] = useState("");
  const [radius, setRadius] = useState("1");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Simulate subscription — in production this would call a server function
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <section className="mx-auto max-w-lg px-5 py-24 text-center">
          <span className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-success/10 text-success">
            <CheckCircle2 className="h-8 w-8" />
          </span>
          <h1 className="mt-6 font-display text-3xl font-bold">You're subscribed!</h1>
          <p className="mt-3 text-muted-foreground">
            We'll send alerts for new issues within <strong>{radius} km</strong> of your area to <strong>{email}</strong>.
          </p>
          <button
            onClick={() => { setSubmitted(false); setEmail(""); }}
            className="mt-8 rounded-full border border-border bg-card px-6 py-2.5 text-sm font-semibold hover:bg-muted"
          >
            Subscribe another address
          </button>
        </section>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="mx-auto max-w-2xl px-5 py-16">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-warm text-accent-foreground">
            <Bell className="h-6 w-6" />
          </span>
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight">Subscribe to alerts</h1>
            <p className="mt-1 text-muted-foreground">Get notified when new issues pop up in your area</p>
          </div>
        </div>

        <p className="mt-8 text-muted-foreground">
          Choose a radius and we'll email you whenever a new report is filed nearby. Unsubscribe anytime.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6 rounded-3xl border border-border bg-card p-6 shadow-elegant md:p-8">
          <label className="block">
            <span className="text-sm font-semibold">Email address</span>
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-input bg-background px-4 py-2.5">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <input
                required type="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="flex-1 bg-transparent text-sm outline-none"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-sm font-semibold">Notification radius</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {["0.5", "1", "2", "5", "10"].map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRadius(r)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    radius === r
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-background hover:border-foreground/40"
                  }`}
                >
                  {r} km
                </button>
              ))}
            </div>
          </label>

          <div className="space-y-2 text-sm text-muted-foreground">
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="rounded border-border" />
              New reports in my area
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="rounded border-border" />
              Status updates on nearby issues
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded border-border" />
              Weekly digest of resolved issues
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-3 text-sm font-semibold text-background transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Subscribing…</> : <><Bell className="h-4 w-4" /> Subscribe</>}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          No spam. We'll only send issue alerts — typically 2–5 emails per week.
        </p>
      </section>
      <SiteFooter />
    </div>
  );
}
