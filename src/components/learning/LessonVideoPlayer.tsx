"use client";

import { useEffect, useRef, useState } from "react";
import { Gauge, Info, RotateCcw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { LessonVideo } from "@/types/learning";

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];

/**
 * Large lesson video using the browser's own controls, which already work
 * with the keyboard and screen readers: play / pause, volume, the progress
 * bar, captions and full screen. It never starts by itself.
 *
 * Adds clear speed buttons and friendly messages when the video can't load
 * or the internet connection drops.
 */
export function LessonVideoPlayer({ video, title }: { video: LessonVideo; title: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [speed, setSpeed] = useState(1);
  const [failed, setFailed] = useState(false);
  const [offline, setOffline] = useState(false);
  // Changing this remounts the <video>, which makes the browser try again.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  const changeSpeed = (value: number) => {
    setSpeed(value);
    if (videoRef.current) videoRef.current.playbackRate = value;
  };

  const retry = () => {
    setFailed(false);
    setAttempt((count) => count + 1);
  };

  return (
    <div>
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-ink shadow-card">
        {failed ? (
          <div
            role="alert"
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center text-white"
          >
            <WifiOff aria-hidden="true" className="size-10 text-accent" />
            <p className="max-w-md text-lg font-semibold sm:text-xl">
              We couldn&apos;t load this video. Please check your internet connection and try again.
            </p>
            <Button onClick={retry} variant="secondary" size="lg">
              <RotateCcw aria-hidden="true" className="size-5" />
              Try Again
            </Button>
          </div>
        ) : (
          <video
            key={attempt}
            ref={videoRef}
            controls
            playsInline
            preload="metadata"
            aria-label={`Lesson video: ${title}`}
            className="size-full"
            onLoadedMetadata={(event) => {
              event.currentTarget.playbackRate = speed;
            }}
            onRateChange={(event) => setSpeed(event.currentTarget.playbackRate)}
            onError={() => setFailed(true)}
          >
            {video.sources.map((source, index) => (
              <source
                key={source.src}
                src={source.src}
                type={source.type}
                // When every source fails, the error is reported on the last one.
                onError={index === video.sources.length - 1 ? () => setFailed(true) : undefined}
              />
            ))}
            {video.captions?.map((track) => (
              <track
                key={track.src}
                kind="captions"
                src={track.src}
                label={track.label}
                srcLang={track.srcLang}
                default={track.default}
              />
            ))}
            Your browser cannot play this video.
          </video>
        )}
      </div>

      {offline && !failed && (
        <p
          role="alert"
          className="mt-3 flex items-start gap-3 rounded-2xl border-2 border-accent bg-accent/15 p-4 text-lg text-ink"
        >
          <WifiOff aria-hidden="true" className="mt-1 size-6 shrink-0 text-[#6b4e00]" />
          You seem to be offline. The video may stop until your internet connection is back.
        </p>
      )}

      <fieldset className="mt-4 flex flex-wrap items-center gap-2">
        <legend className="sr-only">Playback speed</legend>
        <span aria-hidden="true" className="mr-1 flex w-full items-center gap-2 text-base font-semibold text-ink sm:w-auto">
          <Gauge className="size-5 text-primary" />
          Playback speed:
        </span>
        {SPEEDS.map((value) => {
          const selected = value === speed;
          return (
            <button
              key={value}
              type="button"
              aria-pressed={selected}
              onClick={() => changeSpeed(value)}
              disabled={failed}
              className={`min-h-11 flex-1 rounded-xl border-2 px-2 text-base font-semibold transition-colors disabled:opacity-60 sm:min-w-16 sm:flex-none sm:px-3 ${
                selected
                  ? "border-primary bg-primary text-white"
                  : "border-line bg-surface text-ink hover:border-primary/50 hover:bg-secondary"
              }`}
            >
              {value}×{value === 1 && <span className="sr-only"> (normal speed)</span>}
            </button>
          );
        })}
      </fieldset>

      {video.sampleCredit && (
        <p className="mt-4 flex items-start gap-2 text-base text-ink-muted">
          <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
          <span>
            <strong className="font-semibold text-ink">Sample video.</strong> The real video for this
            lesson is not ready yet, so a short stand-in clip is shown. {video.sampleCredit}
          </span>
        </p>
      )}
    </div>
  );
}
