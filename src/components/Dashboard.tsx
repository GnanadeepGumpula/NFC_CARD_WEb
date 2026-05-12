import { motion, AnimatePresence } from "framer-motion";
import { FolderOpen, Music, Play, ExternalLink, Settings, X, Lock, Mail, Loader2 } from "lucide-react";
import type { UnlockedCard } from "@/lib/card-types";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { changeCardPin, storeCardRecoveryEmail } from "@/lib/cards.functions";

type Props = { 
  card: UnlockedCard; 
  onLogout: () => void;
  token?: string | null;
  cardId?: string;
};

export function Dashboard({ card, onLogout, token, cardId }: Props) {
  const [openSection, setOpenSection] = useState<null | "drive" | "spotify" | "video">(
    null,
  );
  const [showSettings, setShowSettings] = useState(false);
  const [changePinMode, setChangePinMode] = useState<"verify" | "new" | "confirm" | null>(null);
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinBusy, setPinBusy] = useState(false);
  const [showVideoMessage, setShowVideoMessage] = useState(false);
  const [showEmailEditor, setShowEmailEditor] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState(card.recoveryEmail || "");
  const [recoveryMsg, setRecoveryMsg] = useState<string | null>(null);
  const [recoveryBusy, setRecoveryBusy] = useState(false);
  const changePinFn = useServerFn(changeCardPin);
  const storeEmailFn = useServerFn(storeCardRecoveryEmail);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12"
    >
      {/* Hero with Settings */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <motion.div
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 90, damping: 12 }}
        className="flex flex-col items-center text-center"
      >
        <div className="relative pulse-ring rounded-full glow-cyan">
          {card.photoUrl ? (
            <img
              src={card.photoUrl}
              alt={card.studentName}
              className="h-28 w-28 sm:h-36 sm:w-36 rounded-full object-cover ring-4 ring-[color:var(--neon-cyan)]/60"
            />
          ) : (
            <div className="h-28 w-28 sm:h-36 sm:w-36 rounded-full glass-strong flex items-center justify-center text-4xl font-display">
              {card.studentName.charAt(0)}
            </div>
          )}
        </div>
        <h1
          className="mt-6 font-display font-semibold tracking-tight text-foreground"
          style={{ fontSize: "clamp(1.75rem, 5vw, 3.25rem)" }}
        >
          Welcome back,{" "}
          <span className="shimmer-text">{card.studentName.split(" ")[0]}</span>
        </h1>
        <p className="mt-2 text-fluid-body text-muted-foreground">
          Your memory portal is unlocked.
        </p>
      </motion.div>

      {/* Trio */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
        <TrioCard
          title="Memory Vault"
          subtitle="Photos & documents"
          icon={
            <motion.div
              animate={{ rotateY: [0, 12, 0, -12, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <FolderOpen className="w-12 h-12" />
            </motion.div>
          }
          glow="glow-cyan"
          accent="oklch(0.85 0.2 200)"
          url={card.driveUrl}
          delay={0.1}
        />
        <TrioCard
          title="Vibe Sync"
          subtitle="Their favorite tracks"
          icon={
            <div className="relative flex items-end gap-1 h-12">
              <Music className="w-12 h-12 absolute opacity-30" />
              <div className="flex items-end gap-1 ml-14 h-10">
                {[0, 1, 2, 3].map((i) => (
                  <motion.span
                    key={i}
                    animate={{ scaleY: [0.3, 1, 0.5, 0.9, 0.3] }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay: i * 0.15,
                      ease: "easeInOut",
                    }}
                    className="w-1.5 h-full bg-[color:var(--neon-violet)] rounded-full origin-bottom"
                  />
                ))}
              </div>
            </div>
          }
          glow="glow-violet"
          accent="oklch(0.7 0.22 295)"
          url={card.spotifyUrl}
          delay={0.2}
          onOpen={() => setOpenSection("spotify")}
          isOpen={openSection === "spotify"}
          onClose={() => setOpenSection(null)}
          embed={
            card.spotifyUrl ? <SpotifyEmbed url={card.spotifyUrl} /> : undefined
          }
        />
        <TrioCard
          title="The Cinema"
          subtitle="A moment captured"
          icon={<Play className="w-12 h-12 fill-current" />}
          glow="glow-pink"
          accent="oklch(0.75 0.22 350)"
          url={card.videoUrl}
          delay={0.3}
          customAction={() => setShowVideoMessage(true)}
        />
      </div>

      <div className="mt-10 text-center">
        <button
          onClick={onLogout}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
        >
          Lock portal
        </button>
      </div>

      {/* Video Editing Message Popup */}
      <AnimatePresence>
        {showVideoMessage && (
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
              className="glass rounded-3xl p-8 max-w-md w-full text-center"
            >
              <div className="flex justify-center mb-4">
                <div className="text-4xl">🎬</div>
              </div>
              <h2 className="font-display font-semibold text-lg mb-2">Video Under Editing</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Your video is currently being edited. We'll notify you as soon as it's ready!
              </p>
              <button
                onClick={() => setShowVideoMessage(false)}
                className="w-full px-4 py-3 bg-[color:var(--neon-cyan)] rounded-xl text-sm font-medium text-black hover:brightness-110 transition-all"
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && token && cardId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center px-6 z-50"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass rounded-3xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-semibold">Account Settings</h3>
            <button
              onClick={() => setShowSettings(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Change PIN */}
            <button
              onClick={() => {
                setChangePinMode("verify");
                setPinError(null);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors border border-white/10 hover:border-white/20 text-left"
            >
              <Lock className="w-4 h-4 text-[color:var(--neon-cyan)]" />
              <div>
                <div className="text-sm font-medium">Change PIN</div>
                <div className="text-xs text-muted-foreground">Update your security code</div>
              </div>
            </button>

            {/* Change Email (for recovery) */}
            <button
              onClick={() => {
                setShowEmailEditor((value) => !value);
                setRecoveryMsg(null);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors border border-white/10 hover:border-white/20 text-left"
            >
              <Mail className="w-4 h-4 text-[color:var(--neon-violet)]" />
              <div>
                <div className="text-sm font-medium">Recovery Email</div>
                <div className="text-xs text-muted-foreground">{card.recoveryEmail || "Set email for PIN recovery"}</div>
              </div>
            </button>

            {showEmailEditor && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                <input
                  type="email"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  placeholder="name@email.com"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[color:var(--neon-cyan)]"
                />
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      if (!token || !cardId) return;
                      if (!recoveryEmail.trim()) {
                        setRecoveryMsg("Email is required");
                        return;
                      }
                      setRecoveryBusy(true);
                      setRecoveryMsg(null);
                      const r = await storeEmailFn({
                        data: { uniqueId: cardId, token, email: recoveryEmail.trim() },
                      });
                      setRecoveryBusy(false);
                      if (r.ok) {
                        setRecoveryMsg("Recovery email updated.");
                      } else {
                        setRecoveryMsg(r.error || "Failed to update recovery email");
                      }
                    }}
                    disabled={recoveryBusy}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[color:var(--neon-cyan)] text-black text-sm font-medium disabled:opacity-50"
                  >
                    {recoveryBusy ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Save email"}
                  </button>
                  <button
                    onClick={() => {
                      setShowEmailEditor(false);
                      setRecoveryEmail(card.recoveryEmail || "");
                      setRecoveryMsg(null);
                    }}
                    className="px-4 py-2.5 rounded-xl border border-white/10 text-sm"
                  >
                    Cancel
                  </button>
                </div>
                {recoveryMsg && <p className="text-sm text-[color:var(--neon-cyan)]">{recoveryMsg}</p>}
              </div>
            )}
            </div>
          </motion.div>
        </motion.div>
        )}
      </AnimatePresence>

      {/* Change PIN Dialog */}
      {changePinMode && token && cardId && (
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-lg">Change PIN</h2>
              <button
                onClick={() => {
                  setChangePinMode(null);
                  setCurrentPin("");
                  setNewPin("");
                  setConfirmPin("");
                  setPinError(null);
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {changePinMode === "verify" && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Enter your current PIN</p>
                <input
                  type="password"
                  placeholder="••••"
                  value={currentPin}
                  onChange={(e) => {
                    setPinError(null);
                    setCurrentPin(e.target.value.slice(0, 6));
                  }}
                  maxLength={6}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[color:var(--neon-cyan)]"
                />
                {pinError && (
                  <p className="text-sm text-[color:var(--neon-pink)]">{pinError}</p>
                )}
                <button
                  onClick={() => {
                    if (currentPin.length < 4) {
                      setPinError("PIN must be at least 4 digits");
                      return;
                    }
                    setChangePinMode("new");
                  }}
                  className="w-full px-4 py-3 bg-[color:var(--neon-cyan)] rounded-xl text-sm font-medium text-black hover:brightness-110 transition-all"
                >
                  Continue
                </button>
              </div>
            )}

            {changePinMode === "new" && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Enter your new PIN (4-6 digits)</p>
                <input
                  type="password"
                  placeholder="••••"
                  value={newPin}
                  onChange={(e) => {
                    setPinError(null);
                    setNewPin(e.target.value.slice(0, 6));
                  }}
                  maxLength={6}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[color:var(--neon-cyan)]"
                />
                <button
                  onClick={() => setChangePinMode("confirm")}
                  className="w-full px-4 py-3 bg-[color:var(--neon-cyan)] rounded-xl text-sm font-medium text-black hover:brightness-110 transition-all"
                >
                  Continue
                </button>
              </div>
            )}

            {changePinMode === "confirm" && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Confirm your new PIN</p>
                <input
                  type="password"
                  placeholder="••••"
                  value={confirmPin}
                  onChange={(e) => {
                    setPinError(null);
                    setConfirmPin(e.target.value.slice(0, 6));
                  }}
                  maxLength={6}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[color:var(--neon-cyan)]"
                />
                {pinError && (
                  <p className="text-sm text-[color:var(--neon-pink)]">{pinError}</p>
                )}
                <button
                  onClick={async () => {
                    if (newPin !== confirmPin) {
                      setPinError("PINs don't match");
                      return;
                    }
                    if (newPin.length < 4) {
                      setPinError("PIN must be at least 4 digits");
                      return;
                    }
                    setPinBusy(true);
                    const result = await changePinFn({
                      data: {
                        uniqueId: cardId,
                        token,
                        currentPin,
                        newPin,
                      },
                    });
                    setPinBusy(false);
                    if (result.ok) {
                      setChangePinMode(null);
                      setCurrentPin("");
                      setNewPin("");
                      setConfirmPin("");
                      setShowSettings(false);
                      // Show success message
                      alert("PIN changed successfully!");
                    } else {
                      setPinError(result.error || "Failed to change PIN");
                    }
                  }}
                  disabled={pinBusy}
                  className="w-full px-4 py-3 bg-[color:var(--neon-cyan)] rounded-xl text-sm font-medium text-black hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {pinBusy ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Update PIN"
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}

function TrioCard({
  title,
  subtitle,
  icon,
  glow,
  accent,
  url,
  delay,
  embed,
  isOpen,
  onOpen,
  onClose,
  customAction,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  glow: string;
  accent: string;
  url: string | null;
  delay: number;
  embed?: React.ReactNode;
  isOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  customAction?: () => void;
}) {
  const disabled = !url;
  const handleClick = () => {
    if (disabled) return;
    if (customAction) return customAction();
    if (embed && onOpen && !isOpen) return onOpen();
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 90, damping: 14, delay }}
    >
      <motion.button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        whileHover={disabled ? undefined : { scale: 1.04, y: -4 }}
        whileTap={disabled ? undefined : { scale: 0.97 }}
        transition={{ type: "spring", stiffness: 300, damping: 18 }}
        className={`group glass focus-ring-tv relative w-full text-left p-6 sm:p-8 rounded-3xl overflow-hidden ${
          disabled ? "opacity-50 cursor-not-allowed" : `hover:${glow}`
        }`}
        style={{
          minHeight: "clamp(180px, 22vh, 260px)",
        }}
      >
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 0%, ${accent}30, transparent 70%)`,
          }}
        />
        <div className="relative flex flex-col h-full">
          <div style={{ color: accent }} className="mb-4">
            {icon}
          </div>
          <h3
            className="font-display font-semibold text-foreground"
            style={{ fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)" }}
          >
            {title}
          </h3>
          <p className="mt-1 text-muted-foreground text-sm sm:text-base">
            {subtitle}
          </p>
          <div className="mt-auto pt-4 flex items-center gap-2 text-sm font-medium opacity-80 group-hover:opacity-100">
            <span>{disabled ? "Not set" : "Open"}</span>
            {!disabled && <ExternalLink className="w-4 h-4" />}
          </div>
        </div>
      </motion.button>
      {embed && isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="mt-3 overflow-hidden rounded-2xl glass"
        >
          <div className="p-3">{embed}</div>
          <button
            onClick={onClose}
            className="w-full py-2 text-xs text-muted-foreground hover:text-foreground"
          >
            Close
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

function SpotifyEmbed({ url }: { url: string }) {
  // Convert open.spotify.com/track/ID → /embed/track/ID
  const embed = url.replace("open.spotify.com/", "open.spotify.com/embed/");
  return (
    <iframe
      src={embed}
      width="100%"
      height="152"
      frameBorder={0}
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
      className="rounded-xl"
      title="Spotify player"
    />
  );
}

function VideoEmbed({ url }: { url: string }) {
  // Detect if it's a YouTube URL and convert to embed URL
  let embedUrl = url;
  
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    let videoId = "";
    if (url.includes("youtube.com/watch")) {
      videoId = url.split("v=")[1]?.split("&")[0] || "";
    } else if (url.includes("youtu.be")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0] || "";
    }
    if (videoId) {
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }
  } else if (url.includes("vimeo.com")) {
    const videoId = url.split("/").pop()?.split("?")[0] || "";
    if (videoId) {
      embedUrl = `https://player.vimeo.com/video/${videoId}`;
    }
  }
  
  return (
    <iframe
      src={embedUrl}
      width="100%"
      height="315"
      frameBorder={0}
      allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
      className="rounded-xl"
      title="Video player"
    />
  );
}
