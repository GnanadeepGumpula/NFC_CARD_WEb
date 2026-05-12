import { createFileRoute, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { resetCardPin } from "@/lib/cards.functions";

export const Route = createFileRoute("/card/$id/reset")({
  head: ({ params }) => ({
    meta: [
      { title: `Signatureday · Reset PIN ${params.id}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPage,
});

function ResetPage() {
  const { id } = useParams({ from: "/card/$id/reset" });
  const [token] = useState(() => new URLSearchParams(window.location.search).get("token") || "");
  const [newPin, setNewPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const resetFn = useServerFn(resetCardPin);

  const doReset = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setMsg(null);
    if (!token) return setMsg("Missing token in URL");
    if (newPin.length < 4) return setMsg("PIN must be at least 4 digits");
    setBusy(true);
    const r = await resetFn({ data: { uniqueId: id, token, newPin } });
    setBusy(false);
    if (r.ok) {
      setMsg("PIN updated — you can now unlock the card.");
    } else {
      setMsg(r.error || "Failed to reset PIN");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md glass-strong rounded-3xl p-6">
        <h1 className="text-2xl font-semibold mb-4">Reset PIN</h1>
        <p className="text-sm text-muted-foreground mb-4">Enter a new PIN for this card.</p>
        <form onSubmit={doReset} className="space-y-4">
          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
            placeholder="New PIN"
            className="w-full glass rounded-xl px-4 py-3 outline-none"
          />
          {msg && <p className="text-sm text-[color:var(--neon-pink)]">{msg}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full glass-strong glow-cyan rounded-xl py-3 font-medium"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Set PIN"}
          </button>
        </form>
      </div>
    </main>
  );
}
