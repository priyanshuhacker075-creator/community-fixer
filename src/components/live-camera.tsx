import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Camera, Loader2, X, CircleDot, Sparkles, Zap } from "lucide-react";
import { analyzePhoto, type PhotoAnalysis } from "@/lib/analyze-photo.functions";
import { SEVERITY_COLOR, SEVERITY_LABEL } from "@/lib/issues";

type Props = {
  onCapture: (dataUrl: string, analysis: PhotoAnalysis) => void;
  onClose: () => void;
  description?: string;
};

const SCAN_INTERVAL_MS = 3500;

export function LiveCamera({ onCapture, onClose, description }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastFrameRef = useRef<string | null>(null);
  const runAnalyze = useServerFn(analyzePhoto);

  const [error, setError] = useState<string>("");
  const [ready, setReady] = useState(false);
  const [analysis, setAnalysis] = useState<PhotoAnalysis | null>(null);
  const [scanning, setScanning] = useState(false);
  const [facing, setFacing] = useState<"environment" | "user">("environment");

  // Start camera
  useEffect(() => {
    let cancelled = false;
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facing }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setReady(true);
      } catch (e: any) {
        setError(e?.message ?? "Camera access denied. Please allow camera permission.");
      }
    }
    start();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [facing]);

  // Periodic AI scan
  useEffect(() => {
    if (!ready) return;
    let stop = false;
    let timer: any;

    const tick = async () => {
      if (stop) return;
      const v = videoRef.current;
      const c = canvasRef.current;
      if (!v || !c || v.readyState < 2) {
        timer = setTimeout(tick, 500);
        return;
      }
      const w = v.videoWidth || 640;
      const h = v.videoHeight || 480;
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(v, 0, 0, w, h);
      const dataUrl = c.toDataURL("image/jpeg", 0.7);
      lastFrameRef.current = dataUrl;

      try {
        setScanning(true);
        const result = await runAnalyze({ data: { imageDataUrl: dataUrl, description } });
        if (!stop) setAnalysis(result);
      } catch (e) {
        // swallow
      } finally {
        if (!stop) {
          setScanning(false);
          timer = setTimeout(tick, SCAN_INTERVAL_MS);
        }
      }
    };

    timer = setTimeout(tick, 800);
    return () => {
      stop = true;
      clearTimeout(timer);
    };
  }, [ready, runAnalyze, description]);

  function captureNow() {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c) return;
    const w = v.videoWidth || 640;
    const h = v.videoHeight || 480;
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(v, 0, 0, w, h);
    const dataUrl = c.toDataURL("image/jpeg", 0.92);
    if (analysis) {
      onCapture(dataUrl, analysis);
    } else {
      // capture without classification — caller will run analyze
      onCapture(dataUrl, {
        category: "Other",
        severity: "low",
        confidence: 0.5,
        title: "Issue captured",
        description: description ?? "",
        reasoning: "Live capture; AI scan still in progress.",
        isGenuine: true,
        genuineReason: "Live camera capture.",
        descriptionMatch: true,
        descriptionMatchReason: "",
      });
    }
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 p-2 sm:p-4">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-2 text-white">
            <Camera className="h-4 w-4" />
            <span className="text-sm font-semibold">Live AI detection</span>
            {scanning && <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFacing((f) => (f === "environment" ? "user" : "environment"))}
              className="rounded-full bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20"
            >
              Flip
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-white/10 p-1.5 text-white hover:bg-white/20"
              aria-label="Close camera"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="relative aspect-[4/3] w-full bg-black">
          {error ? (
            <div className="flex h-full items-center justify-center p-6 text-center text-sm text-white/80">
              {error}
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                playsInline
                muted
                className="h-full w-full object-cover"
              />
              {/* HUD */}
              <div className="pointer-events-none absolute inset-0">
                {/* corner brackets */}
                <div className="absolute left-3 top-3 h-6 w-6 border-l-2 border-t-2 border-white/70" />
                <div className="absolute right-3 top-3 h-6 w-6 border-r-2 border-t-2 border-white/70" />
                <div className="absolute bottom-3 left-3 h-6 w-6 border-b-2 border-l-2 border-white/70" />
                <div className="absolute bottom-3 right-3 h-6 w-6 border-b-2 border-r-2 border-white/70" />
                {/* Scanning indicator */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur">
                  <CircleDot className={`h-3 w-3 ${scanning ? "text-accent animate-pulse" : "text-white/60"}`} />
                  {scanning ? "Scanning…" : ready ? "Live" : "Starting camera…"}
                </div>
                {/* Detection overlay */}
                {analysis && (
                  <div className="absolute bottom-3 left-3 right-3 rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-white backdrop-blur">
                    <div className="flex flex-wrap items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-accent" />
                      <span className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide">
                        {analysis.category}
                      </span>
                      <span
                        className="rounded-full px-2 py-0.5 text-[11px] font-bold"
                        style={{ background: SEVERITY_COLOR[analysis.severity] }}
                      >
                        {SEVERITY_LABEL[analysis.severity]}
                      </span>
                      <span className="text-[11px] text-white/70">
                        {(analysis.confidence * 100).toFixed(0)}% confidence
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-[11px] text-white/70">{analysis.reasoning}</p>
                  </div>
                )}
              </div>
            </>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-white/10 bg-black px-4 py-3">
          <p className="hidden flex-1 text-[11px] text-white/60 sm:block">
            Hold steady on the issue. AI scans every {(SCAN_INTERVAL_MS / 1000).toFixed(1)}s.
          </p>
          <button
            type="button"
            onClick={captureNow}
            disabled={!ready}
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black transition hover:bg-white/90 disabled:opacity-50"
          >
            <Zap className="h-4 w-4" /> Capture &amp; use frame
          </button>
        </div>
      </div>
    </div>
  );
}
