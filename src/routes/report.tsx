import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Camera,
  Loader2,
  LocateFixed,
  MapPin,
  Send,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  X,
  Plus,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CATEGORIES, IssueCategory, SEVERITY_COLOR, SEVERITY_LABEL } from "@/lib/issues";
import { issuesStore, useIssues } from "@/lib/issues-store";
import { analyzePhoto, type PhotoAnalysis } from "@/lib/analyze-photo.functions";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Report an issue — CivicFix" },
      { name: "description", content: "File a new neighborhood issue report in 30 seconds." },
      { property: "og:title", content: "Report an issue — CivicFix" },
      {
        property: "og:description",
        content: "File a new neighborhood issue report in 30 seconds.",
      },
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
  const [photos, setPhotos] = useState<string[]>([]);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<"idle" | "locating" | "ok" | "error">("idle");
  const [geoError, setGeoError] = useState<string>("");
  const [aiStatus, setAiStatus] = useState<"idle" | "analyzing" | "ok" | "error">("idle");
  const [aiError, setAiError] = useState<string>("");
  const [analysis, setAnalysis] = useState<PhotoAnalysis | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const runAnalyze = useServerFn(analyzePhoto);
  const issues = useIssues();

  async function onPhoto(file: File) {
    const dataUrl: string = await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = () => reject(r.error);
      r.readAsDataURL(file);
    });
    const newPhotos = [...photos, dataUrl];
    setPhotos(newPhotos);
    setAiStatus("analyzing");
    setAiError("");
    setAnalysis(null);
    try {
      const results: PhotoAnalysis[] = [];
      for (const photoUrl of newPhotos) {
        const result = await runAnalyze({
          data: { imageDataUrl: photoUrl, description },
        });
        results.push(result);
      }
      const worst = results.reduce((prev, curr) => {
        const severityScore = { none: 0, low: 1, medium: 2, high: 3, critical: 4 };
        return (severityScore[curr.severity] || 0) >= (severityScore[prev.severity] || 0)
          ? curr
          : prev;
      });
      setAnalysis(worst);
      if (CATEGORIES.includes(worst.category as IssueCategory)) {
        setCategory(worst.category as IssueCategory);
      }
      setTitle((t) => t || worst.title);
      setDescription((d) => d || worst.description);
      setAiStatus("ok");
    } catch (e: any) {
      setAiStatus("error");
      setAiError(e?.message ?? "AI analysis failed");
    }
  }

  function removePhoto(index: number) {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
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

  useEffect(() => {
    detectLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setValidationError(null);

    const currentSeverity = analysis?.severity ?? "medium";

    // Check for fake report (stock photo or AI-generated)
    if (analysis && !analysis.isGenuine) {
      setValidationError(
        `Report rejected: ${analysis.genuineReason}. Please upload an original photo taken on-site.`,
      );
      return;
    }

    // Check for "none" severity - reject reports with no meaningful severity
    if (analysis && analysis.severity === "none") {
      setValidationError(
        "Report rejected: The uploaded image does not appear to show a valid civic issue. Please upload a photo of an actual problem (pothole, trash, damage, etc.).",
      );
      return;
    }

    // Check for duplicates using AI category + location + time
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const currentLat = coords?.lat ?? 40.73 + Math.random() * 0.05;
    const currentLng = coords?.lng ?? -74 + Math.random() * 0.05;
    const currentCategory = analysis?.category || category;

    console.log(
      "[Duplicate Check] Current category:",
      currentCategory,
      "Location:",
      currentLat.toFixed(4),
      currentLng.toFixed(4),
    );

    const duplicate = issues.find((issue) => {
      const issueDate = new Date(issue.createdAt).getTime();
      if (issueDate < oneHourAgo) return false;

      // Check if same category (case-insensitive comparison)
      const issueCatLower = issue.category?.toLowerCase() || "";
      const currentCatLower = currentCategory?.toLowerCase() || "";
      const sameCategory =
        issueCatLower === currentCatLower ||
        issue.aiReasoning?.toLowerCase().includes(currentCatLower) ||
        currentCatLower.includes(issueCatLower);

      // Check location proximity (within ~100 meters)
      const distance = Math.sqrt(
        Math.pow((issue.lat - currentLat) * 111000, 2) +
          Math.pow((issue.lng - currentLng) * 111000 * Math.cos((currentLat * Math.PI) / 180), 2),
      );

      console.log(
        "[Duplicate Check] Comparing:",
        issue.id,
        "Category match:",
        sameCategory,
        "Distance:",
        distance.toFixed(1),
        "m",
      );

      return sameCategory && distance < 100;
    });

    if (duplicate) {
      setValidationError(
        `Duplicate report detected! A similar issue (${duplicate.id}) of type "${duplicate.category}" was reported within the last hour near this location. Please check the existing report.`,
      );
      return;
    }

    const id = `FIX-${1100 + Math.floor(Math.random() * 900)}`;

    const issue = {
      id,
      title: title.trim(),
      description: description.trim(),
      category,
      status: "open" as const,
      address: address.trim() || "Unspecified location",
      lat: coords?.lat ?? 40.73 + Math.random() * 0.05,
      lng: coords?.lng ?? -74 + Math.random() * 0.05,
      createdAt: new Date().toISOString(),
      upvotes: 1,
      reporter: reporter.trim() || "Anonymous neighbor",
      image: photos[0],
      severity: currentSeverity,
      aiReasoning: analysis?.reasoning,
      aiVerification: analysis
        ? {
            isGenuine: analysis.isGenuine,
            genuineReason: analysis.genuineReason,
            descriptionMatch: analysis.descriptionMatch,
            descriptionMatchReason: analysis.descriptionMatchReason,
            confidence: analysis.confidence,
          }
        : undefined,
      updates: [],
    };

    issuesStore.add(issue);

    // Auto-notify for critical/high severity
    if (currentSeverity === "critical" || currentSeverity === "high") {
      console.log(`[Auto-notify] Sending ${currentSeverity} notification for ${id}...`);
      try {
        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access_key: "26d70697-529d-4c6e-9167-d3f6ec2c84e3",
            to: "priyanshuhacker075@gmail.com",
            subject: `[CivicFix] URGENT: ${currentSeverity.toUpperCase()} Severity Report - ${id}`,
            name: "CivicFix Auto-Notification",
            message: `
🚨 AUTOMATIC NOTIFICATION - ${currentSeverity.toUpperCase()} SEVERITY

A new ${currentSeverity} severity issue has been reported and requires immediate attention.

REPORT DETAILS:
- ID: ${id}
- Category: ${category}
- Severity: ${currentSeverity.toUpperCase()}
- Location: ${issue.address}
- Reporter: ${issue.reporter}
- Coordinates: ${issue.lat.toFixed(5)}, ${issue.lng.toFixed(5)}
- Reported: ${new Date(issue.createdAt).toLocaleString()}

TITLE: ${issue.title}
DESCRIPTION: ${issue.description}

${issue.aiReasoning ? `AI ANALYSIS: ${issue.aiReasoning}` : ""}

Please take immediate action on this report.
            `.trim(),
          }),
        });
        const data = await response.json();
        console.log("[Auto-notify] Response:", data);

        if (data.success) {
          issuesStore.addUpdate(
            id,
            `Auto-notification sent for ${currentSeverity} severity`,
            "System",
          );
          console.log(`[Auto-notify] ✓ Notification sent successfully for ${id}`);
        } else {
          console.error("[Auto-notify] Failed:", data.message);
        }
      } catch (error) {
        console.error("[Auto-notify] Error:", error);
      }
    } else {
      console.log(`[Auto-notify] Skipped - severity is ${currentSeverity} (not critical/high)`);
    }

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

        <form
          onSubmit={submit}
          className="mt-10 space-y-7 rounded-3xl border border-border bg-card p-6 shadow-elegant md:p-8"
        >
          {validationError && (
            <div className="rounded-xl border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
              <strong>Report Rejected:</strong> {validationError}
            </div>
          )}
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
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputCls}
            />
          </Field>

          <Field label="What's going on?">
            <textarea
              required
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${inputCls} resize-none`}
              placeholder="Describe size, hazard, time of day, anything that helps a crew find and prioritize it."
            />
          </Field>

          <Field label="Location" icon={<MapPin className="h-4 w-4" />}>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={inputCls}
                placeholder="Detecting your location..."
              />
              <button
                type="button"
                onClick={detectLocation}
                disabled={geoStatus === "locating"}
                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-semibold transition hover:border-foreground/40 disabled:opacity-60"
              >
                {geoStatus === "locating" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Locating
                  </>
                ) : (
                  <>
                    <LocateFixed className="h-4 w-4" /> Use my location
                  </>
                )}
              </button>
            </div>
            {geoStatus === "ok" && coords && (
              <p className="mt-2 text-xs text-success">
                Pinned to {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)} — adjust the address
                above if needed.
              </p>
            )}
            {geoStatus === "error" && <p className="mt-2 text-xs text-destructive">{geoError}</p>}
          </Field>

          <Field
            label="Photos (optional)"
            hint="Our AI inspects each photo, verifies authenticity, and assesses severity. You can add up to 5 photos."
          >
            <div className="flex flex-wrap gap-3">
              {photos.map((photo, index) => (
                <div key={index} className="relative group">
                  <img
                    src={photo}
                    alt={`preview ${index + 1}`}
                    className="h-32 w-32 rounded-xl object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute -top-2 -right-2 rounded-full bg-destructive p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {photos.length < 5 && (
                <label className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border bg-surface text-sm text-muted-foreground transition hover:border-accent hover:text-foreground">
                  <Plus className="h-5 w-5" />
                  Add photo
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      files.slice(0, 5 - photos.length).forEach((file) => onPhoto(file));
                    }}
                  />
                </label>
              )}
            </div>

            {aiStatus === "analyzing" && (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> AI is analyzing the photo…
              </div>
            )}
            {aiStatus === "error" && <p className="mt-3 text-xs text-destructive">{aiError}</p>}
            {aiStatus === "ok" && analysis && (
              <div className="mt-3 space-y-3">
                {/* Classification */}
                <div className="rounded-xl border border-border bg-surface p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5 text-accent" /> AI assessment
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-foreground px-2.5 py-1 text-xs font-semibold text-background">
                      {analysis.category}
                    </span>
                    <span
                      className="rounded-full px-2.5 py-1 text-xs font-bold text-white"
                      style={{ background: SEVERITY_COLOR[analysis.severity] }}
                    >
                      {SEVERITY_LABEL[analysis.severity]} severity
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {(analysis.confidence * 100).toFixed(0)}% confidence
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{analysis.reasoning}</p>
                </div>

                {/* Authenticity check */}
                <div
                  className={`rounded-xl border p-4 ${
                    analysis.isGenuine
                      ? "border-success/30 bg-success/5"
                      : "border-destructive/30 bg-destructive/5"
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
                    {analysis.isGenuine ? (
                      <>
                        <ShieldCheck className="h-3.5 w-3.5 text-success" /> Photo verified
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="h-3.5 w-3.5 text-destructive" /> Photo flagged
                      </>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{analysis.genuineReason}</p>
                </div>

                {/* Description match */}
                <div
                  className={`rounded-xl border p-4 ${
                    analysis.descriptionMatch
                      ? "border-success/30 bg-success/5"
                      : "border-destructive/30 bg-destructive/5"
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
                    {analysis.descriptionMatch ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-success" /> Description matches
                        photo
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-3.5 w-3.5 text-destructive" /> Description may
                        not match photo
                      </>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {analysis.descriptionMatchReason}
                  </p>
                </div>
              </div>
            )}
          </Field>

          <Field label="Your name (optional)">
            <input
              value={reporter}
              onChange={(e) => setReporter(e.target.value)}
              className={inputCls}
              placeholder="Anonymous neighbor"
            />
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
function Field({
  label,
  hint,
  icon,
  children,
}: {
  label: string;
  hint?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-center gap-1.5 text-sm font-semibold">
        {icon}
        {label}
      </span>
      {hint && <span className="mt-0.5 block text-xs text-muted-foreground">{hint}</span>}
      <div className="mt-2">{children}</div>
    </label>
  );
}
