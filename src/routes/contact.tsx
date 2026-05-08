import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Send, Loader2, MapPin, Clock, MessageSquare } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact us — CivicFix" },
      { name: "description", content: "Get in touch with the CivicFix team." },
      { property: "og:title", content: "Contact us — CivicFix" },
      { property: "og:description", content: "Reach the CivicFix team." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: "26d70697-529d-4c6e-9167-d3f6ec2c84e3",
          to: "priyanshuhacker075@gmail.com",
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setSent(true);
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setError(data.message || "Failed to send message");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="mx-auto max-w-4xl px-5 py-16">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-warm text-accent-foreground">
            <Mail className="h-6 w-6" />
          </span>
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight">Contact</h1>
            <p className="mt-1 text-muted-foreground">We'd love to hear from you</p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div>
            {sent ? (
              <div className="rounded-3xl border border-border bg-card p-8 text-center">
                <span className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-success/10 text-success">
                  <Send className="h-6 w-6" />
                </span>
                <h2 className="mt-4 font-display text-xl font-bold">Message sent!</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  We'll get back to you within 24 hours.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-6 rounded-full border border-border bg-card px-5 py-2 text-sm font-semibold hover:bg-muted"
                >
                  Send another
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="space-y-5 rounded-3xl border border-border bg-card p-6 shadow-elegant md:p-8"
              >
                <label className="block">
                  <span className="text-sm font-semibold">Name</span>
                  <input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold">Email</span>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold">Subject</span>
                  <input
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold">Message</span>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="mt-2 w-full resize-none rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                  />
                </label>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-3 text-sm font-semibold text-background transition hover:opacity-90 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Send message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          <div className="space-y-4">
            {[
              {
                icon: Mail,
                title: "Email",
                body: "priyanshuhacker075@gmail.com",
                desc: "We reply within 24 hours",
              },
              {
                icon: MessageSquare,
                title: "GitHub",
                body: "github.com/civicfix",
                desc: "Open issues and PRs welcome",
              },
              {
                icon: MapPin,
                title: "Location",
                body: "GBPIET Ghurdauri",
                desc: "Uttrakhand, India",
              },
              {
                icon: Clock,
                title: "Response time",
                body: "< 24 hours",
                desc: "Usually much faster",
              },
            ].map((c) => (
              <div
                key={c.title}
                className="flex gap-4 rounded-2xl border border-border bg-card p-5"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-hero text-primary-foreground">
                  <c.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-semibold">{c.title}</h3>
                  <p className="text-sm text-foreground">{c.body}</p>
                  <p className="text-xs text-muted-foreground">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
