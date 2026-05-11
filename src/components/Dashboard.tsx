import { motion } from "framer-motion";
import { FolderOpen, Music, Play, ExternalLink } from "lucide-react";
import type { UnlockedCard } from "@/lib/card-types";
import { useState } from "react";

type Props = { card: UnlockedCard; onLogout: () => void };

export function Dashboard({ card, onLogout }: Props) {
  const [openSection, setOpenSection] = useState<null | "drive" | "spotify" | "video">(
    null,
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12"
    >
      {/* Hero */}
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
}) {
  const disabled = !url;
  const handleClick = () => {
    if (disabled) return;
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
