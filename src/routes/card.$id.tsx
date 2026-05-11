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
} from "@/lib/cards.functions";
import { GlassKeypad } from "@/components/GlassKeypad";
import { Dashboard } from "@/components/Dashboard";
import type { PublicCard, UnlockedCard } from "@/lib/card-types";
import { Loader2, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/card/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Aura · ${params.id}` },
      { name: "description", content: "Unlock this Aura NFC memory portal." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CardPage,
});

const tokenKey = (id: string) => `aura.tok.${id}`;

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
  const fired = useRef(false);

  // Load card & try existing token
  useEffect(() => {
    (async () => {
      const { card } = await getPublic({ data: { uniqueId: id } });
      setPublicCard(card);
      if (!card) return;
      const tok = localStorage.getItem(tokenKey(id));
      if (tok) {
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
      const got = await getWithToken({ data: { uniqueId: id, token: r.token } });
      if (got.card) setUnlocked(got.card);
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
        onLogout={() => {
          localStorage.removeItem(tokenKey(id));
          setUnlocked(null);
          setPin("");
          setConfirmPin("");
          setPhase("enter");
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
      </motion.div>
    </main>
  );
}
