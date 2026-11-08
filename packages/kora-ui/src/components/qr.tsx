import { useEffect, useMemo, useRef, useState } from "react";
import { CameraOff, Download } from "lucide-react";
import qrcode from "qrcode-generator";
import { Button, Spinner } from "./button";
import { cn, useLabels } from "./provider";

export type QRErrorLevel = "L" | "M" | "Q" | "H";

/** Dark modules of the QR code as rows of booleans, or null when the text does not fit in a QR code. */
export function qrMatrix(value: string, level: QRErrorLevel = "M"): boolean[][] | null {
  try {
    const qr = qrcode(0, level);
    // The library writes one byte per character: pass it the UTF-8 bytes so accents and emoji survive.
    qr.addData(String.fromCharCode(...new TextEncoder().encode(value)), "Byte");
    qr.make();
    const n = qr.getModuleCount();
    return Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => qr.isDark(r, c)));
  } catch {
    return null;
  }
}

export type QRCodeProps = {
  /** Text or link to encode. */
  value: string;
  /** Side in pixels. Default 192. */
  size?: number;
  /** Color of the modules. Keep it dark on a light background: many scanners fail on inverted codes. Default black. */
  color?: string;
  /** Default white. "transparent" for none. */
  background?: string;
  /** How much damage it survives: L 7%, M 15%, Q 25%, H 30%. Higher means denser. Default M. */
  level?: QRErrorLevel;
  /** Empty border, in modules. Scanners expect 4. Default 4. */
  margin?: number;
  /** File name: shows a button that saves the code as SVG, such as "menu-qr.svg". */
  download?: string;
  /** Name for screen readers. Default "QR code: <value>". */
  label?: string;
  className?: string;
};

/** A QR code drawn as SVG: sharp at any size and in print. */
export function QRCode({ value, size = 192, color = "#000", background = "#fff", level = "M", margin = 4, download, label, className }: QRCodeProps) {
  const t = useLabels();
  const svgRef = useRef<SVGSVGElement>(null);
  const matrix = useMemo(() => qrMatrix(value, level), [value, level]);

  if (!matrix) {
    return (
      <div role="alert" className={cn("kr:flex kr:items-center kr:justify-center kr:rounded-md kr:border kr:border-line kr:bg-danger-soft kr:p-4 kr:text-center kr:text-sm kr:text-danger", className)} style={{ width: size, height: size }}>
        {t.qrTooLong}
      </div>
    );
  }
  const n = matrix.length + margin * 2;
  let d = "";
  matrix.forEach((row, y) => row.forEach((dark, x) => { if (dark) d += `M${x + margin} ${y + margin}h1v1h-1z`; }));

  const save = () => {
    if (!svgRef.current || !download) return;
    const blob = new Blob([new XMLSerializer().serializeToString(svgRef.current)], { type: "image/svg+xml" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download });
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 0);
  };

  const svg = (
    <svg ref={svgRef} xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${n} ${n}`} width={size} height={size} role="img" aria-label={label ?? `${t.qrLabel}: ${value}`} shapeRendering="crispEdges" className={cn("kr:block kr:max-w-full kr:h-auto", !download && className)}>
      {background !== "transparent" && <rect width={n} height={n} fill={background} />}
      <path d={d} fill={color} />
    </svg>
  );
  if (!download) return svg;
  return (
    <div className={cn("kr:inline-flex kr:flex-col kr:items-center kr:gap-2", className)}>
      {svg}
      <Button variant="secondary" size="sm" onClick={save}><Download aria-hidden />{t.download}</Button>
    </div>
  );
}

// ---- Reader ------------------------------------------------------------------------------------------------------

type Detector = { detect(source: HTMLVideoElement): Promise<Array<{ rawValue: string }>> };
type DetectorClass = { new (o: { formats: string[] }): Detector; getSupportedFormats(): Promise<string[]> };

export type QRReaderStatus = "starting" | "scanning" | "denied" | "unavailable" | "failed";

/** Maps a getUserMedia error to what the person can do about it. */
export function cameraStatus(error: unknown): QRReaderStatus {
  const name = (error as { name?: string })?.name;
  if (name === "NotAllowedError" || name === "SecurityError") return "denied";
  if (name === "NotFoundError" || name === "OverconstrainedError" || name === "NotSupportedError") return "unavailable";
  return "failed";
}

/** Reads one frame with the native BarcodeDetector, or with jsQR, loaded only on browsers without it (Safari, Firefox). */
async function makeReader(): Promise<(video: HTMLVideoElement) => Promise<string | null>> {
  const Native = (globalThis as { BarcodeDetector?: DetectorClass }).BarcodeDetector;
  if (Native && (await Native.getSupportedFormats().catch((): string[] => [])).includes("qr_code")) {
    const detector = new Native({ formats: ["qr_code"] });
    return async (video) => (await detector.detect(video))[0]?.rawValue ?? null;
  }
  const { default: jsQR } = await import("jsqr");
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  return async (video) => {
    if (!ctx || !video.videoWidth) return null;
    const scale = Math.min(1, 640 / video.videoWidth);
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return jsQR(data, width, height, { inversionAttempts: "dontInvert" })?.data ?? null;
  };
}

export type QRReaderProps = {
  /** Called with the text of each code read. The same code again is reported after 2 seconds. */
  onDecode: (text: string) => void;
  /** Called when the camera cannot start, with the reason. */
  onError?: (status: Exclude<QRReaderStatus, "starting" | "scanning">, error: unknown) => void;
  "aria-label"?: string;
  className?: string;
};

/** Reads QR codes with the back camera. The camera turns off when the reader leaves the page. */
export function QRReader({ onDecode, onError, "aria-label": ariaLabel, className }: QRReaderProps) {
  const t = useLabels();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<QRReaderStatus>("starting");
  const [attempt, setAttempt] = useState(0);
  const handlers = useRef({ onDecode, onError });
  handlers.current = { onDecode, onError };

  useEffect(() => {
    let stream: MediaStream | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;
    let last = { text: "", at: 0 };
    setStatus("starting");

    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw Object.assign(new Error("No camera API"), { name: "NotSupportedError" });
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
        if (stopped) return stream.getTracks().forEach((track) => track.stop());
        const video = videoRef.current!;
        video.srcObject = stream;
        await video.play();
        const read = await makeReader();
        if (stopped) return;
        setStatus("scanning");
        const tick = async () => {
          if (stopped) return;
          const text = await read(video).catch(() => null);
          const now = Date.now();
          if (text && !stopped && (text !== last.text || now - last.at > 2000)) {
            last = { text, at: now };
            handlers.current.onDecode(text);
          }
          timer = setTimeout(tick, 150);
        };
        tick();
      } catch (error) {
        if (stopped) return;
        const s = cameraStatus(error) as Exclude<QRReaderStatus, "starting" | "scanning">;
        setStatus(s);
        handlers.current.onError?.(s, error);
      }
    })();

    return () => {
      stopped = true;
      clearTimeout(timer);
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [attempt]);

  const message = { starting: t.cameraStarting, scanning: "", denied: t.cameraDenied, unavailable: t.cameraUnavailable, failed: t.cameraFailed }[status];
  return (
    <div role="group" aria-label={ariaLabel ?? t.qrReaderLabel} className={cn("kr:relative kr:aspect-square kr:w-full kr:max-w-sm kr:overflow-hidden kr:rounded-lg kr:bg-black", className)}>
      <video ref={videoRef} muted playsInline aria-hidden className={cn("kr:size-full kr:object-cover", status !== "scanning" && "kr:invisible")} />
      {status === "scanning" && (
        // The frame to aim with: four corners.
        <span aria-hidden className="kr:pointer-events-none kr:absolute kr:inset-[18%]">
          {["kr:top-0 kr:left-0 kr:border-t-3 kr:border-l-3 kr:rounded-tl-md", "kr:top-0 kr:right-0 kr:border-t-3 kr:border-r-3 kr:rounded-tr-md", "kr:bottom-0 kr:left-0 kr:border-b-3 kr:border-l-3 kr:rounded-bl-md", "kr:bottom-0 kr:right-0 kr:border-b-3 kr:border-r-3 kr:rounded-br-md"].map((c) => (
            <span key={c} className={cn("kr:absolute kr:size-8 kr:border-white", c)} />
          ))}
        </span>
      )}
      <div role="status" className={cn("kr:absolute kr:inset-0 kr:flex kr:flex-col kr:items-center kr:justify-center kr:gap-3 kr:p-6 kr:text-center kr:text-sm kr:text-white", status === "scanning" && "kr:sr-only")}>
        {status === "starting" && <Spinner />}
        {(status === "denied" || status === "unavailable" || status === "failed") && <CameraOff aria-hidden className="kr:size-6 kr:opacity-80" />}
        {message && <p className="kr:max-w-64">{message}</p>}
        {(status === "denied" || status === "failed") && (
          <Button variant="secondary" size="sm" onClick={() => setAttempt((a) => a + 1)}>{t.retry}</Button>
        )}
      </div>
    </div>
  );
}
