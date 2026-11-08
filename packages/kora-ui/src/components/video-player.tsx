import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, VideoHTMLAttributes } from "react";
import { Captions, Maximize, Minimize, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { cn, useLabels } from "./provider";

export type VideoCaption = {
  /** A WebVTT file. */
  src: string;
  /** Language code, such as "es". */
  srclang: string;
  /** Name in the captions menu, such as "Español". */
  label: string;
  /** Shown from the start. */
  default?: boolean;
};

export type VideoPlayerProps = Omit<VideoHTMLAttributes<HTMLVideoElement>, "controls" | "children"> & {
  src: string;
  poster?: string;
  /** Subtitle tracks. The button turns the first default one (or the first one) on and off. */
  captions?: VideoCaption[];
  /** Name of the video for screen readers. */
  title?: string;
  className?: string;
};

/** 75 → "1:15", 3725 → "1:02:05". */
export function formatVideoTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const s = Math.floor(seconds), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${r}` : `${m}:${r}`;
}

const iconButton = "kr:flex kr:size-10 kr:shrink-0 kr:cursor-pointer kr:items-center kr:justify-center kr:rounded-md kr:text-white kr:hover:bg-white/15 kr:outline-none kr:focus-visible:outline-2 kr:focus-visible:outline-white kr:[&_svg]:size-5";

/**
 * A native video with controls in the style of the library. Keys, with the player focused: Space or K plays and
 * pauses, arrows seek 5 seconds and change the volume, M mutes, C toggles captions, F goes full screen.
 */
export function VideoPlayer({ src, poster, captions, title, className, ...videoProps }: VideoPlayerProps) {
  const t = useLabels();
  const boxRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(Boolean(videoProps.muted));
  const [volume, setVolume] = useState(1);
  const [cc, setCc] = useState(Boolean(captions?.some((c) => c.default)));
  const [full, setFull] = useState(false);
  const ccIndex = Math.max(0, captions?.findIndex((c) => c.default) ?? 0);

  useEffect(() => {
    const onChange = () => setFull(document.fullscreenElement === boxRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // Tracks load after mount: set their mode once they exist and whenever the button changes it.
  useEffect(() => {
    const tracks = videoRef.current?.textTracks;
    if (!tracks) return;
    for (let i = 0; i < tracks.length; i++) tracks[i]!.mode = cc && i === ccIndex ? "showing" : "hidden";
  }, [cc, ccIndex, captions]);

  const v = () => videoRef.current!;
  const toggle = () => (v().paused ? v().play().catch(() => {}) : v().pause());
  const seek = (to: number) => { v().currentTime = Math.min(duration || Infinity, Math.max(0, to)); };
  const setVol = (to: number) => { const x = Math.min(1, Math.max(0, to)); v().volume = x; v().muted = x === 0; };
  const toggleFull = () => {
    if (document.fullscreenElement) return void document.exitFullscreen();
    if (boxRef.current?.requestFullscreen) return void boxRef.current.requestFullscreen().catch(() => {});
    // iPhone has no element full screen, only the system player.
    (v() as HTMLVideoElement & { webkitEnterFullscreen?: () => void }).webkitEnterFullscreen?.();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const onRange = (e.target as HTMLElement).tagName === "INPUT";
    const onButton = (e.target as HTMLElement).tagName === "BUTTON";
    const actions: Record<string, () => void> = {
      " ": toggle, k: toggle, m: () => { v().muted = !v().muted; }, f: toggleFull,
      ArrowLeft: () => seek(v().currentTime - 5), ArrowRight: () => seek(v().currentTime + 5),
      ArrowUp: () => setVol(v().volume + 0.1), ArrowDown: () => setVol(v().volume - 0.1),
      ...(captions?.length ? { c: () => setCc((x) => !x) } : {}),
    };
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    // Sliders keep their own arrows, and buttons their own Space.
    if ((onRange && key.startsWith("Arrow")) || (onButton && key === " ")) return;
    const action = actions[key];
    if (!action) return;
    e.preventDefault();
    action();
  };

  const label = title ?? t.videoLabel;
  return (
    <div
      ref={boxRef}
      role="group"
      aria-label={label}
      tabIndex={0}
      onKeyDown={onKeyDown}
      data-playing={playing || undefined}
      className={cn("kr:group kr:relative kr:overflow-hidden kr:rounded-lg kr:bg-black kr:outline-none kr:focus-visible:outline-2 kr:focus-visible:outline-offset-2 kr:focus-visible:outline-accent", full && "kr:rounded-none", className)}
    >
      <video
        {...videoProps}
        ref={videoRef}
        src={src}
        poster={poster}
        playsInline
        onClick={toggle}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        onVolumeChange={(e) => { setMuted(e.currentTarget.muted); setVolume(e.currentTarget.volume); }}
        className="kr:block kr:size-full kr:object-contain"
      >
        {captions?.map((c) => <track key={c.src} kind="subtitles" src={c.src} srcLang={c.srclang} label={c.label} />)}
      </video>

      {!playing && (
        <button type="button" onClick={toggle} aria-label={t.videoPlay} tabIndex={-1} className="kr:absolute kr:inset-0 kr:m-auto kr:flex kr:size-16 kr:cursor-pointer kr:items-center kr:justify-center kr:rounded-full kr:bg-black/55 kr:text-white kr:backdrop-blur-sm kr:transition-colors kr:hover:bg-black/70">
          <Play aria-hidden className="kr:ml-1 kr:size-7" fill="currentColor" />
        </button>
      )}

      <div className="kr:absolute kr:inset-x-0 kr:bottom-0 kr:flex kr:items-center kr:gap-1 kr:bg-linear-to-t kr:from-black/75 kr:to-transparent kr:px-2 kr:pt-8 kr:pb-1.5 kr:text-white kr:transition-opacity kr:duration-200 kr:group-data-[playing]:opacity-0 kr:group-data-[playing]:group-hover:opacity-100 kr:group-data-[playing]:group-focus-within:opacity-100">
        <button type="button" onClick={toggle} aria-label={playing ? t.videoPause : t.videoPlay} className={iconButton}>
          {playing ? <Pause aria-hidden fill="currentColor" /> : <Play aria-hidden fill="currentColor" />}
        </button>
        <span className="kr:shrink-0 kr:px-1 kr:text-xs kr:tabular-nums">{formatVideoTime(time)} / {formatVideoTime(duration)}</span>
        <input
          type="range"
          aria-label={t.videoSeek}
          aria-valuetext={`${formatVideoTime(time)} / ${formatVideoTime(duration)}`}
          min={0}
          max={duration || 0}
          step={0.1}
          value={time}
          onChange={(e) => seek(Number(e.target.value))}
          className="kr:mx-1 kr:h-10 kr:min-w-0 kr:flex-1 kr:cursor-pointer kr:accent-white"
        />
        <button type="button" onClick={() => { v().muted = !v().muted; }} aria-label={muted ? t.videoUnmute : t.videoMute} className={iconButton}>
          {muted || volume === 0 ? <VolumeX aria-hidden /> : <Volume2 aria-hidden />}
        </button>
        {/* Phones set the volume with their own buttons. */}
        <input type="range" aria-label={t.videoVolume} min={0} max={1} step={0.05} value={muted ? 0 : volume} onChange={(e) => setVol(Number(e.target.value))} className="kr:hidden kr:h-10 kr:w-20 kr:cursor-pointer kr:accent-white kr:md:block" />
        {captions?.length ? (
          <button type="button" onClick={() => setCc((x) => !x)} aria-label={t.videoCaptions} aria-pressed={cc} className={cn(iconButton, cc && "kr:bg-white/20")}>
            <Captions aria-hidden />
          </button>
        ) : null}
        <button type="button" onClick={toggleFull} aria-label={full ? t.videoExitFullscreen : t.videoFullscreen} className={iconButton}>
          {full ? <Minimize aria-hidden /> : <Maximize aria-hidden />}
        </button>
      </div>
    </div>
  );
}
