import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  adminDeleteCard,
  adminListCards,
  adminLogin,
  adminUpsertCard,
} from "@/lib/cards.functions";
import type { AdminCardRow } from "@/lib/card-types";
import { Loader2, LogOut, Plus, Pencil, Trash2, RefreshCw, KeyRound } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin · Aura Memory Portal" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const ADMIN_TOKEN_KEY = "aura.admin.tok";

type Draft = {
  uniqueId: string;
  studentName: string;
  photoUrl: string;
  driveUrl: string;
  spotifyUrl: string;
  videoUrl: string;
};
const emptyDraft: Draft = {
  uniqueId: "",
  studentName: "",
  photoUrl: "",
  driveUrl: "",
  spotifyUrl: "",
  videoUrl: "",
};

function AdminPage() {
  const loginFn = useServerFn(adminLogin);
  const listFn = useServerFn(adminListCards);
  const upsertFn = useServerFn(adminUpsertCard);
  const deleteFn = useServerFn(adminDeleteCard);

  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [loginErr, setLoginErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [cards, setCards] = useState<AdminCardRow[] | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (t) setToken(t);
  }, []);

  const refresh = async (tok: string) => {
    const r = await listFn({ data: { token: tok } });
    if (r.cards) setCards(r.cards as AdminCardRow[]);
    else if (r.error === "Unauthorized") {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      setToken(null);
    }
  };

  useEffect(() => {
    if (token) refresh(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setLoginErr(null);
    const r = await loginFn({ data: { password } });
    setBusy(false);
    if (!r.ok) {
      setLoginErr(r.error);
      return;
    }
    localStorage.setItem(ADMIN_TOKEN_KEY, r.token);
    setToken(r.token);
    setPassword("");
  };

  const onSave = async (resetPin = false) => {
    if (!draft || !token) return;
    setBusy(true);
    const r = await upsertFn({
      data: {
        token,
        resetPin,
        card: {
          uniqueId: draft.uniqueId.trim(),
          studentName: draft.studentName.trim(),
          photoUrl: draft.photoUrl.trim() || null,
          driveUrl: draft.driveUrl.trim() || null,
          spotifyUrl: draft.spotifyUrl.trim() || null,
          videoUrl: draft.videoUrl.trim() || null,
        },
      },
    });
    setBusy(false);
    if (!r.ok) {
      alert(r.error);
      return;
    }
    setDraft(null);
    setEditingId(null);
    refresh(token);
  };

  const onDelete = async (uid: string) => {
    if (!token) return;
    if (!confirm(`Delete card ${uid}?`)) return;
    await deleteFn({ data: { token, uniqueId: uid } });
    refresh(token);
  };

  if (!token) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <motion.form
          onSubmit={onLogin}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 90, damping: 14 }}
          className="glass-strong rounded-3xl p-8 w-full max-w-sm"
        >
          <h1 className="font-display text-2xl font-semibold mb-2">
            Admin Shield
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Enter the admin password to manage cards.
          </p>
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full glass rounded-xl px-4 py-3 outline-none focus-ring-tv"
          />
          {loginErr && (
            <p className="mt-3 text-sm text-[color:var(--neon-pink)]">
              {loginErr}
            </p>
          )}
          <button
            disabled={busy}
            type="submit"
            className="mt-5 w-full glass-strong glow-cyan rounded-xl py-3 font-medium hover:scale-[1.02] transition-transform disabled:opacity-50"
          >
            {busy ? "..." : "Enter"}
          </button>
        </motion.form>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 sm:px-8 py-10 max-w-6xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-semibold">Admin Shield</h1>
          <p className="text-sm text-muted-foreground">
            Manage your NFC memory portals.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => token && refresh(token)}
            className="glass focus-ring-tv rounded-xl p-3"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              localStorage.removeItem(ADMIN_TOKEN_KEY);
              setToken(null);
            }}
            className="glass focus-ring-tv rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </header>

      <div className="mb-6">
        <button
          onClick={() => {
            setDraft({ ...emptyDraft });
            setEditingId(null);
          }}
          className="glass-strong glow-cyan rounded-2xl px-5 py-3 inline-flex items-center gap-2 hover:scale-[1.02] transition-transform"
        >
          <Plus className="w-4 h-4" /> New card
        </button>
      </div>

      {draft && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-3xl p-6 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <Field
            label="Unique ID (NFC)"
            value={draft.uniqueId}
            onChange={(v) => setDraft({ ...draft, uniqueId: v })}
            disabled={!!editingId}
            placeholder="nfc_001"
          />
          <Field
            label="Student name"
            value={draft.studentName}
            onChange={(v) => setDraft({ ...draft, studentName: v })}
            placeholder="Jane Doe"
          />
          <Field
            label="Photo URL"
            value={draft.photoUrl}
            onChange={(v) => setDraft({ ...draft, photoUrl: v })}
            placeholder="https://..."
          />
          <Field
            label="Drive URL"
            value={draft.driveUrl}
            onChange={(v) => setDraft({ ...draft, driveUrl: v })}
            placeholder="https://drive.google.com/..."
          />
          <Field
            label="Spotify URL"
            value={draft.spotifyUrl}
            onChange={(v) => setDraft({ ...draft, spotifyUrl: v })}
            placeholder="https://open.spotify.com/track/..."
          />
          <Field
            label="Video URL"
            value={draft.videoUrl}
            onChange={(v) => setDraft({ ...draft, videoUrl: v })}
            placeholder="https://..."
          />
          <div className="sm:col-span-2 flex flex-wrap justify-end gap-2 mt-2">
            <button
              onClick={() => {
                setDraft(null);
                setEditingId(null);
              }}
              className="glass rounded-xl px-4 py-2.5 text-sm"
            >
              Cancel
            </button>
            {editingId && (
              <button
                onClick={() => onSave(true)}
                disabled={busy}
                className="glass rounded-xl px-4 py-2.5 text-sm flex items-center gap-1.5 hover:bg-white/15"
              >
                <KeyRound className="w-4 h-4" /> Save & reset PIN
              </button>
            )}
            <button
              onClick={() => onSave(false)}
              disabled={busy}
              className="glass-strong glow-cyan rounded-xl px-5 py-2.5 text-sm font-medium hover:scale-[1.02] transition-transform"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
            </button>
          </div>
        </motion.div>
      )}

      {cards === null ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-[color:var(--neon-cyan)]" />
        </div>
      ) : cards.length === 0 ? (
        <div className="glass rounded-3xl p-10 text-center text-muted-foreground">
          No cards yet. Create your first one above.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((c) => (
            <div key={c.id} className="glass rounded-2xl p-5">
              <div className="flex items-center gap-3">
                {c.photo_url ? (
                  <img
                    src={c.photo_url}
                    alt={c.student_name}
                    className="w-12 h-12 rounded-full object-cover ring-1 ring-white/20"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full glass flex items-center justify-center font-display">
                    {c.student_name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{c.student_name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {c.unique_id} ·{" "}
                    {c.pin_hash ? "PIN set" : "PIN not set"}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => {
                    setEditingId(c.unique_id);
                    setDraft({
                      uniqueId: c.unique_id,
                      studentName: c.student_name,
                      photoUrl: c.photo_url ?? "",
                      driveUrl: c.drive_url ?? "",
                      spotifyUrl: c.spotify_url ?? "",
                      videoUrl: c.video_url ?? "",
                    });
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="glass rounded-lg px-3 py-1.5 text-xs flex items-center gap-1.5 hover:bg-white/15"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <a
                  href={`/card/${c.unique_id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="glass rounded-lg px-3 py-1.5 text-xs hover:bg-white/15"
                >
                  Open
                </a>
                <button
                  onClick={() => onDelete(c.unique_id)}
                  className="ml-auto glass rounded-lg px-3 py-1.5 text-xs flex items-center gap-1.5 text-[color:var(--neon-pink)] hover:bg-white/15"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="glass rounded-xl px-3.5 py-2.5 outline-none focus-ring-tv disabled:opacity-60"
      />
    </label>
  );
}
