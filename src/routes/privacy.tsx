import { createFileRoute } from "@tanstack/react-router";
import { Shield, Eye, Lock, Trash2, MapPin, UserCheck } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy policy — CivicFix" },
      { name: "description", content: "How CivicFix handles your personal data, location, and photos." },
      { property: "og:title", content: "Privacy policy — CivicFix" },
      { property: "og:description", content: "Your data is yours. Here's how we protect it." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-5 py-16">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-hero text-primary-foreground">
            <Shield className="h-6 w-6" />
          </span>
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight">Privacy</h1>
            <p className="mt-1 text-muted-foreground">How we handle your data — transparently, like everything else.</p>
          </div>
        </div>

        <p className="mt-8 text-muted-foreground">
          CivicFix is built on trust. We collect the minimum data needed to make neighborhood reporting work,
          and we never sell or share your personal information.
        </p>

        <div className="mt-10 space-y-6">
          {[
            { icon: MapPin, title: "Location", body: "Your exact coordinates are used only to place the pin on the map and are never stored alongside your identity. You can report without enabling location." },
            { icon: Eye, title: "Photos", body: "Images are processed by our AI for classification and then stored as part of the public report. No facial recognition or biometric analysis is performed." },
            { icon: Lock, title: "Account data", body: "CivicFix does not require an account. Your email is only collected if you opt into alerts, and you can unsubscribe at any time." },
            { icon: Trash2, title: "Retention", body: "Issue data is retained for public record. Personal data (email, name) is deleted within 30 days of a resolution or unsubscribe request." },
            { icon: UserCheck, title: "Anonymous reporting", body: "You can file a report with any name you choose — including \"Anonymous neighbor.\" No identity verification is required." },
          ].map((s) => (
            <div key={s.title} className="flex gap-4 rounded-2xl border border-border bg-card p-5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-warm text-accent-foreground">
                <s.icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-surface p-6 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">Contact our data protection officer</p>
          <p className="mt-1">privacy@civicfix.org — we respond within 48 hours.</p>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
