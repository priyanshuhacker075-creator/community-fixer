import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Camera, Loader2, LocateFixed, MapPin, Send, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CATEGORIES, IssueCategory, PollutionSeverity, SEVERITY_COLOR, SEVERITY_LABEL } from "@/lib/issues";
import { issuesStore } from "@/lib/issues-store";
import { analyzePhoto, type PhotoAnalysis } from "@/lib/analyze-photo.functions";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Report an issue — CivicFix" },
      { name: "description", content: "File a new neighborhood issue report in 30 seconds." },
      { property: "og:title", content: "Report an issue — CivicFix" },
      { property: "og:description", content: "File a new neighborhood issue report in 30 seconds." },
    ],
  }),
  component: ReportPage,
});

function ReportPage() {
  const navigate = useNavigate();
  const [category, setCategory] = useState<IssueCategory>("Pothole");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [reporter, setReporter] = useState("");
  const [photo, setPhoto] = useState<string | undefined>();
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<"idle" | "locating" | "ok" | "error">("idle");
  const [geoError, setGeoError] = useState<string>("");
  const [aiStatus, setAiStatus] = useState<"idle" | "analyzing" | "ok" | "error">("idle");
  const [aiError, setAiError] = useState<string>("");
  const [analysis, setAnalysis] = useState<PhotoAnalysis | null>(null);
  const [severity, setSeverity] = useState<PollutionSeverity | undefined>();
  const runAnalyze = useServerFn(analyzePhoto);

  async function onPhoto(file: File) {
    const dataUrl: string = await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = () => reject(r.error);
      r.readAsDataURL(file);
    });
    setPhoto(dataUrl);
    setAiStatus("analyzing");
    setAiError("");
    setAnalysis(null);
    try {
      const result = await runAnalyze({ data: { imageDataUrl: dataUrl } });
      setAnalysis(result);
      setSeverity(result.severity);
      if (CATEGORIES.includes(result.category as IssueCategory)) {
        setCategory(result.category as IssueCategory);
      }
      setTitle((t) => t || result.title);
      setDescription((d) => d || result.description);
      setAiStatus("ok");
    } catch (e: any) {
      setAiStatus("error");
      setAiError(e?.message ?? "AI analysis failed");
    }
  }

  async function detectLocation() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoStatus("error");
      setGeoError("Your browser doesn't support location services.");
      return;
    }
    setGeoStatus("locating");
    setGeoError("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { Accept: "application/json" } },
          );
          const data = await res.json();
          if (data?.display_name) setAddress(data.display_name);
          else setAddress(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        } catch {
          setAddress(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        }
        setGeoStatus("ok");
      },
      (err) => {
        setGeoStatus("error");
        setGeoError(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied. You can type the address instead."
            : "Couldn't get your location. You can type the address instead.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }

  // Auto-detect on first load
  useEffect(() => {
    detectLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const id = `FIX-${1100 + Math.floor(Math.random() * 900)}`;
    issuesStore.add({
      id,
      title: title.trim(),
      description: description.trim(),
      category,
      status: "open",
      address: address.trim() || "Unspecified location",
      lat: coords?.lat ?? 40.73 + Math.random() * 0.05,
      lng: coords?.lng ?? -74 + Math.random() * 0.05,
      createdAt: new Date().toISOString(),
      upvotes: 1,
      reporter: reporter.trim() || "Anonymous neighbor",
      image: photo,
      severity: severity ?? analysis?.severity,
      aiReasoning: analysis?.reasoning,
      updates: [],
    });
    navigate({ to: "/issues/$id", params: { id } });
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-5 py-12">
        <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold text-accent-foreground">
          New report
        </span>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
          Tell us what you see
        </h1>
        <p className="mt-2 text-muted-foreground">A short, specific report gets fixed faster.</p>

        <form onSubmit={submit} className="mt-10 space-y-7 rounded-3xl border border-border bg-card p-6 shadow-elegant md:p-8">
          {/* Category chips */}
          <div>
            <Label>Category</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                    category === c
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-background hover:border-foreground/40"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <Field label="Title" hint="Short and specific. ex: 'Crater pothole at Elm & 4th'">
            <input required value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
          </Field>

          <Field label="What's going on?">
            <textarea
              required rows={5} value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${inputCls} resize-none`}
              placeholder="Describe size, hazard, time of day, anything that helps a crew find and prioritize it."
            />
          </Field>

          <Field label="Location" icon={<MapPin className="h-4 w-4" />}>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                required value={address} onChange={(e) => setAddress(e.target.value)}
                className={inputCls}
                placeholder="Detecting your location..."
              />
              <button
                type="button"
                onClick={detectLocation}
                disabled={geoStatus === "locating"}
                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-semibold transition hover:border-foreground/40 disabled:opacity-60"
              >
                {geoStatus === "locating"
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Locating</>
                  : <><LocateFixed className="h-4 w-4" /> Use my location</>}
              </button>
            </div>
            {geoStatus === "ok" && coords && (
              <p className="mt-2 text-xs text-success">
                Pinned to {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)} — adjust the address above if needed.
              </p>
            )}
            {geoStatus === "error" && (
              <p className="mt-2 text-xs text-destructive">{geoError}</p>
            )}
          </Field>

          <Field label="Photo (optional)">
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-surface px-4 py-8 text-sm text-muted-foreground transition hover:border-accent hover:text-foreground">
              <Camera className="h-5 w-5" />
              {photo ? "Photo attached — replace?" : "Drop a photo or click to upload"}
              <input type="file" accept="image/*" className="hidden"
                onChange={(e) => e.target.files?.[0] && onPhoto(e.target.files[0])} />
            </label>
            {photo && <img src={photo} alt="preview" className="mt-3 h-40 w-full rounded-xl object-cover" />}
          </Field>

          <Field label="Your name (optional)">
            <input value={reporter} onChange={(e) => setReporter(e.target.value)} className={inputCls} placeholder="Anonymous neighbor" />
          </Field>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-3 text-sm font-semibold text-background transition hover:opacity-90 md:w-auto md:px-8"
          >
            <Send className="h-4 w-4" /> Submit report
          </button>
        </form>
      </section>
      <SiteFooter />
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-ring/40";

function Label({ children }: { children: React.ReactNode }) {
  return <span className="text-sm font-semibold">{children}</span>;
}
function Field({ label, hint, icon, children }: { label: string; hint?: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="flex items-center gap-1.5 text-sm font-semibold">{icon}{label}</span>
      {hint && <span className="mt-0.5 block text-xs text-muted-foreground">{hint}</span>}
      <div className="mt-2">{children}</div>
    </label>
  );
}
