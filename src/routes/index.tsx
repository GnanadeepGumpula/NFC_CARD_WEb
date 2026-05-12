import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sparkles, ScanLine, Shield } from "lucide-react";
import { useState } from "react";
import QRCodeScanner from "@/components/QRCodeScanner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Signatureday — NFC Personal Memory Portal" },
      {
        name: "description",
        content:
          "Tap your NFC card to unlock a private memory portal: photos, music, and video — secured with a personal PIN.",
      },
      { property: "og:title", content: "Signatureday — NFC Memory Portal" },
      {
        property: "og:description",
        content:
          "A premium glass-morphism memory portal for NFC cards. Tap, verify, remember.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [showScanner, setShowScanner] = useState(false);
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-6 py-16 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 80, damping: 14 }}
        className="text-center max-w-3xl"
      >
        <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-xs sm:text-sm text-muted-foreground mb-8">
          <Sparkles className="w-3.5 h-3.5 text-[color:var(--neon-cyan)]" />
          <span>NFC · Private · Encrypted</span>
        </div>

        <h1
          className="font-display font-semibold tracking-tight"
          style={{ fontSize: "clamp(2.5rem, 8vw, 6rem)", lineHeight: 1.05 }}
        >
          A portal to your <span className="shimmer-text">memories</span>.
        </h1>

        <p className="mt-6 text-fluid-body text-muted-foreground max-w-xl mx-auto">
          Tap a Signatureday NFC card to reveal a personal vault of photos, music, and
          video — sealed behind your own PIN.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => setShowScanner(true)}
            className="glass-strong glow-cyan focus-ring-tv inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl font-medium text-foreground hover:scale-105 transition-transform"
          >
            <ScanLine className="w-4 h-4" />
            Scan demo card
          </button>
          <Link
            to="/admin"
            className="glass focus-ring-tv inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl font-medium text-foreground/90 hover:bg-white/15 transition-colors"
          >
            <Shield className="w-4 h-4" />
            Admin
          </Link>
        </div>

        {showScanner && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md glass rounded-3xl p-6">
              <QRCodeScanner
                onDetected={(data) => {
                  // data expected to be a URL or unique id; open card if contains /card/
                  try {
                    if (data.startsWith('http')) {
                      window.location.href = data;
                      return;
                    }
                    // otherwise assume it's a card id
                    window.location.href = `/card/${encodeURIComponent(data)}`;
                  } catch (e) {
                    window.location.href = `/card/${encodeURIComponent('demo')}`;
                  }
                }}
                onCancel={() => setShowScanner(false)}
              />
            </div>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 1 }}
        className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl w-full"
      >
        {[
          { t: "Glass HUD", d: "Cinematic, frosted, neon-lit." },
          { t: "Spring physics", d: "Every motion feels alive." },
          { t: "PIN secured", d: "bcrypt + 24h JWT session." },
        ].map((f) => (
          <div
            key={f.t}
            className="glass p-5 rounded-2xl text-center sm:text-left"
          >
            <div className="font-display font-medium text-foreground">
              {f.t}
            </div>
            <div className="text-sm text-muted-foreground mt-1">{f.d}</div>
          </div>
        ))}
      </motion.div>
    </main>
  );
}
