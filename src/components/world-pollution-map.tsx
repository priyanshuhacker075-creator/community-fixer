import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Issue, SEVERITY_COLOR, SEVERITY_LABEL, PollutionSeverity } from "@/lib/issues";

const POLLUTION_CATEGORIES = new Set([
  "Fire", "Smoke", "Dumping", "Air Pollution", "Water Pollution", "Trash",
]);

export function WorldPollutionMap({ issues }: { issues: Issue[] }) {
  const [mounted, setMounted] = useState(false);
  const [Comp, setComp] = useState<null | {
    MapContainer: any; TileLayer: any; CircleMarker: any; Popup: any; Tooltip: any;
  }>(null);

  useEffect(() => {
    setMounted(true);
    Promise.all([
      import("react-leaflet"),
      import("leaflet/dist/leaflet.css"),
    ]).then(([rl]) => {
      setComp({
        MapContainer: rl.MapContainer,
        TileLayer: rl.TileLayer,
        CircleMarker: rl.CircleMarker,
        Popup: rl.Popup,
        Tooltip: rl.Tooltip,
      });
    });
  }, []);

  // Plot every report; default low severity when AI didn't classify it.
  const points = issues
    .filter((i) => typeof i.lat === "number" && typeof i.lng === "number")
    .map((i) => ({ ...i, severity: (i.severity ?? (POLLUTION_CATEGORIES.has(i.category) ? "medium" : "low")) as PollutionSeverity }));
  const counts = points.reduce<Record<PollutionSeverity, number>>(
    (acc, i) => { const s = i.severity ?? "none"; acc[s] = (acc[s] ?? 0) + 1; return acc; },
    { none: 0, low: 0, medium: 0, high: 0, critical: 0 },
  );

  const radius = (s?: PollutionSeverity) =>
    ({ critical: 14, high: 11, medium: 9, low: 7, none: 5 }[s ?? "none"]);

  return (
    <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-elegant">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight">Live pollution map</h2>
          <p className="text-xs text-muted-foreground">
            AI-classified reports plotted worldwide. Color = severity.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {(["low","medium","high","critical"] as PollutionSeverity[]).map((s) => (
            <span key={s} className="inline-flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full" style={{ background: SEVERITY_COLOR[s] }} />
              <span className="font-medium">{SEVERITY_LABEL[s]}</span>
              <span className="text-muted-foreground">({counts[s] ?? 0})</span>
            </span>
          ))}
        </div>
      </div>

      <div className="h-[380px] w-full bg-muted relative [isolation:isolate]">
        {mounted && Comp ? (
          <Comp.MapContainer
            center={[20, 0] as [number, number]}
            zoom={2}
            minZoom={2}
            worldCopyJump
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
          >
            <Comp.TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {points.map((i) => (
              <Comp.CircleMarker
                key={i.id}
                center={[i.lat, i.lng] as [number, number]}
                radius={radius(i.severity)}
                pathOptions={{
                  color: SEVERITY_COLOR[i.severity ?? "none"],
                  fillColor: SEVERITY_COLOR[i.severity ?? "none"],
                  fillOpacity: 0.65,
                  weight: 2,
                }}
              >
                <Comp.Tooltip>{i.category} · {SEVERITY_LABEL[i.severity ?? "none"]}</Comp.Tooltip>
                <Comp.Popup>
                  <div className="space-y-1">
                    <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: SEVERITY_COLOR[i.severity ?? "none"] }}>
                      {SEVERITY_LABEL[i.severity ?? "none"]} · {i.category}
                    </div>
                    <div className="font-semibold">{i.title}</div>
                    <div className="text-xs opacity-70">{i.address}</div>
                    <Link to="/issues/$id" params={{ id: i.id }} className="text-xs font-semibold underline">
                      View report →
                    </Link>
                  </div>
                </Comp.Popup>
              </Comp.CircleMarker>
            ))}
          </Comp.MapContainer>
        ) : (
          <div className="grid h-full place-items-center text-sm text-muted-foreground">Loading map…</div>
        )}
      </div>
    </div>
  );
}
