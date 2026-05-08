import { createFileRoute, Link } from "@tanstack/react-router";
import { HelpCircle, ChevronDown } from "lucide-react";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Help & FAQ — CivicFix" },
      { name: "description", content: "Common questions about reporting and tracking neighborhood issues." },
      { property: "og:title", content: "Help & FAQ — CivicFix" },
      { property: "og:description", content: "Find answers to frequently asked questions about CivicFix." },
    ],
  }),
  component: FaqPage,
});

const FAQS = [
  {
    q: "How do I report an issue?",
    a: "Click the \"Report\" button in the header, fill in the details (or upload a photo for AI analysis), and submit. It takes about 30 seconds.",
  },
  {
    q: "What kind of issues can I report?",
    a: "Anything from potholes, broken streetlights, graffiti, trash, and sidewalk damage to air and water pollution, fire hazards, and more — 13 categories in total.",
  },
  {
    q: "Is my personal information private?",
    a: "Yes. Your email and exact location are never shared publicly. You can report anonymously. See our Privacy page for details.",
  },
  {
    q: "How does the AI analysis work?",
    a: "When you upload a photo, Google Gemini 2.5 Flash inspects it and suggests a category, severity, and description. You can override any suggestion before submitting.",
  },
  {
    q: "How are issues resolved?",
    a: "Once submitted, city agencies and public works departments can claim, update, and mark issues as resolved. Every status change is logged publicly.",
  },
  {
    q: "Can I upvote issues?",
    a: "Yes! Upvoting helps prioritize the most impactful issues. The city sees what matters most to residents.",
  },
  {
    q: "Is CivicFix free?",
    a: "Completely free for residents. We're an open-source project — contributions and partnerships are welcome.",
  },
  {
    q: "How do I contact the team?",
    a: "Head over to our Contact page or send an email. We typically respond within 24 hours.",
  },
];

function FaqPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-5 py-16">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-hero text-primary-foreground">
            <HelpCircle className="h-6 w-6" />
          </span>
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight">Help & FAQ</h1>
            <p className="mt-1 text-muted-foreground">Everything you need to know about CivicFix</p>
          </div>
        </div>

        <div className="mt-10 space-y-2">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-card overflow-hidden transition"
            >
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
              >
                <span className="font-semibold">{faq.q}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-muted-foreground transition ${
                    openIdx === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIdx === i && (
                <div className="px-6 pb-5 text-sm text-muted-foreground border-t border-border pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl bg-surface border border-border p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Still have questions?{" "}
            <Link to="/contact" className="font-semibold text-foreground underline underline-offset-2">
              Contact us
            </Link>
          </p>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
