import { createFileRoute, useParams } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import {
  getCardPublic,
  getCardWithToken,
  initializePin,
  unlockCard,
  storeCardRecoveryEmail,
} from "@/lib/cards.functions";
import { GlassKeypad } from "@/components/GlassKeypad";
import { Dashboard } from "@/components/Dashboard";
import type { PublicCard, UnlockedCard } from "@/lib/card-types";
import { Loader2, ShieldAlert, Mail, X } from "lucide-react";

export const Route = createFileRoute("/card/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Signatureday · ${params.id}` },
      { name: "description", content: "Unlock this Signatureday NFC memory portal." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CardPage,
});

const tokenKey = (id: string) => `signatureday.tok.${id}`;

function CardPage() {
  const { id } = useParams({ from: "/card/$id" });
  const getPublic = useServerFn(getCardPublic);
  const getWithToken = useServerFn(getCardWithToken);
  const initFn = useServerFn(initializePin);
  const unlockFn = useServerFn(unlockCard);

  const [publicCard, setPublicCard] = useState<PublicCard | null | undefined>(
    undefined,
  );
  const [unlocked, setUnlocked] = useState<UnlockedCard | null>(null);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [phase, setPhase] = useState<"enter" | "confirm">("enter");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [typed, setTyped] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [showEmailRecovery, setShowEmailRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryBusy, setRecoveryBusy] = useState(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const fired = useRef(false);

  // Load card & try existing token
  useEffect(() => {
    (async () => {
      const { card } = await getPublic({ data: { uniqueId: id } });
      setPublicCard(card);
      if (!card) return;
      const tok = localStorage.getItem(tokenKey(id));
      if (tok) {
        setToken(tok);
        const r = await getWithToken({ data: { uniqueId: id, token: tok } });
        if (r.card) setUnlocked(r.card);
        else localStorage.removeItem(tokenKey(id));
      }
    })();
  }, [id, getPublic, getWithToken]);

  // Typewriter welcome
  useEffect(() => {
    if (!publicCard) return;
    const name = publicCard.studentName;
    const greet = publicCard.isFirstTime
      ? `Hello, ${name}`
      : `Welcome, ${name}`;
    let i = 0;
    setTyped("");
    const t = setInterval(() => {
      i++;
      setTyped(greet.slice(0, i));
      if (i >= greet.length) clearInterval(t);
    }, 55);
    return () => clearInterval(t);
  }, [publicCard]);

  const handlePinComplete = async (value: string) => {
    if (!publicCard) return;
    setError(null);

    if (publicCard.isFirstTime) {
      if (phase === "enter") {
        setPin(value);
        setPhase("confirm");
        setConfirmPin("");
        return;
      }
      // confirm
      if (value !== pin) {
        setError("PINs don't match. Try again.");
        setPhase("enter");
        setPin("");
        setConfirmPin("");
        return;
      }
      setBusy(true);
      const r = await initFn({ data: { uniqueId: id, pin: value } });
      setBusy(false);
      if (!r.ok) {
        setError(r.error);
        setPhase("enter");
        setPin("");
        setConfirmPin("");
        return;
      }
      localStorage.setItem(tokenKey(id), r.token);
      if (!fired.current) {
        fired.current = true;
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.6 },
          colors: ["#5ce1ff", "#b682ff", "#ff6fb5", "#ffffff"],
        });
      }
      // Show email recovery setup popup FIRST - don't unlock yet
      setToken(r.token);
      setShowEmailRecovery(true);
    } else {
      setBusy(true);
      const r = await unlockFn({ data: { uniqueId: id, pin: value } });
      setBusy(false);
      if (!r.ok) {
        setError(r.error);
        setPin("");
        return;
      }
      localStorage.setItem(tokenKey(id), r.token);
      setToken(r.token);
      const got = await getWithToken({ data: { uniqueId: id, token: r.token } });
      if (got.card) setUnlocked(got.card);
    }
  };

  const maxLength = 4;
  const current = publicCard?.isFirstTime
    ? phase === "enter"
      ? pin
      : confirmPin
    : pin;
  const setCurrent = (v: string) => {
    setError(null);
    if (publicCard?.isFirstTime && phase === "confirm") setConfirmPin(v);
    else setPin(v);
    if (v.length === maxLength) handlePinComplete(v);
  };

  if (publicCard === undefined) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[color:var(--neon-cyan)]" />
      </main>
    );
  }

  if (publicCard === null) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="glass rounded-3xl p-8 sm:p-10 max-w-md text-center">
          <ShieldAlert className="w-10 h-10 mx-auto text-[color:var(--neon-pink)]" />
          <h1 className="mt-4 font-display text-2xl">Card not recognized</h1>
          <p className="mt-2 text-muted-foreground text-sm">
            The NFC card with ID <code>{id}</code> hasn't been registered. Ask
            your admin to add it.
          </p>
        </div>
      </main>
    );
  }

  if (unlocked) {
    return (
      <Dashboard
        card={unlocked}
        token={token}
        cardId={id}
        onLogout={() => {
          localStorage.removeItem(tokenKey(id));
          setUnlocked(null);
          setPin("");
          setConfirmPin("");
          setPhase("enter");
          setToken(null);
          setShowEmailRecovery(false);
          setRecoveryEmail("");
        }}
      />
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 80, damping: 14 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <h1
            className="shimmer-text font-display font-semibold"
            style={{ fontSize: "clamp(1.75rem, 6vw, 3.25rem)" }}
          >
            {typed}
            <span className="opacity-70 animate-pulse">|</span>
          </h1>
          <p className="mt-3 text-muted-foreground text-fluid-body">
            {publicCard.isFirstTime
              ? phase === "enter"
                ? "Initialize Your Secure Key"
                : "Confirm your PIN"
              : "Identity Verification Required"}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={phase + (publicCard.isFirstTime ? "f" : "r")}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
          >
            <GlassKeypad
              value={current}
              onChange={setCurrent}
              maxLength={maxLength}
            />
          </motion.div>
        </AnimatePresence>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 text-center text-sm text-[color:var(--neon-pink)]"
          >
            {error}
          </motion.p>
        )}
        {busy && (
          <div className="mt-6 flex justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-[color:var(--neon-cyan)]" />
          </div>
        )}

        {/* Reset PIN Button - Only for existing users */}
        {!publicCard?.isFirstTime && (
          <button
            onClick={() => setShowEmailRecovery(true)}
            className="mt-6 text-sm text-[color:var(--neon-cyan)] hover:text-[color:var(--neon-pink)] transition-colors underline-offset-2 hover:underline"
          >
            Forgot PIN? Reset it
          </button>
        )}
      </motion.div>

      {/* Email Recovery Setup/Reset Popup */}
      <AnimatePresence>
        {showEmailRecovery && publicCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center px-6 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass rounded-3xl p-8 max-w-md w-full"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-6 h-6 text-[color:var(--neon-cyan)]" />
                  <h2 className="font-display font-semibold text-lg">
                    {publicCard.isFirstTime ? "Secure Your Access" : "Reset PIN"}
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setShowEmailRecovery(false);
                    setRecoveryEmail("");
                    setRecoveryError(null);
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-muted-foreground mb-6">
                {publicCard.isFirstTime
                  ? "Add an email to recover your PIN if you forget it. You can skip this for now."
                  : "Enter your email to receive a PIN reset link."}
              </p>

              <input
                type="email"
                placeholder="your@email.com"
                value={recoveryEmail}
                onChange={(e) => {
                  setRecoveryError(null);
                  setRecoveryEmail(e.target.value);
                }}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[color:var(--neon-cyan)] mb-4"
              />

              {recoveryError && (
                <p className="text-sm text-[color:var(--neon-pink)] mb-4">{recoveryError}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    setShowEmailRecovery(false);
                    setRecoveryEmail("");
                    setRecoveryError(null);
                    // Now unlock the card
                    if (token) {
                      const got = await getWithToken({ data: { uniqueId: id, token } });
                      if (got.card) setUnlocked(got.card);
                    }
                  }}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-medium border border-white/10 hover:bg-white/5 transition-colors"
                >
                  {publicCard.isFirstTime ? "Skip for Now" : "Cancel"}
                </button>
                <button
                  onClick={async () => {
                    if (!recoveryEmail.trim()) {
                      setRecoveryError("Email is required");
                      return;
                    }
                    setRecoveryBusy(true);
                    const storeEmail = useServerFn(storeCardRecoveryEmail);
                    const result = await storeEmail({
                      data: { uniqueId: id, token: token || "", email: recoveryEmail },
                    });
                    setRecoveryBusy(false);
                    if (result.ok) {
                      setShowEmailRecovery(false);
                      setRecoveryEmail("");
                      // Now unlock the card
                      if (token) {
                        const got = await getWithToken({ data: { uniqueId: id, token } });
                        if (got.card) setUnlocked(got.card);
                      }
                      if (!publicCard.isFirstTime) {
                        alert("Check your email for PIN reset instructions!");
                      }
                    } else {
                      setRecoveryError(result.error || "Failed to save email");
                    }
                  }}
                  disabled={recoveryBusy}
                  className="flex-1 px-4 py-3 bg-[color:var(--neon-cyan)] rounded-xl text-sm font-medium text-black hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {recoveryBusy ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : publicCard.isFirstTime ? (
                    "Save Email"
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
