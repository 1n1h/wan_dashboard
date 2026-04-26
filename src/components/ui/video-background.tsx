"use client";

import { useEffect, useRef } from "react";

export function VideoBackground({
  videoUrl,
  overlayOpacity = 0.55,
}: {
  videoUrl: string;
  overlayOpacity?: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => {
      // Autoplay can be blocked; muted+playsInline usually works on modern browsers.
    });
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        src={videoUrl}
      />
      <div
        className="absolute inset-0 bg-black"
        style={{ opacity: overlayOpacity }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-brand/20 via-transparent to-accent/15" />
    </div>
  );
}
