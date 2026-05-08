import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Brain, Camera, BarChart3, Shield, Cpu } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/ai-insights")({
  head: () => ({
    meta: [
      { title: "AI-powered classification — CivicFix" },
      { name: "description", content: "How CivicFix uses AI to classify issue types and pollution severity from photos." },
      { property: "og:title", content: "AI-powered classification — CivicFix" },
      { property: "og:description", content: "See how Groq AI classifies your reports in real time." },
    ],
  }),
  component: AiInsightsPage,
});

function AiInsightsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="mx-auto max-w-4xl px-5 py-16">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent/20 text-accent-foreground">
            <Sparkles className="h-6 w-6" />
          </span>
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight">AI insights</h1>
            <p className="mt-1 text-muted-foreground">How we use artificial intelligence to classify every report</p>
          </div>
        </div>

        <p className="mt-8 text-lg text-muted-foreground">
          Every photo you upload runs through <strong className="text-foreground">Groq Llama 3.2 Vision</strong> —
          our AI inspects the image and suggests a category, severity level, and a short description. No data is stored
          longer than necessary.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {[
            { icon: Camera, title: "Photo analysis", body: "The AI looks at visual cues — cracks, smoke, waste, light conditions — to determine what kind of issue you're facing." },
            { icon: Brain, title: "Category detection", body: "From potholes to air pollution, the model classifies your issue into one of 13 categories with a confidence score." },
            { icon: BarChart3, title: "Severity estimation", body: "Issues are rated from Low to Critical based on visual indicators of urgency, helping cities prioritize." },
            { icon: Shield, title: "Privacy first", body: "Photos are processed server-side and never shared. Location data is only used for geotagging your report." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card p-6">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-hero text-primary-foreground">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-3xl bg-gradient-hero p-8 text-primary-foreground">
          <Cpu className="h-8 w-8 text-accent" />
          <h2 className="mt-4 font-display text-2xl font-bold">Powered by Groq Llama 3.2 Vision</h2>
          <p className="mt-2 text-sm opacity-90">
            We use Groq's fast inference API with Llama 3.2 Vision model to analyze images in our secure Cloudflare Workers
            environment. Typical analysis takes under 2 seconds.
          </p>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
