"use client";

import { useEffect, useRef, useState } from "react";
import { Barcode, Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function BarcodeScanner({
  onDetected,
}: {
  onDetected: (code: string) => void;
}) {
  const [manual, setManual] = useState("");
  const [supported, setSupported] = useState(false);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // Feature detection lato client (window assente in SSR): pattern corretto.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupported(typeof window !== "undefined" && "BarcodeDetector" in window);
    return () => stopStream();
  }, []);

  function stopStream() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setScanning(false);
  }

  async function startScan() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      setScanning(true);
    } catch {
      setScanning(false);
    }
  }

  // Loop di rilevamento (parte quando il video è montato).
  useEffect(() => {
    if (!scanning || !videoRef.current || !streamRef.current) return;
    const video = videoRef.current;
    video.srcObject = streamRef.current;

    let detector: { detect: (v: HTMLVideoElement) => Promise<{ rawValue: string }[]> };
    try {
      // @ts-expect-error BarcodeDetector non è nei tipi standard del DOM
      detector = new window.BarcodeDetector({
        formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128"],
      });
    } catch {
      return;
    }

    let active = true;
    video.play().catch(() => {});
    const tick = async () => {
      if (!active || !streamRef.current) return;
      try {
        const codes = await detector.detect(video);
        if (codes.length > 0 && codes[0].rawValue) {
          const code = codes[0].rawValue;
          stopStream();
          onDetected(code);
          return;
        }
      } catch {
        /* frame non leggibile */
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      active = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [scanning, onDetected]);

  return (
    <div className="flex flex-col gap-fib2">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const c = manual.trim();
          if (c) onDetected(c);
        }}
        className="flex gap-fib2"
      >
        <div className="relative flex-1">
          <Barcode
            className="pointer-events-none absolute left-fib2 top-1/2 size-4 -translate-y-1/2 text-encre-2"
            aria-hidden
          />
          <Input
            type="text"
            inputMode="numeric"
            placeholder="Barcode"
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            className="metric pl-fib5"
          />
        </div>
        <Button type="submit" variant="outline">
          Cerca
        </Button>
        {supported && (
          <Button
            type="button"
            variant="outline"
            onClick={scanning ? stopStream : startScan}
            aria-label={scanning ? "Chiudi scanner" : "Scansiona con la fotocamera"}
          >
            {scanning ? <X className="size-4" /> : <Camera className="size-4" />}
          </Button>
        )}
      </form>

      {scanning && (
        <div className="relative overflow-hidden rounded-md border border-ligne bg-encre">
          <video ref={videoRef} className="w-full" playsInline muted />
          <p className="absolute inset-x-0 bottom-fib2 text-center text-xs text-beton/90">
            Inquadra il codice a barre
          </p>
        </div>
      )}
    </div>
  );
}
