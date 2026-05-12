import { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";

export function QRCodeScanner({
  onDetected,
  onCancel,
}: {
  onDetected: (data: string) => void;
  onCancel: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualValue, setManualValue] = useState("");
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    let controls: { stop?: () => void } | null = null;
    const reader = new BrowserQRCodeReader();

    const start = async () => {
      if (!videoRef.current) return;
      setError(null);
      try {
        controls = await reader.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          (result, err) => {
            if (result) {
              onDetected(result.getText());
              return;
            }
            if (err && (err as { name?: string }).name !== "NotFoundException") {
              setError(err.message || "Failed to scan QR code");
            }
          },
        );
        setScanning(true);
      } catch (err) {
        setScanning(false);
        setError(
          err instanceof Error
            ? err.message
            : "Camera scanning is unavailable in this browser",
        );
      }
    };

    start();

    return () => {
      controls?.stop?.();
      reader.reset();
    };
  }, [onDetected]);

  const submitManual = () => {
    const value = manualValue.trim();
    if (!value) return;
    onDetected(value);
  };

  return (
    <div className="w-full">
      <div className="relative overflow-hidden rounded-2xl bg-black">
        <video ref={videoRef} className="w-full h-auto min-h-64" muted playsInline />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-56 h-56 border-2 border-white/40 rounded-lg" />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="text-center">
          {error ? (
            <div className="text-sm text-[color:var(--neon-pink)]">{error}</div>
          ) : (
            <div className="text-sm text-muted-foreground">
              {scanning ? "Point your camera at the QR code" : "Starting camera..."}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={manualValue}
            onChange={(e) => setManualValue(e.target.value)}
            placeholder="Paste card URL or card ID"
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[color:var(--neon-cyan)]"
          />
          <button
            onClick={submitManual}
            className="rounded-xl bg-[color:var(--neon-cyan)] px-4 py-3 text-sm font-medium text-black"
          >
            Open
          </button>
        </div>

        <div className="flex justify-center">
          <button onClick={onCancel} className="px-4 py-2 rounded-xl border border-white/10 text-sm">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default QRCodeScanner;
